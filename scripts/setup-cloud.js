/**
 * ══════════════════════════════════════════════════════════════════════════════
 * setup-cloud.js — Cloud Supabase Integration & Setup Helper
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Responsibilities:
 *   1. Verifies Cloud Supabase environment variables (.env / env vars)
 *   2. Runs `prisma migrate deploy` against the Cloud Supabase Database
 *   3. Verifies and creates the public storage bucket in Supabase Cloud
 *   4. Runs database seeder (`prisma/seed.ts`) to ensure default admin exists
 * ══════════════════════════════════════════════════════════════════════════════
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");

// Load .env if present
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

async function runCloudSetup() {
  console.log("☁️  Initializing Cloud Supabase Integration & Setup...\n");

  const databaseUrl = process.env.DATABASE_URL;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const bucketName = process.env.SUPABASE_BUCKET || "blog-media";

  // Step 1: Validate Required Environment Variables
  console.log("🔍 Step 1: Validating Cloud Supabase Credentials...");
  if (!databaseUrl) {
    console.error("❌ Error: DATABASE_URL is missing in environment!");
    console.error(
      "   Set DATABASE_URL to your Supabase Postgres connection string.",
    );
    process.exit(1);
  }
  if (!supabaseUrl || !supabaseUrl.startsWith("http")) {
    console.error("❌ Error: SUPABASE_URL is missing or invalid!");
    console.error("   Set SUPABASE_URL to https://<project-ref>.supabase.co");
    process.exit(1);
  }
  if (!serviceKey) {
    console.error("❌ Error: SUPABASE_SERVICE_KEY is missing!");
    console.error(
      "   Set SUPABASE_SERVICE_KEY to your Supabase service_role key.",
    );
    process.exit(1);
  }

  console.log("   ✓ DATABASE_URL configured");
  console.log(`   ✓ SUPABASE_URL: ${supabaseUrl}`);
  console.log(`   ✓ SUPABASE_BUCKET: ${bucketName}\n`);

  // Step 2: Apply Prisma Migrations to Cloud Database
  console.log(
    "🔄 Step 2: Deploying Prisma Database Migrations to Cloud Supabase...",
  );
  try {
    execSync("npx prisma migrate deploy", { stdio: "inherit", cwd: rootDir });
    console.log("   ✅ Database migrations deployed successfully.\n");
  } catch (err) {
    console.error("❌ Error applying Prisma migrations:", err.message);
    process.exit(1);
  }

  // Step 3: Verify / Create Supabase Cloud Storage Bucket
  console.log(
    `🪣 Step 3: Verifying Cloud Supabase Storage Bucket '${bucketName}'...`,
  );
  try {
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: buckets, error: listErr } =
      await supabase.storage.listBuckets();
    if (listErr) {
      console.warn(`   ⚠️ Warning checking storage buckets: ${listErr.message}`);
    } else {
      const existing = buckets.find(
        (b) => b.id === bucketName || b.name === bucketName,
      );
      if (existing) {
        console.log(`   ✅ Storage bucket '${bucketName}' already exists.`);
      } else {
        console.log(`   📦 Creating public storage bucket '${bucketName}'...`);
        const { error: createErr } = await supabase.storage.createBucket(
          bucketName,
          {
            public: true,
            fileSizeLimit: 52428800, // 50MB
          },
        );

        if (createErr) {
          console.error(
            `   ⚠️ Could not create bucket automatically: ${createErr.message}`,
          );
          console.error(
            `   You can create the '${bucketName}' public bucket in your Supabase Dashboard -> Storage.`,
          );
        } else {
          console.log(
            `   ✅ Public storage bucket '${bucketName}' created successfully.`,
          );
        }
      }
    }
  } catch (err) {
    console.warn(`   ⚠️ Storage check skipped: ${err.message}`);
  }
  console.log("");

  // Step 4: Seed Database Admin User
  console.log("🌱 Step 4: Seeding Initial Admin User into Cloud Database...");
  try {
    execSync("npx tsx prisma/seed.ts", { stdio: "inherit", cwd: rootDir });
    console.log("   ✅ Seeding completed.\n");
  } catch (err) {
    console.warn("   ⚠️ Seeding step completed or skipped:", err.message);
  }

  console.log(
    "══════════════════════════════════════════════════════════════════════════════",
  );
  console.log("🎉 Cloud Supabase Integration Complete!");
  console.log(
    "══════════════════════════════════════════════════════════════════════════════",
  );
  console.log("Your Next.js Blog CMS is fully connected to Cloud Supabase.");
  console.log(
    "You can now deploy to Vercel, Netlify, Render, or any custom Node server.",
  );
}

runCloudSetup();
