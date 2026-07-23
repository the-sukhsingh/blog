# 🚀 Blog CMS — Modern Next.js Publishing Platform

A modern, distraction-free Blog CMS built with **Next.js 16 (App Router)**, **TypeScript**, **Prisma ORM 7**, and **Supabase** (Self-Hosted Docker or Cloud).

Designed with clean typography, responsive light/dark themes, an administrative management dashboard, rich text editing via TipTap, and zero-config deployment options.

---

## 📌 Choose Your Setup Scenario

Select one of the three setup methods below based on your workflow and infrastructure preferences:

- 🐳 **[Scenario 1: Complete Docker Stack (App + DB + Storage)](#-scenario-1-complete-docker-stack-app--db--storage)** — Run everything locally or on a VPS using Docker & Docker Compose (`thesukhjitbajwa/blog:latest`).
- ⚡ **[Scenario 2: Docker App + Supabase Cloud (DB + Storage)](#-scenario-2-docker-app--supabase-cloud-db--storage)** — Run the Next.js application container locally via Docker, connected to managed Cloud Supabase.
- 💻 **[Scenario 3: Local Node.js Development (No Docker)](#-scenario-3-local-nodejs-development--supabase-cloud-no-docker)** — Run Next.js directly on your local machine using Node.js, connected to Cloud Supabase.

---

## 🔑 How to Get Supabase Credentials (For Scenarios 2 & 3)

If you are using **Supabase Cloud** for your Database and Object Storage, follow these steps to collect your required API credentials:

1. **Sign Up / Log In**: Go to [Supabase.com](https://supabase.com) and sign in or create an account.
2. **Create a Project**: Click **New Project**, select an organization, name your project, set a secure database password, and select your region.
3. **Get Database Connection String (`DATABASE_URL`)**:
   - Navigate to **Project Settings** ⚙️ ➔ **Database**.
   - Scroll to **Connection String** and select **URI**.
   - Copy the URI string:
     - **Direct Connection**: `postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@db.[project-ref].supabase.co:5432/postgres`
     - **Session / Transaction Pooler** (Recommended for serverless / Next.js): `postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`
   - *Replace `[YOUR-PASSWORD]` with the database password you set during project creation.*
4. **Get Supabase Project URL (`SUPABASE_URL` & `SUPABASE_STORAGE_PUBLIC_URL`)**:
   - Navigate to **Project Settings** ⚙️ ➔ **API**.
   - Under **Project URL**, copy the URL (e.g., `https://<project-ref>.supabase.co`).
5. **Get Supabase API Keys**:
   - In **Project Settings** ⚙️ ➔ **API** ➔ **Project API keys**:
     - **`service_role` (secret)**: Copy this key for `SUPABASE_SERVICE_KEY` *(bypasses RLS, used by the server to manage storage buckets)*.
     - **`anon` (public)**: Copy this key for `SUPABASE_ANON_KEY`.

---

## 🐳 Scenario 1: Complete Docker Stack (App + DB + Storage)

Use this scenario if you want to run the **entire platform** — Next.js Application, PostgreSQL Database, Supabase Storage, Kong API Gateway, and Supabase Studio — inside Docker without installing external dependencies.

> 📦 **Docker Image**: Uses official pre-built image **`thesukhjitbajwa/blog:latest`**.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/) installed on your system.

### Step 1: Clone Repository & Create `.env` File
```bash
git clone https://github.com/the-sukhsingh/blog.git
cd blog
cp .env.example .env
```

*(Optional) Generate fresh production secrets automatically:*
```bash
npm run setup
```

### Step 2: Configure `docker-compose.yml` to use `thesukhjitbajwa/blog:latest`
In [`docker-compose.yml`](file:///e:/Projects/blog/docker-compose.yml), update the `app` service to use the Docker image `thesukhjitbajwa/blog:latest`:

```yaml
  app:
    image: thesukhjitbajwa/blog:latest
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
      kong:
        condition: service_healthy
    # ... rest of app configuration
```

### Step 3: Start the Docker Stack
```bash
docker compose up -d
```

### Step 4: Access Application Services
Once containers start up (database migrations and seeding run automatically):

| Service | Access URL | Description |
| :--- | :--- | :--- |
| **Public Blog** | `http://localhost:3000` | Reader interface & homepage |
| **Admin Panel** | `http://localhost:3000/admin` | Article, media, & comment management |
| **Supabase Studio** | `http://localhost:3001` | Database GUI & Table Editor |
| **Kong API Gateway** | `http://localhost:8000` | Storage & Auth API Gateway |

---

## ⚡ Scenario 2: Docker App + Supabase Cloud (DB + Storage)

Use this scenario if you want to run the **Next.js application in Docker** using **`thesukhjitbajwa/blog:latest`**, but store database records and media files in **Cloud Supabase**.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed.
- Node.js & npm (for running the setup script once).

### Step 1: Clone Repository & Install Dependencies
```bash
git clone https://github.com/the-sukhsingh/blog.git
cd blog
npm install
```

### Step 2: Create `.env` File with Supabase Credentials
Obtain credentials from your Supabase Dashboard ([see instructions above](#-how-to-get-supabase-credentials-for-scenarios-2--3)) and create a `.env` file at project root:

```env
# ── Application Secrets ───────────────────────────────────────────────────────
NEXTAUTH_SECRET=your-random-32-character-secret
NEXTAUTH_URL=http://localhost:3000

# ── Cloud Supabase Credentials ────────────────────────────────────────────────
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_STORAGE_PUBLIC_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-secret-key
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_BUCKET=blog-media
```

### Step 3: Run Automated Cloud Setup
Run the automated cloud setup script to deploy Prisma migrations, create the public storage bucket in Supabase Cloud, and seed the initial admin account:

```bash
npm run setup:cloud
```

### Step 4: Run the Docker Container
Pull and run the pre-built Docker image passing your `.env` file:

```bash
# Pull the latest Docker image
docker pull thesukhjitbajwa/blog:latest

# Run the container on port 3000
docker run -d \
  --name blog-app \
  -p 3000:3000 \
  --env-file .env \
  thesukhjitbajwa/blog:latest
```

*(Alternatively, run via Docker Compose with `docker compose up app -d` after setting `image: thesukhjitbajwa/blog:latest` in `docker-compose.yml`).*

### Step 5: Access the Application
- **Public Blog**: `http://localhost:3000`
- **Admin Panel**: `http://localhost:3000/admin`

---

## 💻 Scenario 3: Local Node.js Development + Supabase Cloud (No Docker)

Use this scenario if you want to run and develop the application locally using **Node.js** (without Docker), connected to **Cloud Supabase**.

### Prerequisites
- **Node.js**: v18.x or v20.x (or higher)
- **npm**: v9.x or higher

### Step 1: Clone Repository & Install Dependencies
```bash
git clone https://github.com/the-sukhsingh/blog.git
cd blog
npm install
```

### Step 2: Create `.env` File with Supabase Credentials
Obtain credentials from your Supabase Dashboard ([see instructions above](#-how-to-get-supabase-credentials-for-scenarios-2--3)) and create a `.env` file at project root:

```env
# ── Application Secrets ───────────────────────────────────────────────────────
NEXTAUTH_SECRET=your-random-32-character-secret
NEXTAUTH_URL=http://localhost:3000

# ── Cloud Supabase Credentials ────────────────────────────────────────────────
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_STORAGE_PUBLIC_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-secret-key
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_BUCKET=blog-media
```

### Step 3: Run Automated Cloud Setup
Deploy Prisma database schema migrations, create the public storage bucket in Supabase Cloud, and seed default admin account:

```bash
npm run setup:cloud
```

### Step 4: Apply Site Configuration (Optional)
Sync site titles, navbar text, and hero copy from [`configuration.ts`](file:///e:/Projects/blog/configuration.ts) to the application:

```bash
npm run config:apply
```

### Step 5: Start the Application

#### Development Mode (with hot reloading):
```bash
npm run dev
```

#### Production Mode (build & run local production server):
```bash
npm run build
npm run start
```

### Step 6: Access the Application
- **Public Blog**: `http://localhost:3000`
- **Admin Panel**: `http://localhost:3000/admin`

---

## 🔑 Default Admin Credentials

For all setup scenarios, initial database seeding creates a default administrator account:

- **Login URL**: `http://localhost:3000/admin/login`
- **Email**: `admin@example.com`
- **Password**: `changeme123`
- **Role**: `ADMIN`

> ⚠️ **Security Warning**: Please change the admin password after your first login via the Admin Dashboard (`/admin/users`).

---

## ⚙️ Static Site Configuration (`configuration.ts`)

Site titles, navbar branding, hero banner content, badge copy, and footer text are managed centrally in [`configuration.ts`](file:///e:/Projects/blog/configuration.ts):

```ts
export const siteConfig: SiteConfig = {
  site: {
    name: "Editorial Studio",
    brandPrefix: "The",
    brandName: "Editorial Studio",
    footerText: "Blog. All rights reserved.",
  },
  navbar: {
    brandPrefix: "The",
    brandName: "Editorial Studio",
    links: [
      { name: "Home", href: "/" },
      { name: "Search", href: "/search", icon: "Search" },
    ],
  },
  homepage: {
    heroTitle: "The Journal",
    heroDescription: "Thoughtful essays, reviews, and technical guides.",
    badgeText: "Publishing Live",
    latestStoriesTitle: "Latest Stories",
  },
};
```

To sync changes made in `configuration.ts` to the application:
```bash
npm run config:apply
```

---

## ✨ Features Overview

### 📖 Reader Interface (Public Blog)
- **Modern Responsive Design**: Built with Tailwind CSS v4, smooth micro-animations, and light/dark theme switching.
- **Rich Post Rendering**: Supports categories, tags, custom hero cover image, and TipTap rich content.
- **Instant Search & Filtering**: Fast search across posts, categories, and tags.
- **Interactive Reader Comments**: Reader comment submission with moderation.

### 🛡️ Admin Workspace (`/admin`)
- **Dashboard Overview**: Key metrics for posts, published articles, categories, and pending comments.
- **TipTap Rich Text Editor**: Full WYSIWYG editor supporting images, links, formatting, task lists, and custom hero accent colors.
- **Media Library**: Upload and manage media assets stored in Supabase Object Storage.
- **Role-Based Access Control**: Role management (`ADMIN` vs `EDITOR`) at `/admin/users`.
- **Comment Moderation**: Approve or delete pending comments.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components) & [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & ORM**: [PostgreSQL 15](https://www.postgresql.org/) & [Prisma ORM 7](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Storage & Backend**: [Supabase](https://supabase.com/) (Self-Hosted Docker or Supabase Cloud)
- **Styling**: Tailwind CSS v4, Base UI, Lucide Icons, Framer Motion
- **Containerization**: Docker & Docker Compose (`thesukhjitbajwa/blog:latest`)

---

## 📜 Available NPM Scripts

- `npm run dev` — Starts Next.js development server (runs `config:apply` pre-hook).
- `npm run build` — Builds the production Next.js standalone application.
- `npm run start` — Starts the Next.js production server.
- `npm run setup` — Generates secrets and updates `.env` file automatically.
- `npm run setup:cloud` — Deploys migrations, creates Cloud Supabase storage bucket, and seeds admin.
- `npm run config:apply` — Applies static site content from `configuration.ts`.
- `npm run seed` — Runs database seeding script (`prisma/seed.ts`).
- `npm run lint` — Runs Biome linter checks.
- `npm run format` — Formats codebase using Biome.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
