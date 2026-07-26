import { PrismaClient } from "@hiweb/database";

/**
 * Single shared Prisma Client instance for the whole API process.
 * Standard pattern to avoid exhausting database connections by
 * creating a new client per request.
 */
export const prisma = new PrismaClient();
