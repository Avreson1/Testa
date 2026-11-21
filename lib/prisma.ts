import { PrismaClient } from "@prisma/client";

function getPgBouncerUrl(): string | undefined {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl || !rawUrl.startsWith("postgres")) return rawUrl;
  if (rawUrl.includes("pgbouncer=true")) return rawUrl;
  const separator = rawUrl.includes("?") ? "&" : "?";
  return `${rawUrl}${separator}pgbouncer=true`;
}

const safeDatabaseUrl = getPgBouncerUrl();

if (safeDatabaseUrl) {
  process.env.DATABASE_URL = safeDatabaseUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: safeDatabaseUrl
      ? {
          db: {
            url: safeDatabaseUrl,
          },
        }
      : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
