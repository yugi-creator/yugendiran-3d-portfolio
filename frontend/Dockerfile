# Multi-stage build for frontend production assets
# Stage 1: Build
FROM node:20-slim AS build
WORKDIR /app

# Copy package manifests for workspace dependency resolution
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY frontend/package.json frontend/
RUN npm ci

# Copy source code and build production assets
COPY tsconfig.base.json ./
COPY packages/shared/ packages/shared/
COPY frontend/ frontend/
RUN npm run build -w @portfolio/frontend

# Stage 2: Minimal runtime Nginx image
FROM nginx:1.27-alpine AS runtime
WORKDIR /usr/share/nginx/html

# Remove default static files
RUN rm -rf ./*

# Copy compiled frontend dist assets from builder stage
COPY --from=build /app/frontend/dist/ ./
COPY docker/nginx/frontend-nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
