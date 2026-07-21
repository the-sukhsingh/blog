#!/usr/bin/env node
/**
 * scripts/setup-env.js
 *
 * Generates all required secrets and writes a production-ready .env file.
 * Zero npm dependencies — uses only Node.js built-ins (crypto, fs, path).
 *
 * Usage:
 *   node scripts/setup-env.js              # generate .env (skips if .env exists)
 *   node scripts/setup-env.js --overwrite  # overwrite an existing .env
 *   node scripts/setup-env.js --show       # print generated values to stdout only
 *
 * Via npm:
 *   npm run setup          # first-time setup
 *   npm run setup:fresh    # regenerate and overwrite existing .env
 *   npm run setup:show     # print values without writing
 */

"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// ── ANSI colours ─────────────────────────────────────────────────────────────
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
};
const bold = (s) => `${c.bold}${s}${c.reset}`;
const dim = (s) => `${c.dim}${s}${c.reset}`;
const green = (s) => `${c.green}${s}${c.reset}`;
const yellow = (s) => `${c.yellow}${s}${c.reset}`;
const cyan = (s) => `${c.cyan}${s}${c.reset}`;
const red = (s) => `${c.red}${s}${c.reset}`;
const blue = (s) => `${c.blue}${s}${c.reset}`;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Cryptographically random base64 string (URL-safe, no padding). */
function randomBase64(bytes) {
  return crypto
    .randomBytes(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/** Cryptographically random alphanumeric string (safe for DB passwords). */
function randomPassword(length = 32) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join("");
}

/** Encode a value as Base64URL (no padding). */
function b64url(value) {
  return Buffer.from(
    typeof value === "string" ? value : JSON.stringify(value)
  )
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Create a signed HS256 JWT — no external dependencies.
 * @param {object} payload   JWT payload
 * @param {string} secret    Signing secret
 */
function createJWT(payload, secret) {
  const header = b64url({ alg: "HS256", typ: "JWT" });
  const body = b64url(payload);
  const sig = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  return `${header}.${body}.${sig}`;
}

/** Replace a variable value in a .env-style string. Handles inline comments. */
function setEnvVar(content, key, value) {
  // Match: KEY=<anything up to EOL> (with or without inline # comment)
  const re = new RegExp(
    `^(${key}=)[^\\n]*`,
    "m"
  );
  if (re.test(content)) {
    return content.replace(re, `$1${value}`);
  }
  // Variable not found — append it
  return content + `\n${key}=${value}\n`;
}

// ── Parse flags ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const FORCE = args.includes("--overwrite");
const SHOW_ONLY = args.includes("--show");

// ── Paths ─────────────────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, "..");
const EXAMPLE = path.join(ROOT, ".env.example");
const DEST = path.join(ROOT, ".env");

// ── Banner ────────────────────────────────────────────────────────────────────
console.log();
console.log(`${bold(blue("  Blog CMS"))}  ${dim("·")}  ${cyan("Environment Setup")}`);
console.log(dim("  ─────────────────────────────────────────"));
console.log();

// ── Guard: .env.example must exist ───────────────────────────────────────────
if (!fs.existsSync(EXAMPLE)) {
  console.error(red("  ✖  .env.example not found. Run this script from the project root."));
  process.exit(1);
}

// ── Guard: don't overwrite without --force ────────────────────────────────────
if (!SHOW_ONLY && fs.existsSync(DEST) && !FORCE) {
  console.log(yellow("  ⚠  .env already exists."));
  console.log(dim("     To regenerate all secrets and overwrite it, run:\n"));
  console.log(`     ${bold("npm run setup:fresh")}`);
  console.log(dim("\n     To preview generated values without writing, run:\n"));
  console.log(`     ${bold("npm run setup:show")}`);
  console.log();
  process.exit(0);
}

// ── Generate secrets ──────────────────────────────────────────────────────────
console.log("  Generating secrets...\n");

const now = Math.floor(Date.now() / 1000);
const exp = now + 10 * 365 * 24 * 3600; // 10 years

const NEXTAUTH_SECRET = randomBase64(32);
const POSTGRES_PASSWORD = randomPassword(32);
const JWT_SECRET = randomBase64(32);

const SUPABASE_ANON_KEY = createJWT(
  { role: "anon", iss: "supabase", iat: now, exp },
  JWT_SECRET
);

const SUPABASE_SERVICE_KEY = createJWT(
  { role: "service_role", iss: "supabase", iat: now, exp },
  JWT_SECRET
);

// ── Build the DATABASE_URL using the generated password ───────────────────────
const DATABASE_URL = `postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/postgres`;

// ── Print generated values table ──────────────────────────────────────────────
const rows = [
  ["NEXTAUTH_SECRET",    NEXTAUTH_SECRET],
  ["POSTGRES_PASSWORD",  POSTGRES_PASSWORD],
  ["DATABASE_URL",       DATABASE_URL],
  ["JWT_SECRET",         JWT_SECRET],
  ["SUPABASE_ANON_KEY",  SUPABASE_ANON_KEY.slice(0, 40) + "…"],
  ["SUPABASE_SERVICE_KEY", SUPABASE_SERVICE_KEY.slice(0, 40) + "…"],
];

for (const [key, val] of rows) {
  console.log(`  ${green("✔")}  ${bold(key.padEnd(26))} ${dim(val)}`);
}

console.log();

if (SHOW_ONLY) {
  // Print raw values suitable for copy-paste
  console.log(dim("  ── Raw values ───────────────────────────────────────────────"));
  console.log();
  console.log(`NEXTAUTH_SECRET=${NEXTAUTH_SECRET}`);
  console.log(`POSTGRES_PASSWORD=${POSTGRES_PASSWORD}`);
  console.log(`DATABASE_URL=${DATABASE_URL}`);
  console.log(`JWT_SECRET=${JWT_SECRET}`);
  console.log(`SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}`);
  console.log(`SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}`);
  console.log();
  process.exit(0);
}

// ── Patch .env.example with generated values ──────────────────────────────────
let content = fs.readFileSync(EXAMPLE, "utf8");

content = setEnvVar(content, "NEXTAUTH_SECRET",    NEXTAUTH_SECRET);
content = setEnvVar(content, "POSTGRES_PASSWORD",  POSTGRES_PASSWORD);
content = setEnvVar(content, "DATABASE_URL",       DATABASE_URL);
content = setEnvVar(content, "JWT_SECRET",         JWT_SECRET);
content = setEnvVar(content, "SUPABASE_ANON_KEY",  SUPABASE_ANON_KEY);
content = setEnvVar(content, "SUPABASE_SERVICE_KEY", SUPABASE_SERVICE_KEY);

// ── Write .env ────────────────────────────────────────────────────────────────
fs.writeFileSync(DEST, content, "utf8");

const action = FORCE && fs.existsSync(DEST) ? "Overwritten" : "Created";
console.log(`  ${green("✔")}  ${bold(".env")} ${action.toLowerCase()} at ${dim(DEST)}`);
console.log();

// ── Post-install checklist ────────────────────────────────────────────────────
console.log(dim("  ── Still needed ─────────────────────────────────────────────"));
console.log();
console.log(`  ${yellow("!")}  Open ${bold(".env")} and set:`);
console.log();
console.log(`     ${cyan("NEXTAUTH_URL")}          ${dim("→ http://localhost:3000  (or your domain)")}`);
console.log(`     ${cyan("SUPABASE_STORAGE_PUBLIC_URL")}  ${dim("→ http://localhost:8000  (browser-facing)")}`);
console.log();
console.log(dim("  Everything else is already filled in."));
console.log();
console.log(`  ${green("→")}  ${bold("docker compose up -d")}`);
console.log();
