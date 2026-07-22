# ══════════════════════════════════════════════════════════════════════════════
# Multi-stage Dockerfile for the Next.js Blog CMS
#
# Stages:
#   1. deps    — install ALL npm deps (including devDeps for prisma generate)
#   2. builder — generate Prisma client + next build (standalone output)
#   3. runner  — minimal Alpine image: standalone server + prisma binary
#
# The final image is ~300-400 MB instead of ~1 GB.
# ══════════════════════════════════════════════════════════════════════════════

# ── Stage 1: Install dependencies ────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# Copy package manifests only (cache-friendly: only invalidated when they change)
COPY package.json package-lock.json ./

# Install ALL deps including devDependencies (prisma binary, tsx, etc.)
RUN npm ci


# ── Stage 2: Build the application ───────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Bring in dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# 1. Apply static site configuration
RUN node scripts/apply-config.js

# 2. Generate the Prisma client (must run before `next build` so the
#    generated types are available for TypeScript compilation)
RUN npx prisma generate

# 3. Build Next.js in standalone mode
#    Produces: .next/standalone/ (self-contained server)
#              .next/static/     (static assets)
RUN npm run build


# ── Stage 3: Minimal production image ────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Port and hostname for the standalone server
# (Can be overridden via docker-compose environment)
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV SUPABASE_URL=http://localhost:3000
ENV SUPABASE_STORAGE_PUBLIC_URL=http://localhost:3000
ENV SUPABASE_BUCKET=blog-media

# curl: needed by entrypoint.sh to wait for Storage API + create bucket
# postgresql & postgresql-client: embedded local database support + pg_isready
RUN apk add --no-cache curl postgresql postgresql-client

# Create a non-root system user/group for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Create directories for postgresql runtime, data, and uploads, owned by nextjs
RUN mkdir -p /var/lib/postgresql/data /run/postgresql /app/public/uploads && \
    chown -R nextjs:nodejs /var/lib/postgresql /run/postgresql /app/public/uploads

# ── Next.js standalone server ─────────────────────────────────────────────────
# The standalone output is self-contained: it includes a traced subset of
# node_modules. public/ and .next/static/ must be copied separately.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public

# ── Prisma, Configuration & Node Modules ──────────────────────────────────────
COPY --from=builder --chown=nextjs:nodejs /app/prisma           ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/configuration.ts ./configuration.ts
COPY --from=builder --chown=nextjs:nodejs /app/scripts          ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/node_modules     ./node_modules

# ── Entrypoint ────────────────────────────────────────────────────────────────
COPY --chown=nextjs:nodejs docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER nextjs

EXPOSE 3000

# Health check: the app must respond to HTTP on port 3000
# start-period allows time for DB migrations + bucket setup on first run
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

ENTRYPOINT ["./entrypoint.sh"]
