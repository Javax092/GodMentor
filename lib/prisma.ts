import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const createPrismaClient = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

export const prisma = global.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production" && !global.__prisma) {
  global.__prisma = prisma;
}
