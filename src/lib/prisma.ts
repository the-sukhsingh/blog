import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL;

// Enable SSL automatically for Supabase Cloud / remote Postgres connections
const isCloudPostgres =
  connectionString?.includes("supabase.co") ||
  connectionString?.includes("pooler.supabase.com") ||
  connectionString?.includes("sslmode=");

const pool = new Pool({
  connectionString,
  ssl: isCloudPostgres ? { rejectUnauthorized: false } : undefined,
});

const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
