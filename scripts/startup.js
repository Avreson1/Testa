const { execSync, spawn } = require("child_process");

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

console.log(`>>> [CBT-Hub] Starting up service on Render (Host: ${HOST}, Port: ${PORT})...`);

// 1. Sync database schema (with safety timeout)
try {
  console.log(">>> [CBT-Hub] Synchronizing Prisma database schema...");
  execSync("npx prisma db push --accept-data-loss", {
    stdio: "inherit",
    timeout: 30000,
  });
  console.log(">>> [CBT-Hub] Database schema synchronized successfully.");
} catch (err) {
  console.error(">>> [CBT-Hub] Notice: prisma db push:", err.message);
}

// 2. Seed initial demo data (with safety timeout)
try {
  console.log(">>> [CBT-Hub] Checking and seeding initial demo data...");
  execSync("npx tsx prisma/seed.ts", {
    stdio: "inherit",
    timeout: 20000,
  });
  console.log(">>> [CBT-Hub] Database seed check completed.");
} catch (err) {
  console.error(">>> [CBT-Hub] Notice: seed check:", err.message);
}

// 3. Launch Next.js web server explicitly bound to 0.0.0.0 and $PORT for Render
console.log(`>>> [CBT-Hub] Binding Next.js server to ${HOST}:${PORT}...`);
const server = spawn("npx", ["next", "start", "-H", HOST, "-p", String(PORT)], {
  stdio: "inherit",
  shell: true,
});

server.on("error", (err) => {
  console.error(">>> [CBT-Hub] Server failed to start:", err);
  process.exit(1);
});

server.on("exit", (code) => {
  process.exit(code || 0);
});
