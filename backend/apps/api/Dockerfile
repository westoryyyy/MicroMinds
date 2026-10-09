# Dockerfile for apps/api
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace configuration and dependency files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/

# Install dependencies (ignoring scripts)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code
COPY apps/api ./apps/api

# Build the application
RUN cd apps/api && pnpm run build

# --- Production Image ---
FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy built artifacts from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE $PORT

CMD ["node", "dist/main.js"]
