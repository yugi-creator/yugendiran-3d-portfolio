# Multi-stage build for production backend
FROM node:20-slim AS build
WORKDIR /app

# Copy workspace root and package files for dependency resolution
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY backend/package.json backend/
RUN npm ci

# Copy source and compile TypeScript
COPY tsconfig.base.json ./
COPY packages/shared/ packages/shared/
COPY backend/ backend/
RUN npm run build -w @portfolio/backend

# Production stage — minimal hardened image
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Non-root user for security
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY backend/package.json backend/
RUN npm ci --omit=dev

# Copy compiled output, migration SQL files, and shared types
COPY packages/shared/src/ packages/shared/src/
COPY --from=build /app/backend/dist/ backend/dist/
COPY backend/src/db/migrations/ backend/dist/db/migrations/
COPY backend/src/db/migrations/ backend/src/db/migrations/

# Set ownership to unprivileged user
RUN chown -R appuser:appgroup /app

USER appuser
EXPOSE 3001

# Healthcheck for container status
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3001/health/ready').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "backend/dist/server.js"]
