# 🚀 Blog CMS — Modern Next.js Publishing Platform

A modern, distraction-free Blog CMS built with **Next.js 16 (App Router)**, **TypeScript**, **Prisma ORM 7**, and a **self-hosted Supabase backend** running in Docker.

Designed with clean typography, responsive themes (light/dark mode), a full-featured admin management dashboard, rich text editing via TipTap, and an optimized Docker Compose production stack.

---

## ✨ Features

### 📖 Reader Interface (Public Blog)
- **Modern Responsive Design**: Built with Tailwind CSS, smooth micro-animations, and dynamic theme switching (Dark / Light mode).
- **Rich Content Rendering**: Render HTML/JSON blog posts with custom cover images, categories, tags, and formatting.
- **Search & Filtering**: Instant search across posts, filter posts by categories and tags.
- **Interactive Comments**: Reader comment submission with admin moderation.

### 🛡️ Admin Workspace (`/admin`)
- **Dashboard Overview**: Metrics on total posts, published articles, categories, and pending comments.
- **TipTap Rich Text Editor**: WYSIWYG editor supporting images, links, formatting, task lists, code blocks, and custom hero accent colors (`bgColorLight` / `bgColorDark`).
- **User Role Management**: Role-based access control (`ADMIN` vs `EDITOR`) with a built-in user management dashboard at `/admin/users`.
- **Media Library**: Upload and manage media assets stored in self-hosted Supabase Object Storage.
- **Comment Moderation**: Approve or delete user comments before they appear publicly.
- **Taxonomy Manager**: Manage post categories and tags dynamically.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components, Turbopack) & [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & ORM**: [PostgreSQL 15](https://www.postgresql.org/) & [Prisma ORM 7](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Credentials provider with bcrypt password hashing)
- **Storage & Backend**: Self-hosted [Supabase](https://supabase.com/) (Postgres 15, Storage API, GoTrue, Kong Gateway, Supabase Studio)
- **Styling & UI**: Tailwind CSS v4, Base UI, Lucide Icons, Framer Motion
- **Containerization**: Docker & Docker Compose (Multi-stage lightweight build)

---

## ⚡ Quick Start (Docker)

Run the entire application stack (Next.js CMS, PostgreSQL, Supabase Storage, Kong Gateway, Supabase Studio) with **a single command**:

### Linux / macOS
```bash
cp .env.example .env && docker compose up -d --build
```

### Windows (PowerShell)
```powershell
cp .env.example .env; docker compose up -d --build
```

> **Note**: Database schema migrations and default admin seeding run automatically on initial startup.

---

## 🔑 Default Login Credentials

Once the containers start up, access the admin panel at **`http://localhost:3000/admin/login`**:

- **Email**: `admin@example.com`
- **Password**: `changeme123`
- **Role**: `ADMIN`

---

## 🌐 Application URLs

| Service | Access URL | Description |
| :--- | :--- | :--- |
| **Public Blog** | `http://localhost:3000` | Homepage & reader interface |
| **Admin Panel** | `http://localhost:3000/admin` | Management dashboard |
| **Supabase Studio** | `http://localhost:3001` | Self-hosted database GUI |
| **Kong API Gateway** | `http://localhost:8000` | API gateway for Storage & Auth |

---

## 💻 Local Development Setup (Without Docker)

If you prefer running Next.js locally while connected to PostgreSQL:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Generate Environment Secrets**:
   ```bash
   npm run setup
   ```

3. **Push Prisma Schema to Database**:
   ```bash
   npx prisma db push
   ```

4. **Seed Initial Admin User**:
   ```bash
   npm run seed
   ```

5. **Start Next.js Development Server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🐋 Docker Stack & Resource Optimizations

The Docker environment includes resource optimizations tailored for self-hosted environments:

- **Kong API Gateway**: Optimized to 1 worker process with reduced memory buffers and active plugins, reducing memory footprint by **90%** (from ~1 GB RAM down to **~98 MB RAM**).
- **Prisma CLI 7 Support**: Dockerfile uses a 3-stage minimal Alpine build that packages generated Prisma Client and WASM modules.
- **Automatic Migration & Seeding**: [`docker/entrypoint.sh`](file:///e:/Projects/blog/docker/entrypoint.sh) executes Prisma migrations and seeds default admin users idempotently.

---

## 📁 Project Structure

```text
blog/
├── docker/                 # Kong gateway config & entrypoint scripts
│   ├── entrypoint.sh       # Container startup & migration script
│   └── kong.yml            # Declarative Kong gateway routing config
├── prisma/
│   ├── migrations/         # SQL migration files
│   ├── schema.prisma       # Prisma database schema definition
│   └── seed.ts             # Initial database seeder script
├── public/                 # Static public assets
├── scripts/
│   └── setup-env.js        # Environment secret generator
├── src/
│   ├── app/                # Next.js App Router (Public routes & /admin)
│   ├── components/         # React UI components (Admin, Blog, Editor)
│   └── lib/                # Shared utilities (Prisma client, NextAuth, Supabase)
├── Dockerfile              # Multi-stage production build
├── docker-compose.yml      # Docker Compose stack specification
├── package.json            # Dependencies & npm scripts
└── prisma.config.ts        # Prisma 7 configuration file
```

---

## 📜 Available NPM Scripts

- `npm run dev` — Starts Next.js development server.
- `npm run build` — Builds the production Next.js standalone app.
- `npm run start` — Starts the Next.js production server.
- `npm run setup` — Generates secrets and `.env` file automatically.
- `npm run setup:fresh` — Overwrites and regenerates all secrets in `.env`.
- `npm run seed` — Runs database seeding script (`prisma/seed.ts`).
- `npm run lint` — Runs Biome linter checks.
- `npm run format` — Formats codebase using Biome.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
