import { Redis } from 'ioredis';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export interface RateLimitResult {
  allowed: boolean;
  total: number;
  remaining: number;
  retryAfterSeconds: number;
  limit: number;
}

export interface RateLimiter {
  checkLimit(keyIdentifier: string): Promise<RateLimitResult>;
}

let redisClientInstance: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClientInstance) {
    if (!env.REDIS_URL) {
      throw new Error('REDIS_URL is not configured');
    }

    redisClientInstance = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      enableOfflineQueue: false,
      lazyConnect: true,
    });

    redisClientInstance.on('error', (err) => {
      // Never log connection string, auth credentials, or keys
      logger.error({ error: err.message }, 'Redis client error');
    });
  }
  return redisClientInstance;
}

export async function closeRedis(): Promise<void> {
  if (redisClientInstance) {
    try {
      await redisClientInstance.quit();
    } catch {
      redisClientInstance.disconnect();
    }
    redisClientInstance = null;
  }
}

export async function checkRedisHealth(): Promise<boolean> {
  try {
    if (!env.REDIS_URL) return false;
    const client = getRedisClient();
    const result = await client.ping();
    return result === 'PONG';
  } catch {
    return false;
  }
}

/**
 * Lua script for atomic O(1) fixed-window rate limiting.
 * Returns [current_count, remaining_ttl_seconds].
 */
const RATE_LIMIT_LUA_SCRIPT = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('TTL', KEYS[1])
return {current, ttl}
`;

export class RedisRateLimiter implements RateLimiter {
  private customClient?: Redis;
  private readonly maxLimit: number;
  private readonly windowSeconds: number;
  private readonly keyPrefix: string;

  constructor(options?: {
    client?: Redis;
    maxLimit?: number;
    windowSeconds?: number;
    keyPrefix?: string;
  }) {
    this.customClient = options?.client;
    this.maxLimit = options?.maxLimit ?? env.CONTACT_RATE_LIMIT_MAX;
    this.windowSeconds = options?.windowSeconds ?? env.CONTACT_RATE_LIMIT_WINDOW_SECONDS;
    this.keyPrefix = options?.keyPrefix ?? 'contact:ratelimit:';
  }

  private get client(): Redis {
    return this.customClient ?? getRedisClient();
  }

  async checkLimit(keyIdentifier: string): Promise<RateLimitResult> {
    const key = `${this.keyPrefix}${keyIdentifier}`;

    try {
      const result = (await this.client.eval(
        RATE_LIMIT_LUA_SCRIPT,
        1,
        key,
        this.windowSeconds.toString(),
      )) as [number, number];

      const total = Number(result[0]);
      const ttl = Number(result[1]);
      const retryAfterSeconds = Math.max(1, ttl > 0 ? ttl : this.windowSeconds);
      const remaining = Math.max(0, this.maxLimit - total);
      const allowed = total <= this.maxLimit;

      return {
        allowed,
        total,
        remaining,
        retryAfterSeconds,
        limit: this.maxLimit,
      };
    } catch (err: unknown) {
      // In accordance with security-first architecture (Phase 5 requirement 24),
      // Redis failures in production must fail closed rather than silently bypassing rate limits.
      const errorMsg = err instanceof Error ? err.message : 'Unknown Redis error';
      logger.error({ error: errorMsg }, 'Redis rate limiter execution failure');
      throw new Error('RATE_LIMIT_SERVICE_UNAVAILABLE');
    }
  }
}

/**
 * Deterministic in-memory rate limiter for testing and offline development.
 */
export class InMemoryRateLimiter implements RateLimiter {
  private readonly records = new Map<string, { count: number; expiresAt: number }>();
  private readonly maxLimit: number;
  private readonly windowSeconds: number;

  constructor(options?: { maxLimit?: number; windowSeconds?: number }) {
    this.maxLimit = options?.maxLimit ?? env.CONTACT_RATE_LIMIT_MAX;
    this.windowSeconds = options?.windowSeconds ?? env.CONTACT_RATE_LIMIT_WINDOW_SECONDS;
  }

  async checkLimit(keyIdentifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.records.get(keyIdentifier);

    if (!entry || entry.expiresAt <= now) {
      const expiresAt = now + this.windowSeconds * 1000;
      this.records.set(keyIdentifier, { count: 1, expiresAt });
      return {
        allowed: true,
        total: 1,
        remaining: this.maxLimit - 1,
        retryAfterSeconds: this.windowSeconds,
        limit: this.maxLimit,
      };
    }

    entry.count += 1;
    const ttlSeconds = Math.max(1, Math.ceil((entry.expiresAt - now) / 1000));
    const allowed = entry.count <= this.maxLimit;
    const remaining = Math.max(0, this.maxLimit - entry.count);

    return {
      allowed,
      total: entry.count,
      remaining,
      retryAfterSeconds: ttlSeconds,
      limit: this.maxLimit,
    };
  }

  reset(): void {
    this.records.clear();
  }
}
