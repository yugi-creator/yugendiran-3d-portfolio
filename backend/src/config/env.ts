import { z } from 'zod';

// Load .env file natively in Node 20 if present
try {
  process.loadEnvFile?.();
} catch {
  // .env file is optional (e.g. in container environments or CI)
}

/** Treats empty strings (e.g. `KEY=` in .env) as "not set". */
const optionalString = (schema: z.ZodString) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema.optional());

const hasControlChars = (str: string): boolean => {
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code <= 31 || code === 127) return true;
  }
  return false;
};

const DEV_DEFAULT_DB_URL = 'postgresql://portfolio:dev_password@localhost:5432/portfolio';
const DEV_DEFAULT_REDIS_URL = 'redis://:dev_password@localhost:6379';
const DEV_DEFAULT_IP_HASH_SECRET = 'dev_ip_hash_secret_at_least_32_characters_long_portfolio';

const envSchema = z
  .object({
    PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    /** Comma-separated list of exact browser origins allowed to call the API. */
    ALLOWED_ORIGIN: z.string().default('https://yugendiran.in'),
    /** Number of trusted reverse-proxy hops in front of Express (Nginx = 1). */
    TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(1),

    DATABASE_URL: optionalString(z.string().url()),
    REDIS_URL: optionalString(z.string().url()),
    /** Server-side secret used to HMAC client IPs before storage / rate-limit keys. */
    IP_HASH_SECRET: optionalString(z.string().min(32)),

    RESEND_API_KEY: optionalString(z.string().min(1)),
    /** Verified Resend sender, e.g. `Portfolio Contact <contact@yugendiran.in>`. */
    CONTACT_FROM_EMAIL: optionalString(z.string().min(3).max(200)),
    CONTACT_RECIPIENT_EMAIL: optionalString(z.string().email().max(254)),

    CONTACT_RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(100).default(3),
    CONTACT_RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().min(1).max(86_400).default(60),
  })
  .superRefine((env, ctx) => {
    const origins = env.ALLOWED_ORIGIN.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    if (origins.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['ALLOWED_ORIGIN'],
        message: 'At least one origin is required',
      });
    }

    for (const origin of origins) {
      let parsed: URL | null = null;
      try {
        parsed = new URL(origin);
      } catch {
        parsed = null;
      }
      // Must be an exact origin (scheme://host[:port]) — never a wildcard or a path.
      if (!parsed || parsed.origin !== origin) {
        ctx.addIssue({
          code: 'custom',
          path: ['ALLOWED_ORIGIN'],
          message: `"${origin}" is not an exact origin (expected scheme://host[:port], no wildcard or path)`,
        });
        continue;
      }
      if (env.NODE_ENV === 'production' && parsed.protocol !== 'https:') {
        ctx.addIssue({
          code: 'custom',
          path: ['ALLOWED_ORIGIN'],
          message: `"${origin}" must use https in production`,
        });
      }
    }

    if (env.CONTACT_FROM_EMAIL && hasControlChars(env.CONTACT_FROM_EMAIL)) {
      ctx.addIssue({
        code: 'custom',
        path: ['CONTACT_FROM_EMAIL'],
        message: 'Must not contain control characters',
      });
    }

    // In production, data stores, hash secrets and Resend are mandatory
    if (env.NODE_ENV === 'production') {
      for (const key of [
        'DATABASE_URL',
        'REDIS_URL',
        'IP_HASH_SECRET',
        'RESEND_API_KEY',
        'CONTACT_FROM_EMAIL',
        'CONTACT_RECIPIENT_EMAIL',
      ] as const) {
        if (!env[key]) {
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message: `${key} is required in production`,
          });
        }
      }
      if (env.IP_HASH_SECRET === DEV_DEFAULT_IP_HASH_SECRET) {
        ctx.addIssue({
          code: 'custom',
          path: ['IP_HASH_SECRET'],
          message: 'Must not use the default dev secret in production',
        });
      }
    }
  })
  .transform((env) => ({
    ...env,
    DATABASE_URL:
      env.DATABASE_URL || (env.NODE_ENV === 'development' ? DEV_DEFAULT_DB_URL : env.DATABASE_URL),
    REDIS_URL:
      env.REDIS_URL || (env.NODE_ENV === 'development' ? DEV_DEFAULT_REDIS_URL : env.REDIS_URL),
    IP_HASH_SECRET:
      env.IP_HASH_SECRET ||
      (env.NODE_ENV === 'development'
        ? DEV_DEFAULT_IP_HASH_SECRET
        : env.IP_HASH_SECRET || DEV_DEFAULT_IP_HASH_SECRET),
    allowedOrigins: env.ALLOWED_ORIGIN.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  }));

export type Env = z.infer<typeof envSchema>;

/**
 * Parses and validates an environment source. Exported for unit tests.
 * Error output lists variable names and reasons only — never secrets.
 */
export function parseEnv(
  source: NodeJS.ProcessEnv,
): { success: true; data: Env } | { success: false; issues: string[] } {
  const result = envSchema.safeParse(source);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    issues: result.error.issues.map(
      (issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`,
    ),
  };
}

function validateEnv(): Env {
  const result = parseEnv(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:\n  - ' + result.issues.join('\n  - '));
    process.exit(1);
  }

  return result.data;
}

export const env = validateEnv();
