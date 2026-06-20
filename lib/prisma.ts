import { PrismaClient } from "@prisma/client";

// Next.js dev mode hot-reloads modules, which would otherwise create a new
// PrismaClient on every reload and exhaust DB connections. Caching the
// instance on the global object avoids that.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
