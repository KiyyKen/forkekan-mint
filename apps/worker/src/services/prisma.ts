import { PrismaClient } from '@prisma/client';

/**
 * Singleton Prisma Client untuk worker.
 * DATABASE_URL dimuat dari .env oleh main.ts (dotenv).
 */
export const prisma = new PrismaClient();
