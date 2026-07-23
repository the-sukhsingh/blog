#!/bin/sh
# ══════════════════════════════════════════════════════════════════════════════
# entrypoint.sh — Docker container startup script for the Blog CMS
#
# Zero-Config & Self-Contained Deployment Support:
#   1. Auto-generates runtime secrets (NEXTAUTH_SECRET, SUPABASE_SERVICE_KEY).
#   2. Checks for external PostgreSQL. If not reachable or not provided,
#      automatically starts embedded local PostgreSQL inside the container.
#   3. Runs database migrations and seeds initial admin account.
#   4. Auto-configures Supabase Storage integration and initializes bucket.
#   5. Starts Next.js standalone server with embedded Supabase Storage API.
# ══════════════════════════════════════════════════════════════════════════════
set -e

export PORT="${PORT:-3000}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"
export NODE_ENV="${NODE_ENV:-production}"

# ── 0. Default Environment Variables ──────────────────────────────────────────
if [ -z "$NEXTAUTH_SECRET" ]; then
  export NEXTAUTH_SECRET="auto-gen-$(head -c 16 /dev/urandom 2>/dev/null | md5sum | cut -d' ' -f1 2>/dev/null || echo 'default-secret-key-please-change-in-production')"
  echo "🔑 NEXTAUTH_SECRET auto-generated for session."
fi

if [ -z "$NEXTAUTH_URL" ]; then
  export NEXTAUTH_URL="http://localhost:${PORT}"
fi

# ── 1. PostgreSQL Connection Setup ───────────────────────────────────────────
POSTGRES_HOST="${POSTGRES_HOST:-127.0.0.1}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-postgres}"

USE_LOCAL_POSTGRES=0

# If an external database host was provided (and isn't 127.0.0.1/localhost)
if [ "$POSTGRES_HOST" != "127.0.0.1" ] && [ "$POSTGRES_HOST" != "localhost" ]; then
  echo "⏳ Checking external PostgreSQL at ${POSTGRES_HOST}:${POSTGRES_PORT}..."
  RETRIES=5
  DB_CONNECTED=0
  while [ $RETRIES -gt 0 ]; do
    if pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -q 2>/dev/null; then
      DB_CONNECTED=1
      break
    fi
    RETRIES=$((RETRIES - 1))
    echo "  Waiting for external PostgreSQL (${RETRIES} retries left)..."
    sleep 2
  done

  if [ "$DB_CONNECTED" = "1" ]; then
    echo "✅ Connected to external PostgreSQL at ${POSTGRES_HOST}:${POSTGRES_PORT}."
  else
    echo "⚠️  Could not connect to external PostgreSQL at ${POSTGRES_HOST}:${POSTGRES_PORT}."
    echo "📦 Falling back to embedded local PostgreSQL inside container..."
    USE_LOCAL_POSTGRES=1
    POSTGRES_HOST="127.0.0.1"
  fi
else
  USE_LOCAL_POSTGRES=1
fi

# ── Embedded PostgreSQL Setup ────────────────────────────────────────────────
if [ "$USE_LOCAL_POSTGRES" = "1" ]; then
  echo "🚀 Initializing embedded PostgreSQL..."
  PGDATA="/var/lib/postgresql/data"

  if [ ! -f "$PGDATA/PG_VERSION" ]; then
    echo "⚙️  Initializing database cluster in $PGDATA..."
    initdb -D "$PGDATA" -U "$POSTGRES_USER" --auth=trust >/dev/null
  fi

  postgres -D "$PGDATA" -k /run/postgresql -p "$POSTGRES_PORT" -c listen_addresses='127.0.0.1' >/tmp/postgres.log 2>&1 &

  until pg_isready -h 127.0.0.1 -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -q 2>/dev/null; do
    sleep 1
  done

  # Ensure target database exists
  psql -h 127.0.0.1 -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$POSTGRES_DB" || \
    createdb -h 127.0.0.1 -p "$POSTGRES_PORT" -U "$POSTGRES_USER" "$POSTGRES_DB" 2>/dev/null || true

  echo "✅ Embedded PostgreSQL is ready."
fi

# Set DATABASE_URL for Prisma
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"
fi

# ── 2. Run Prisma migrations ──────────────────────────────────────────────────
echo "🔄 Applying database migrations..."
PGPASSWORD="${POSTGRES_PASSWORD}" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) PRIMARY KEY NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);
' >/dev/null 2>&1 || true

node_modules/.bin/prisma migrate deploy
echo "✅ Database migrations up to date."

# ── 2b. Seed initial admin user if empty ──────────────────────────────────────
echo "🌱 Checking database seed..."
node_modules/.bin/tsx prisma/seed.ts || true

# ── 3. Auto-Configure Supabase Integration ─────────────────────────────────────
export SUPABASE_BUCKET="${SUPABASE_BUCKET:-blog-media}"
export SUPABASE_URL="${SUPABASE_URL:-http://localhost:${PORT}}"
export SUPABASE_STORAGE_PUBLIC_URL="${SUPABASE_STORAGE_PUBLIC_URL:-$SUPABASE_URL}"

if [ -z "$SUPABASE_SERVICE_KEY" ]; then
  export JWT_SECRET="${JWT_SECRET:-super-secret-jwt-key-for-blog-cms-32-chars}"
  export SUPABASE_SERVICE_KEY=$(node -e '
    const crypto = require("crypto");
    const secret = process.env.JWT_SECRET;
    const b64url = (v) => Buffer.from(typeof v === "string" ? v : JSON.stringify(v)).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    const h = b64url({ alg: "HS256", typ: "JWT" });
    const p = b64url({ role: "service_role", iss: "supabase", iat: 1700000000, exp: 2000000000 });
    const s = crypto.createHmac("sha256", secret).update(`${h}.${p}`).digest("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    console.log(`${h}.${p}.${s}`);
  ')
  echo "🔑 SUPABASE_SERVICE_KEY auto-configured."
fi

# ── 4. Start the Next.js application ─────────────────────────────────────────
echo "----------------------------------------------------------------"
echo "🚀 Blog CMS running on http://localhost:${PORT}"
echo "🪣 Supabase Storage API active on http://localhost:${PORT}/storage/v1"
echo "👤 Admin Login: admin@example.com / changeme123"
echo "----------------------------------------------------------------"
exec node server.js
