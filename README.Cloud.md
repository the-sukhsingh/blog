# ☁️ Custom Serving & Cloud Deployment Guide (Vercel / Netlify / Custom Host with Supabase Cloud)

This Blog CMS gives you complete freedom to deploy either:
1. **Self-Hosted Docker Stack** (Docker Compose with local Supabase Postgres & Storage).
2. **Cloud Serverless / Custom Host** (Vercel, Netlify, Render, AWS, Railway) connected to **Cloud Supabase** (Managed Supabase Database + Storage).

---

## 📋 Prerequisites for Cloud Supabase

1. Create a free account at [Supabase.com](https://supabase.com).
2. Create a new project in the Supabase Dashboard.
3. Obtain your credentials from **Project Settings**:
   - **Database Connection String**: Found under **Project Settings -> Database -> Connection String (URI)**.
     - Direct: `postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres`
     - Transaction / Session Pooler: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`
   - **Supabase URL**: Found under **Project Overview** (`https://<project-ref>.supabase.co`)
   - **Service Role Secret Key**: Found under **Project Settings -> API -> `service_role` (secret)** key.

---

## 🛠️ Step-by-Step Deployment Guide

### Step 1: Configure Environment Variables

Create or update your `.env` file (or set environment variables in Vercel / Netlify dashboard):

```env
# ── App & NextAuth ────────────────────────────────────────────────────────────
NEXTAUTH_SECRET=your-random-32-character-secret
NEXTAUTH_URL=https://your-app-domain.vercel.app  # or http://localhost:3000

# ── Cloud Supabase Database ───────────────────────────────────────────────────
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true

# ── Cloud Supabase Storage ────────────────────────────────────────────────────
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-secret-key
SUPABASE_BUCKET=blog-media
```

---

### Step 2: Run the Cloud Setup Script

Run the automated setup script to deploy database migrations, verify/create the `blog-media` public storage bucket, and seed the default admin account:

```bash
npm run setup:cloud
```

This script will:
1. Validate your Cloud Supabase connection credentials.
2. Run `npx prisma migrate deploy` to create all database tables in Supabase Cloud.
3. Automatically create the public `blog-media` bucket in Supabase Cloud Storage (if not already present).
4. Run `npx tsx prisma/seed.ts` to create the initial admin user (`admin@example.com` / `changeme123`).

---

### Step 3: Deploy to Vercel / Netlify / Custom Host

#### Deploying to Vercel
1. Import your GitHub repository in Vercel.
2. In **Environment Variables**, add the variables configured in **Step 1**:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `DATABASE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `SUPABASE_BUCKET` (optional, defaults to `blog-media`)
3. Click **Deploy**.
   > **Note**: During build, Vercel automatically runs `prebuild` (`npm run config:apply`), ensuring your static content from [`configuration.ts`](file:///e:/Projects/blog/configuration.ts) is compiled into the site.

---

## 🔑 Default Admin Account

After seeding, log in to the admin panel at `/admin/login`:
- **Email**: `admin@example.com`
- **Password**: `changeme123`
