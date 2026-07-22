import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

// Suppress pg driver deprecation warning (harmless notice in @prisma/adapter-pg with pg v8+)
if (typeof process !== "undefined") {
  process.on("warning", (warning) => {
    if (
      warning.name === "DeprecationWarning" &&
      warning.message.includes("client.query()")
    ) {
      return;
    }
  });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/postgres";

// Enable SSL automatically for Supabase Cloud / remote Postgres connections
const isCloudPostgres =
  connectionString.includes("supabase.co") ||
  connectionString.includes("pooler.supabase.com") ||
  connectionString.includes("sslmode=");

const pool = new Pool({
  connectionString,
  ssl: isCloudPostgres ? { rejectUnauthorized: false } : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
});

const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
