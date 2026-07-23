# Docker Self-Hosting Guide — Blog CMS

This guide explains how to run the entire Blog CMS stack locally using Docker Compose, with no cloud dependencies.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Generating Secrets](#generating-secrets)
- [Environment Variables Reference](#environment-variables-reference)
- [Architecture Overview](#architecture-overview)
- [Managing Containers](#managing-containers)
- [Updating Containers](#updating-containers)
- [Backup & Restore PostgreSQL](#backup--restore-postgresql)
- [Backup Uploaded Media](#backup-uploaded-media)
- [Deploying to Cloud](#deploying-to-cloud-vercel--railway--vps)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Minimum Version | Install |
|---|---|---|
| Docker | 24.0+ | https://docs.docker.com/get-docker/ |
| Docker Compose | v2 (plugin) | Included with Docker Desktop |

Verify your installation:
```bash
docker --version          # Docker version 24.x+
docker compose version    # Docker Compose version v2.x+
```

---

## Single-Command Run (Zero Configuration)

You can pull and run the blog CMS instantly without setting up databases or `.env` files:

```bash
docker run -d -p 3000:3000 --name blog thesukhjitbajwa/blog:latest
```

Access the app at **http://localhost:3000**.
- **Admin Email**: `admin@example.com`
- **Admin Password**: `changeme123`

To persist data across container restarts:
```bash
docker run -d -p 3000:3000 -v blog_data:/var/lib/postgresql/data --name blog thesukhjitbajwa/blog:latest
```

---

## Full Stack Setup (Docker Compose + Supabase Studio)

### 1. Generate your `.env` file

```bash
npm run setup
```

This auto-generates all cryptographic secrets. See [Generating Secrets](#generating-secrets) for details.

### 2. Set the two environment-specific values

Open `.env` and fill in:

```env
NEXTAUTH_URL=http://localhost:3000
SUPABASE_STORAGE_PUBLIC_URL=http://localhost:8000
```

### 3. Start the stack

```bash
docker compose up -d
```

Docker Compose will:
1. Pull all Supabase service images (~2 GB, first run only)
2. Build the Next.js app image
3. Start PostgreSQL and wait until it's healthy
4. Start all Supabase services
5. Run `prisma migrate deploy` automatically
6. Create the `blog-media` storage bucket automatically
7. Start the Next.js CMS

### 4. Access your services

| Service | URL |
|---|---|
| **Blog CMS** | http://localhost:3000 |
| **Supabase Studio** | http://localhost:3001 |
| **Supabase API (Kong)** | http://localhost:8000 |

**Default admin credentials** (created by the Prisma seed on first run):
- Email: `admin@example.com`
- Password: `changeme123`

> ⚠️ Change the admin password immediately after your first login.

### 5. Watch the logs

```bash
docker compose logs -f app     # Next.js CMS
docker compose logs -f db      # PostgreSQL
docker compose logs -f storage # Storage API
```

---

## Generating Secrets

All secrets are generated automatically by the setup script:

```bash
npm run setup
```

This single command:
1. Reads `.env.example` as a template
2. Generates `NEXTAUTH_SECRET`, `POSTGRES_PASSWORD`, `DATABASE_URL`, `JWT_SECRET`
3. Generates `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_KEY` as properly signed HS256 JWTs
4. Writes a ready-to-use `.env` file

**Then open `.env` and set the two remaining values** (these depend on your environment):

| Variable | Local Docker | Production VPS |
|---|---|---|
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://yourdomain.com` |
| `SUPABASE_STORAGE_PUBLIC_URL` | `http://localhost:8000` | `http://your-server-ip:8000` |

That's it. No external tools needed, no copy-pasting from dashboards.

### Script commands

```bash
npm run setup         # first-time setup — skips if .env already exists
npm run setup:fresh   # regenerate all secrets and overwrite existing .env
npm run setup:show    # print all generated values without writing any file
```

> ⚠️ **Never regenerate secrets on a running stack.** The `POSTGRES_PASSWORD` and `JWT_SECRET` are baked into the database and signed tokens — changing them requires wiping and reseeding the database.

---

## Environment Variables Reference

### Required for All Deployments

| Variable | Description |
|---|---|
| `NEXTAUTH_SECRET` | Secret for signing NextAuth JWT sessions |
| `NEXTAUTH_URL` | Public URL of the CMS app |
| `DATABASE_URL` | PostgreSQL connection string (used by Prisma) |
| `SUPABASE_URL` | **Server-side** Supabase API URL (internal Docker: `http://kong:8000`) |
| `SUPABASE_SERVICE_KEY` | Service role JWT (bypasses RLS — server-side only) |
| `SUPABASE_BUCKET` | Storage bucket name (default: `blog-media`) |

### Docker-Only Variables

| Variable | Description |
|---|---|
| `POSTGRES_PASSWORD` | PostgreSQL superuser password |
| `JWT_SECRET` | Master secret for all Supabase JWT tokens |
| `SUPABASE_ANON_KEY` | Anon JWT (for PostgREST / Studio) |
| `SUPABASE_STORAGE_PUBLIC_URL` | **Browser-accessible** URL for uploaded images (e.g. `http://localhost:8000`) |

### Cloud vs Docker Values

| Variable | Cloud (Supabase.com) | Docker (local) |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres` | `postgresql://postgres:...@db:5432/postgres` |
| `SUPABASE_URL` | `https://<ref>.supabase.co` | `http://kong:8000` |
| `SUPABASE_STORAGE_PUBLIC_URL` | *(not needed — same as SUPABASE_URL)* | `http://localhost:8000` |
| `SUPABASE_SERVICE_KEY` | From Supabase Dashboard → Settings → API | JWT signed with your `JWT_SECRET` |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        supabase_net (Docker bridge network)     │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │    db    │    │   auth   │    │   rest   │    │   meta   │  │
│  │ postgres │    │  gotrue  │    │postgrest │    │pg-meta   │  │
│  │  :5432   │    │  :9999   │    │  :3000   │    │  :8080   │  │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘  │
│       │               │               │               │         │
│       └───────────────┴──────┬────────┴───────────────┘         │
│                              │                                   │
│  ┌──────────┐    ┌───────────▼──┐    ┌──────────┐               │
│  │ imgproxy │    │     kong     │    │ storage  │               │
│  │  :8080   │◄───│  API gateway │◄───│  :5000   │               │
│  └──────────┘    │    :8000     │    └──────────┘               │
│                  └──────┬───────┘                               │
│                         │                                       │
│  ┌──────────┐    ┌──────▼───────┐    ┌──────────┐               │
│  │  studio  │    │     app      │    │          │               │
│  │  :3000   │    │  Next.js CMS │    │          │               │
│  │(→3001)   │    │   :3000      │    │          │               │
│  └──────────┘    └──────────────┘    └──────────┘               │
└─────────────────────────────────────────────────────────────────┘
         │                  │
    localhost:3001    localhost:3000
    (Studio)         (Blog CMS)
```

**Data flow for image uploads:**
1. Browser → `POST /api/upload` (Next.js CMS)
2. CMS server → `PUT http://kong:8000/storage/v1/object/blog-media/<file>` (internal)
3. Kong → Storage API → writes to `storage-data` volume
4. CMS returns `http://localhost:8000/storage/v1/object/public/blog-media/<file>`
5. Browser loads image directly from Kong (port 8000)

---

## Managing Containers

### View all container statuses
```bash
docker compose ps
```

### Stop all containers (data is preserved)
```bash
docker compose stop
```

### Start all stopped containers
```bash
docker compose start
```

### Restart a single service
```bash
docker compose restart app
```

### View logs
```bash
docker compose logs -f          # all services
docker compose logs -f app      # Next.js only
docker compose logs -f storage  # Storage API only
```

### Open a shell in the app container
```bash
docker compose exec app sh
```

### Open a PostgreSQL shell
```bash
docker compose exec db psql -U postgres
```

### Run the Prisma seed manually
```bash
docker compose exec app node_modules/.bin/prisma db seed
```

### Destroy everything (⚠️ deletes all data)
```bash
docker compose down -v
```

---

## Updating Containers

### Update the Next.js app (rebuild from source)
```bash
docker compose build app
docker compose up -d app
```

### Update a Supabase service image
```bash
# Edit the image tag in docker-compose.yml, then:
docker compose pull <service>
docker compose up -d <service>
```

### Update the entire stack
```bash
docker compose pull
docker compose build app
docker compose up -d
```

> ℹ️ `prisma migrate deploy` runs automatically on app startup, so database migrations are applied on every update.

---

## Backup & Restore PostgreSQL

### Backup (pg_dump)

```bash
# Full database dump (recommended format: custom = compressed, restorable)
docker compose exec db pg_dump \
  -U postgres \
  --format=custom \
  --no-acl \
  --no-owner \
  postgres > "backup-$(date +%Y%m%d-%H%M%S).dump"
```

### Restore (pg_restore)

```bash
# ⚠️ This will REPLACE all existing data
docker compose exec -T db pg_restore \
  -U postgres \
  --clean \
  --if-exists \
  --no-acl \
  --no-owner \
  -d postgres < your-backup.dump
```

### Scheduled automatic backups

Add this to your crontab (`crontab -e`) on the host machine:

```cron
# Daily backup at 02:00, keep last 7 days
0 2 * * * cd /path/to/blog && docker compose exec db pg_dump -U postgres --format=custom postgres > backups/$(date +\%Y\%m\%d).dump && find backups/ -name "*.dump" -mtime +7 -delete
```

---

## Backup Uploaded Media

Uploaded images are stored in the `storage-data` Docker volume.

### Find the volume location on disk
```bash
docker volume inspect blog-cms_storage-data
# Look for "Mountpoint" in the output
```

### Copy volume contents to a local directory
```bash
# Create a backup using a temporary Alpine container
docker run --rm \
  -v blog-cms_storage-data:/source:ro \
  -v "$(pwd)/media-backup":/dest \
  alpine \
  cp -r /source/. /dest/
```

### Restore from backup
```bash
docker run --rm \
  -v "$(pwd)/media-backup":/source:ro \
  -v blog-cms_storage-data:/dest \
  alpine \
  cp -r /source/. /dest/
```

---

## Deploying to Cloud (Vercel / Railway / VPS)

This app is designed to work identically on cloud and Docker. The only difference is environment variables.

### Vercel

1. Push your code to GitHub.
2. Import the repo in Vercel.
3. Set environment variables in Vercel Dashboard → Settings → Environment Variables:

```
NEXTAUTH_SECRET=<your secret>
NEXTAUTH_URL=https://yourdomain.com
DATABASE_URL=postgresql://postgres:<pass>@<host>:5432/postgres
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SERVICE_KEY=<your service key>
SUPABASE_BUCKET=blog-media
```

> Note: `SUPABASE_STORAGE_PUBLIC_URL` is not needed for Vercel — it falls back to `SUPABASE_URL` which is the same for both internal and external access on Supabase Cloud.

### Railway

1. Connect your GitHub repo to Railway.
2. Add a PostgreSQL database add-on (or use Supabase Cloud).
3. Set the same environment variables as above.
4. Railway auto-detects the `Dockerfile` and builds from it.

### VPS (Docker on a server)

1. Copy your project files to the server.
2. Create a `.env` file with production values.
3. Update `SUPABASE_STORAGE_PUBLIC_URL` to your server's IP or domain:
   ```
   SUPABASE_STORAGE_PUBLIC_URL=http://your-server-ip:8000
   ```
4. Run:
   ```bash
   docker compose -f docker-compose.yml up -d
   ```
   (omit the override file in production to avoid exposing internal ports)

---

## Troubleshooting

### `prisma migrate deploy` fails on startup

Check that the database is healthy:
```bash
docker compose ps db
docker compose logs db
```

If the db container is starting for the first time, it runs initialisation scripts (~30 seconds). The app container will retry automatically.

### Storage API returns 401 / 403

Your `SUPABASE_SERVICE_KEY` does not match the `JWT_SECRET`. Regenerate both keys using the same secret.

### Images don't load in the browser

Check `SUPABASE_STORAGE_PUBLIC_URL` in `.env`. It must be the URL your **browser** can reach Kong on (not the internal Docker URL `http://kong:8000`).

For local Docker: `SUPABASE_STORAGE_PUBLIC_URL=http://localhost:8000`

### Studio shows empty database

Studio connects to PostgREST, which uses the `public` schema by default. Your Prisma tables are in `public` — they should appear in the Table Editor. If not, check `PGRST_DB_SCHEMAS` includes `public`.

### Port 3000 already in use

Either stop the conflicting process or change the app port:
```bash
# In .env:
NEXTAUTH_URL=http://localhost:3002

# In docker-compose.override.yml:
services:
  app:
    ports:
      - "3002:3000"
```

### Full reset (wipe all data and start fresh)

```bash
docker compose down -v    # stops containers AND removes volumes
docker compose up -d      # fresh start
```
