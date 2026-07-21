#!/bin/sh
# ══════════════════════════════════════════════════════════════════════════════
# entrypoint.sh — Docker container startup script for the Blog CMS
#
# Responsibilities (in order):
#   1. Wait for PostgreSQL to be reachable
#   2. Apply any pending Prisma migrations (idempotent)
#   3. If Supabase storage is configured, wait for the Storage API then
#      create the media bucket (idempotent — safe to run on every startup)
#   4. Start the Next.js standalone server
# ══════════════════════════════════════════════════════════════════════════════
set -e

# ── 1. Wait for PostgreSQL ────────────────────────────────────────────────────
POSTGRES_HOST="${POSTGRES_HOST:-db}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"

echo "⏳ Waiting for PostgreSQL at ${POSTGRES_HOST}:${POSTGRES_PORT}..."
until pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -q; do
  sleep 2
done
echo "✅ PostgreSQL is ready."

# ── 2. Run Prisma migrations ──────────────────────────────────────────────────
# `prisma migrate deploy` applies all pending migrations in prisma/migrations/.
# It is safe to run on every startup — already-applied migrations are skipped.
echo "🔄 Applying database migrations..."
node_modules/.bin/prisma migrate deploy
echo "✅ Migrations applied."

# ── 3. Set up Supabase Storage bucket (optional) ──────────────────────────────
SUPABASE_URL="${SUPABASE_URL:-}"
SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_KEY:-}"
SUPABASE_BUCKET="${SUPABASE_BUCKET:-blog-media}"

if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_SERVICE_KEY" ]; then
  echo "🪣 Setting up storage bucket '${SUPABASE_BUCKET}'..."

  # Wait for the Storage API to become available (it starts after Kong)
  RETRIES=30
  STORAGE_READY=0
  while [ $RETRIES -gt 0 ]; do
    HTTP_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" \
      "${SUPABASE_URL}/storage/v1/bucket" \
      -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" 2>/dev/null || echo "000")

    if [ "$HTTP_STATUS" = "200" ]; then
      STORAGE_READY=1
      break
    fi

    RETRIES=$((RETRIES - 1))
    echo "  Storage API not ready yet (HTTP ${HTTP_STATUS}), retrying... (${RETRIES} left)"
    sleep 3
  done

  if [ "$STORAGE_READY" = "0" ]; then
    echo "⚠️  Storage API did not become available. Bucket setup skipped."
    echo "   You can create the '${SUPABASE_BUCKET}' bucket manually in Supabase Studio."
  else
    # Create the bucket — 201 = created, 409 = already exists (both OK)
    RESP=$(curl -sf -o /dev/null -w "%{http_code}" \
      -X POST "${SUPABASE_URL}/storage/v1/bucket" \
      -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
      -H "Content-Type: application/json" \
      -d "{\"id\":\"${SUPABASE_BUCKET}\",\"name\":\"${SUPABASE_BUCKET}\",\"public\":true}" \
      2>/dev/null || echo "000")

    case "$RESP" in
      200|201) echo "✅ Storage bucket '${SUPABASE_BUCKET}' created." ;;
      409)     echo "✅ Storage bucket '${SUPABASE_BUCKET}' already exists." ;;
      *)       echo "⚠️  Bucket creation returned HTTP ${RESP}. Check Storage API logs." ;;
    esac
  fi
fi

# ── 4. Start the Next.js application ─────────────────────────────────────────
echo "🚀 Starting Next.js CMS on port ${PORT:-3000}..."
exec node server.js
