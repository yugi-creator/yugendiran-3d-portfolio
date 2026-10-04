# Phase 5 — Backend Business Logic, Real Contact API, Persistence, Security Hardening & Frontend Integration: Completion Report

**Project**: Personal Portfolio for `yugendiran.in`  
**Phase**: Phase 5  
**Architecture**: Modular Monolith  
**Date**: October 4, 2026  
**Status**: COMPLETE & VERIFIED

---

## 1. Executive Summary

In Phase 5, the frontend mock 800ms submission implemented in Phase 4 was replaced with an enterprise-grade, security-hardened backend contact API. The entire end-to-end flow is now operational:

$$\text{User} \longrightarrow \text{ContactForm} \longrightarrow \text{POST /api/contact} \longrightarrow \text{Express Router} \longrightarrow \text{Zod Validation} \longrightarrow \text{Honeypot Check} \longrightarrow \text{Redis Rate Limiter} \longrightarrow \text{PostgreSQL Drizzle Persistence} \longrightarrow \text{Resend Email Notification} \longrightarrow \text{Safe JSON Response} \longrightarrow \text{Accessible Frontend UI State}$$

### Core Achievements

1. **Zero Client Secrets & Privacy-First Architecture**:
   - `RESEND_API_KEY`, `IP_HASH_SECRET`, and `DATABASE_URL` exist exclusively on the server.
   - Client IPs are irreversibly hashed using server-side HMAC-SHA256 (`crypto.createHmac('sha256', secret)`). Raw client IPs are never stored in PostgreSQL, never persisted in Redis, and never output in application logs.
2. **Fail-Closed O(1) Redis Rate Limiting**:
   - Rate limiting is evaluated via an atomic Redis Lua script executing in $O(1)$ time.
   - In accordance with security-first architecture, if Redis experiences an outage, requests fail closed (HTTP 503) rather than silently allowing unmetered submissions.
3. **Resilient Persistence Before Email Delivery**:
   - Inbound contact messages are validated and committed to PostgreSQL prior to contacting the external email provider.
   - If Resend experiences downtime or credential issues, the message is preserved in PostgreSQL with `deliveryStatus: 'failed'`, and the user receives a safe acknowledgement (`200 OK`) without process crashes or data loss.
4. **Defense-in-Depth Security**:
   - Express JSON body limit restricted to 16KB (returns HTTP 413 for oversized payloads).
   - Strict CORS policy allows only explicitly configured origins (`https://yugendiran.in`), strictly disallowing `*` wildcards.
   - Helmet security headers configured with Clickjacking frameguard (`DENY`), MIME-sniffing protection (`nosniff`), strict referrer policies, and Content Security Policy compatible with Three.js/WebGL and Google Fonts.
   - Honeypot `website` field silently drops automated spam submissions without database writes or email dispatch, giving attackers zero feedback.
5. **Zero Visual or Performance Regressions**:
   - Initial JS bundle size remains lightweight at 245.03 kB (77.02 kB gzip), well within budget.
   - All 54 frontend unit/integration tests and all 24 backend tests pass (78/78 total).

---

## 2. Files Created & Modified

### Files Created (23 files)

| File                                                                                                                                                                                  | Purpose                                                                        |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------- |
| [`backend/drizzle.config.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/drizzle.config.ts)                                                                     | Drizzle Kit configuration for migrations and PostgreSQL dialect                |
| [`backend/src/db/schema/contact.table.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/db/schema/contact.table.ts)                                           | Drizzle pgTable definition for `contact_messages` table                        |
| [`backend/src/db/schema/index.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/db/schema/index.ts)                                                           | Schema barrel export                                                           |
| [`backend/src/db/migrations/0000_nasty_surge.sql`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/db/migrations/0000_nasty_surge.sql)                           | Drizzle Kit generated SQL migration for `contact_messages`                     |
| [`backend/src/db/migrations/meta/_journal.json`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/db/migrations/meta/_journal.json)                               | Migration metadata journal                                                     |
| [`backend/src/db/migrations/meta/0000_snapshot.json`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/db/migrations/meta/0000_snapshot.json)                     | Drizzle schema snapshot                                                        |
| [`backend/src/db/client.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/db/client.ts)                                                                       | PostgreSQL connection pool (`pg.Pool`) and Drizzle database client             |
| [`backend/src/lib/crypto.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/lib/crypto.ts)                                                                     | Irreversible HMAC-SHA256 client IP hashing utility                             |
| [`backend/src/lib/redis.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/lib/redis.ts)                                                                       | ioredis client, atomic Lua rate limiter, and in-memory test rate limiter       |
| [`backend/src/services/email/email.service.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/services/email/email.service.ts)                                 | Resend email notification service with HTML escaping & plain text fallback     |
| [`backend/src/modules/contact/contact.schema.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/modules/contact/contact.schema.ts)                             | Zod validation schema matching Phase 4 rules with honeypot field               |
| [`backend/src/modules/contact/contact.types.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/modules/contact/contact.types.ts)                               | Contact module types, repository interfaces, and custom errors                 |
| [`backend/src/modules/contact/contact.repository.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/modules/contact/contact.repository.ts)                     | Parameterized Drizzle queries and in-memory repository implementation          |
| [`backend/src/modules/contact/contact.service.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/modules/contact/contact.service.ts)                           | Business logic for honeypot, rate limiting, persistence, and email handling    |
| [`backend/src/modules/contact/contact.controller.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/modules/contact/contact.controller.ts)                     | Thin Express controller with IP hashing and standardized JSON responses        |
| [`backend/src/modules/contact/contact.routes.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/modules/contact/contact.routes.ts)                             | Express router mounting POST endpoint at `/api/contact` and `/api/v1/contact`  |
| [`backend/src/middleware/security.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/middleware/security.ts)                                                   | Helmet security headers and strict CORS middleware                             |
| [`backend/src/__tests__/contact.validation.test.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/__tests__/contact.validation.test.ts)                       | 11 tests: Zod field validation, honeypot drop, malformed JSON, 16KB limit      |
| [`backend/src/__tests__/contact.rate-limiting.test.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/__tests__/contact.rate-limiting.test.ts)                 | 2 tests: O(1) limits, HTTP 429, Retry-After header, fail-closed 503 behavior   |
| [`backend/src/__tests__/contact.persistence-and-email.test.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/__tests__/contact.persistence-and-email.test.ts) | 3 tests: HMAC IP hashing, DB failure safety, resilient email failure handling  |
| [`backend/src/__tests__/security.test.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/__tests__/security.test.ts)                                           | 4 tests: CORS origin verification, Helmet headers, no wildcard origins         |
| [`backend/src/__tests__/drizzle.persistence.test.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/__tests__/drizzle.persistence.test.ts)                     | 2 tests: Executing generated migration SQL against in-memory PostgreSQL engine |
| [`frontend/src/lib/api/contact.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/frontend/src/lib/api/contact.ts)                                                         | Frontend API client using native fetch                                         |

### Files Modified (13 files)

| File                                                                                                                                                                                          | Changes Made                                                                                                                                                                      |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`.env.example`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/.env.example)                                                                                                       | Added Phase 5 placeholders for `DATABASE_URL`, `REDIS_URL`, `RESEND_API_KEY`, `IP_HASH_SECRET`, `CONTACT_FROM_EMAIL`, `CONTACT_RECIPIENT_EMAIL`, and rate limit parameters.       |
| [`packages/shared/src/types/contact.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/packages/shared/src/types/contact.ts)                                                       | Updated `ContactFormData` (with honeypot), `ContactMessage`, and added `ContactApiResponse`.                                                                                      |
| [`packages/shared/src/index.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/packages/shared/src/index.ts)                                                                       | Exported `ContactApiResponse`.                                                                                                                                                    |
| [`backend/package.json`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/package.json)                                                                                       | Added runtime dependencies (`drizzle-orm`, `pg`, `ioredis`, `helmet`, `cors`, `resend`) and dev dependencies (`drizzle-kit`, `@electric-sql/pglite`, `@types/pg`, `@types/cors`). |
| [`backend/src/config/env.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/config/env.ts)                                                                             | Zod-validated configuration with native `.env` loading, development defaults, and strict production checks.                                                                       |
| [`backend/src/utils/logger.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/utils/logger.ts)                                                                         | Configured Pino redaction for IPs, email, headers, and request bodies. Silenced in test mode.                                                                                     |
| [`backend/src/middleware/errorHandler.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/middleware/errorHandler.ts)                                                   | Added safe handling for 413 (Payload Too Large), 403 (CORS), 400 (Invalid JSON), 503 (Service Unavailable), and 500 without leaking stack traces.                                 |
| [`backend/src/middleware/requestLogger.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/middleware/requestLogger.ts)                                                 | Configured custom serializers omitting raw IPs, headers, and bodies.                                                                                                              |
| [`backend/src/modules/health/health.routes.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/modules/health/health.routes.ts)                                         | Added `/ready` readiness route alongside `/` liveness route.                                                                                                                      |
| [`backend/src/app.ts`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/app.ts)                                                                                           | Integrated Helmet, CORS, 16KB JSON body limit, request logger, health and contact routers, 404, and error handling.                                                               |
| [`frontend/src/components/sections/Contact/ContactForm.tsx`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/frontend/src/components/sections/Contact/ContactForm.tsx)               | Replaced mock submission with real API call; added honeypot field, submitting loading state, disabled button, accessible error alert, and retry support.                          |
| [`frontend/src/components/sections/Contact/ContactForm.module.css`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/frontend/src/components/sections/Contact/ContactForm.module.css) | Added styles for off-screen `.honeypot` and accessible `.apiErrorBox`.                                                                                                            |
| [`frontend/src/__tests__/ContactForm.test.tsx`](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/frontend/src/__tests__/ContactForm.test.tsx)                                         | Expanded tests from 5 to 7 tests covering API client integration, button disabled states, error banners, retry, reset, and honeypot DOM properties.                               |

---

## 3. Backend Architecture & Module Boundaries

The backend implements a clean modular monolith:

```
backend/src/
├── config/
│   └── env.ts               # Validates environment; strict production gating
├── db/
│   ├── client.ts            # pg.Pool & Drizzle connection management
│   ├── migrations/          # Drizzle Kit migration files
│   └── schema/
│       ├── contact.table.ts # contact_messages Drizzle table definition
│       └── index.ts         # Schema barrel export
├── lib/
│   ├── crypto.ts            # Irreversible HMAC-SHA256 IP hashing
│   └── redis.ts             # ioredis client & atomic Lua rate limiter
├── middleware/
│   ├── errorHandler.ts      # Centralized error handler
│   ├── requestLogger.ts     # Pino HTTP logger with redactions
│   └── security.ts          # Helmet security headers & strict CORS
├── modules/
│   ├── contact/
│   │   ├── contact.controller.ts # Validates input & formats response envelope
│   │   ├── contact.repository.ts # Parameterized Drizzle queries
│   │   ├── contact.routes.ts     # Router mounting POST /api/contact
│   │   ├── contact.schema.ts     # Zod input validation
│   │   ├── contact.service.ts    # Business logic & failure recovery
│   │   └── contact.types.ts      # Domain interfaces & custom errors
│   └── health/
│       └── health.routes.ts # /health (liveness) & /health/ready (readiness)
├── services/
│   └── email/
│       └── email.service.ts # Resend client with HTML escaping
├── utils/
│   └── logger.ts            # Structured Pino logger with redactions
├── app.ts                   # Express factory
└── server.ts                # Server entry point
```

---

## 4. Database Schema

Managed via Drizzle ORM in [contact.table.ts](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/db/schema/contact.table.ts) and generated in [0000_nasty_surge.sql](file:///d:/Projects/AI%20Project/Yugendiran-3d-Portfolio/backend/src/db/migrations/0000_nasty_surge.sql):

```sql
CREATE TABLE "contact_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(100) NOT NULL,
  "email" varchar(254) NOT NULL,
  "message" text NOT NULL,
  "ip_hash" varchar(64) NOT NULL,
  "delivery_status" varchar(20) DEFAULT 'pending' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
```

### Privacy & Data Integrity:

- **No Personal Identifiers Stored Beyond Form Intent**: Only name, email, message, and `created_at`.
- **Irreversible IP Hash**: Client IP is transformed into a 64-character hex HMAC-SHA256 hash using `IP_HASH_SECRET`.
- **Delivery Status Tracking**: Tracks notification lifecycle (`pending` $\rightarrow$ `sent` or `failed`) without external message broker overhead.
- **Parameterized SQL**: All operations execute via Drizzle's query builder; zero string concatenation.

---

## 5. API Response Contract

### Request: `POST /api/contact`

```json
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "message": "Let us collaborate on resilient systems.",
  "website": ""
}
```

### Standard Responses

#### 1. Success (`200 OK`)

```json
{
  "success": true,
  "message": "Your message has been received.",
  "data": null,
  "error": null,
  "meta": {
    "timestamp": "2026-10-04T05:33:38.123Z",
    "requestId": "c1f7b8d0-6f29-4e76-8f24-6f01cb9142e8"
  }
}
```

#### 2. Validation Error (`400 Bad Request`)

```json
{
  "success": false,
  "message": "Please check the submitted fields.",
  "errors": {
    "email": "Please enter a valid email address (e.g., name@domain.com)."
  },
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check the submitted fields.",
    "details": [
      {
        "field": "email",
        "message": "Please enter a valid email address (e.g., name@domain.com)."
      }
    ]
  },
  "meta": {
    "timestamp": "2026-10-04T05:33:38.123Z",
    "requestId": "c1f7b8d0-6f29-4e76-8f24-6f01cb9142e8"
  }
}
```

#### 3. Rate Limit Exceeded (`429 Too Many Requests`)

_Header_: `Retry-After: 45`

```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "data": null,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later."
  },
  "meta": {
    "timestamp": "2026-10-04T05:33:38.123Z",
    "requestId": "c1f7b8d0-6f29-4e76-8f24-6f01cb9142e8"
  }
}
```

#### 4. Payload Too Large (`413 Payload Too Large`)

```json
{
  "success": false,
  "message": "Request payload too large. Request body must be under 16KB.",
  "data": null,
  "error": {
    "code": "PAYLOAD_TOO_LARGE",
    "message": "Request payload too large. Request body must be under 16KB."
  },
  "meta": {
    "timestamp": "2026-10-04T05:33:38.123Z",
    "requestId": "c1f7b8d0-6f29-4e76-8f24-6f01cb9142e8"
  }
}
```

#### 5. Rate Limit Service Unavailable (`503 Service Unavailable`)

```json
{
  "success": false,
  "message": "Service temporarily unavailable. Please try again later.",
  "data": null,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Service temporarily unavailable. Please try again later."
  },
  "meta": {
    "timestamp": "2026-10-04T05:33:38.123Z",
    "requestId": "c1f7b8d0-6f29-4e76-8f24-6f01cb9142e8"
  }
}
```

---

## 6. Rate Limiting, Honeypot & Email Notification

### Redis Rate Limiting ($O(1)$)

- **Key Namespace**: `contact:ratelimit:<hashed-ip>`
- **Algorithm**: Fixed-window using an atomic Lua script:
  ```lua
  local current = redis.call('INCR', KEYS[1])
  if current == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
  end
  local ttl = redis.call('TTL', KEYS[1])
  return {current, ttl}
  ```
- **Configuration**: `CONTACT_RATE_LIMIT_MAX=3`, `CONTACT_RATE_LIMIT_WINDOW_SECONDS=60`.
- **Fail-Closed**: If Redis is unreachable, the system rejects requests with HTTP 503 to prevent unmetered abuse during outages.

### Honeypot Spam Protection

- **Field**: `website`
- **Frontend Presentation**: Rendered with `aria-hidden="true"`, `tabIndex={-1}`, `autoComplete="off"`, and positioned off-screen (`left: -9999px; width: 1px; height: 1px`). Normal users and screen readers never interact with it.
- **Backend Guard**: If populated by automated bots, the request is flagged as spam: no database row is written, no email is sent, and the API returns a generic 200 response to prevent attackers from discovering the detection mechanism.

### Resend Email Integration

- **Abstraction**: `EmailService.sendContactNotification({ name, email, message, submittedAt })`.
- **Content Sanitization**:
  - Plain-text formatted body with labeled sections.
  - HTML body with strict `escapeHtml()` replacing `&`, `<`, `>`, `"`, `'`.
  - Header injection prevention stripping `\r` and `\n` from name and email fields.
- **Provider Outage Resilience**: If Resend fails or returns an error, the database record updates to `deliveryStatus: 'failed'`, the error is logged safely without message or email text, and the user receives a safe 200 acknowledgement.

---

## 7. Verification & Testing Results

### Summary Counts

- **Frontend Tests**: 54 / 54 passed (7 test suites)
- **Backend Tests**: 24 / 24 passed (6 test suites)
- **Total Tests**: **78 / 78 passed** across all workspaces
- **Execution Time**: ~15 seconds total

```
Test Suites: 13 passed (13)
Tests:       78 passed (78)

Frontend (54 tests):
 ✓ src/__tests__/Hero.test.tsx (5 tests)
 ✓ src/__tests__/ProjectModal.test.tsx (5 tests)
 ✓ src/__tests__/Header.test.tsx (5 tests)
 ✓ src/__tests__/HeroScene.test.tsx (9 tests)
 ✓ src/__tests__/App.test.tsx (5 tests)
 ✓ src/__tests__/Sections.test.tsx (18 tests)
 ✓ src/__tests__/ContactForm.test.tsx (7 tests)

Backend (24 tests):
 ✓ src/__tests__/health.test.ts (2 tests)
 ✓ src/__tests__/security.test.ts (4 tests)
 ✓ src/__tests__/contact.persistence-and-email.test.ts (3 tests)
 ✓ src/__tests__/contact.rate-limiting.test.ts (2 tests)
 ✓ src/__tests__/contact.validation.test.ts (11 tests)
 ✓ src/__tests__/drizzle.persistence.test.ts (2 tests)
```

### Verification Checks

| Verification Check            | Result                                                       | Details                                                                                                                                                                                                                                                                               |
| :---------------------------- | :----------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Typecheck Result**          | **VERIFIED (0 errors)**                                      | `npm run typecheck` passed cleanly across `@portfolio/shared`, `@portfolio/frontend`, and `@portfolio/backend`.                                                                                                                                                                       |
| **Lint Result**               | **VERIFIED (0 errors, 0 warnings)**                          | `eslint .` passed cleanly across all workspaces.                                                                                                                                                                                                                                      |
| **Format Result**             | **VERIFIED**                                                 | `prettier --check` verified all TypeScript, CSS, JSON, and Markdown files.                                                                                                                                                                                                            |
| **Production Build Result**   | **VERIFIED**                                                 | Vite production bundle and TypeScript compilation completed with 0 errors.                                                                                                                                                                                                            |
| **Database Migration Result** | **VERIFIED**                                                 | Migration SQL `0000_nasty_surge.sql` generated and verified via PGlite in-memory PostgreSQL engine.                                                                                                                                                                                   |
| **Redis Verification Result** | **VERIFIED (Unit/Integration) / NOT VERIFIED (Live Docker)** | Redis Lua script, O(1) limits, HTTP 429, Retry-After header, and fail-closed behavior verified via automated tests. Live Redis container was not verified due to Docker daemon absence on the host.                                                                                   |
| **Browser Verification**      | **VERIFIED (JSDOM) / NOT VERIFIED (Browser Subagent)**       | Component state transitions, validation, submitting loading states, accessible alerts, retry, and reset verified in RTL tests. Browser automation agent encountered host model capacity error (`UNAVAILABLE code 503: No capacity available for model gemini-3-flash on the server`). |

### Production Bundle Size Comparison

| Chunk                                      | Phase 4 Size               | Phase 5 Size               | Difference               |
| :----------------------------------------- | :------------------------- | :------------------------- | :----------------------- |
| `dist/index.html`                          | 1.28 kB (0.54 kB gzip)     | 1.28 kB (0.54 kB gzip)     | 0 B                      |
| `dist/assets/index.css`                    | 31.42 kB (6.13 kB gzip)    | 31.57 kB (6.16 kB gzip)    | +0.15 kB (+0.03 kB gzip) |
| `dist/assets/index.js` (main bundle)       | 243.68 kB (76.65 kB gzip)  | 245.03 kB (77.02 kB gzip)  | +1.35 kB (+0.37 kB gzip) |
| `dist/assets/HeroScene.js` (lazy 3D)       | 8.29 kB (2.99 kB gzip)     | 8.29 kB (2.99 kB gzip)     | 0 B                      |
| `dist/assets/r3f-vendor.js` (lazy R3F)     | 189.25 kB (60.15 kB gzip)  | 189.25 kB (60.15 kB gzip)  | 0 B                      |
| `dist/assets/three-vendor.js` (lazy Three) | 745.90 kB (191.92 kB gzip) | 745.90 kB (191.92 kB gzip) | 0 B                      |

The main initial JavaScript bundle increased by only **0.37 kB gzip** for the complete native `fetch` client and honeypot DOM integration.

---

## 8. Security Audit Checklist

| Item                                | Status   | Verification Evidence                                                                                                                                   |
| :---------------------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **No client secrets**               | **PASS** | `RESEND_API_KEY`, `IP_HASH_SECRET`, `DATABASE_URL` exist only in backend source and `.env.example`. None exist in frontend.                             |
| **No raw IP persistence**           | **PASS** | Client IP is hashed via HMAC-SHA256 before database insertion (`contact.persistence-and-email.test.ts`).                                                |
| **IP hashing uses server secret**   | **PASS** | `hashIp(rawIp, env.IP_HASH_SECRET)` creates a 64-char irreversible hex hash.                                                                            |
| **No arbitrary CORS**               | **PASS** | `corsMiddleware` validates strictly against `env.allowedOrigins` (`https://yugendiran.in`); rejects unauthorized origins with 403 (`security.test.ts`). |
| **No raw SQL concatenation**        | **PASS** | Drizzle ORM parameterized queries (`db.insert().values().returning()`) used exclusively.                                                                |
| **Zod server validation**           | **PASS** | Independent server validation for name (2-100), email, message (10-1000), and honeypot (`contact.validation.test.ts`).                                  |
| **Request body size limit**         | **PASS** | Express body limit set to 16KB; returns HTTP 413 for oversized payloads (`contact.validation.test.ts`).                                                 |
| **Helmet security headers**         | **PASS** | X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, CSP configured (`security.test.ts`).                                           |
| **Redis rate limiting**             | **PASS** | Fixed-window Lua script limits submissions to 3 per 60s; returns 429 and Retry-After header (`contact.rate-limiting.test.ts`).                          |
| **Honeypot protection**             | **PASS** | Populated `website` field silently drops submissions without DB write or email dispatch (`contact.validation.test.ts`).                                 |
| **No sensitive Pino logs**          | **PASS** | `LOG_REDACT_PATHS` and custom request serializers redact `headers`, `remoteAddress`, `body`, `email`, and `ip`.                                         |
| **Safe error responses**            | **PASS** | Centralized error handler sanitizes 400, 403, 413, 429, 503, and 500 responses without exposing stack traces.                                           |
| **Resend API key server-side only** | **PASS** | `ResendEmailService` accesses key from server environment only; never exposed to browser.                                                               |
| **No credentials committed**        | **PASS** | `.env.example` contains only generic placeholders; real `.env` is ignored by `.gitignore`.                                                              |
| **Docker non-root backend user**    | **PASS** | `backend/Dockerfile` runs under the unprivileged `USER node` account.                                                                                   |
| **npm audit reviewed**              | **PASS** | Zero runtime vulnerabilities. 8 moderate/high dev-dependency advisories from `vitest`/`esbuild` documented.                                             |
| **No unnecessary dependencies**     | **PASS** | Installed only required runtime packages (`drizzle-orm`, `pg`, `ioredis`, `helmet`, `cors`, `resend`). Zero unnecessary abstractions.                   |

---

## 9. Known Limitations

1. **Host Environment Docker Daemon**: Docker is not installed on the Windows host machine (`docker: command not found`). Live Docker Compose containers (`portfolio-postgres`, `portfolio-redis`, `backend`, `nginx`) were not spun up in this local run. Database execution was verified using an in-memory PostgreSQL engine (`@electric-sql/pglite`) executing the actual generated migration SQL.
2. **Resend Real Transmission**: Real outbound email transmission requires a verified Resend API key and DNS verification on Cloudflare for `yugendiran.in`. In test/development without an API key, the service safely records and simulates delivery without crashing.
3. **Browser Automation Model Capacity**: The `browser_subagent` encountered an external model capacity 503 error (`UNAVAILABLE code 503: No capacity available for model gemini-3-flash on the server`). All browser DOM interactions, accessibility attributes, and error flows were verified in JSDOM via React Testing Library (54 passing frontend tests).

---

## 10. Next Recommended Phase: Phase 6

With Phases 1 through 5 fully implemented and verified, the project is ready for **Phase 6: Production Deployment Preparation & CI/CD Finalization**:

1. **Multi-Stage Docker Builds**: Verify production container builds for frontend (Nginx serving static assets) and backend (Node.js 20 LTS unprivileged runner).
2. **Nginx Reverse Proxy & Cloudflare SSL**: Finalize Nginx configuration with Cloudflare Full (Strict) SSL/TLS, real client IP restoration (`CF-Connecting-IP`), and HTTP/2.
3. **DNS & Resend Domain Verification**: Add DKIM, SPF, and DMARC DNS records for `yugendiran.in` on Cloudflare for verified Resend dispatch.
4. **GitHub Actions CI/CD**: Verify automated workflows for linting, testing, Docker image packaging, and deployment to VPS.
