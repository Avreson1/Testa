const { execSync } = require("child_process");

console.log(">>> [CBT-Hub] Starting up service on Render...");

// 1. Sync database schema to ensure all tables & columns exist
try {
  console.log(">>> [CBT-Hub] Synchronizing Prisma database schema...");
  execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
  console.log(">>> [CBT-Hub] Database schema synchronized successfully.");
} catch (err) {
  console.error(">>> [CBT-Hub] Notice: prisma db push message:", err.message);
}

// 2. Seed initial demo users if not present
try {
  console.log(">>> [CBT-Hub] Checking and seeding initial demo data...");
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
  console.log(">>> [CBT-Hub] Database seed check completed.");
} catch (err) {
  console.error(">>> [CBT-Hub] Notice: seed check message:", err.message);
}

// 3. Launch Next.js web server
console.log(">>> [CBT-Hub] Launching Next.js server...");
execSync("next start", { stdio: "inherit" });
