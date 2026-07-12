import { PrismaClient } from '@prisma/client';

// Single shared Prisma instance across the app (avoids exhausting DB connections
// in dev mode with hot-reload creating multiple clients).
export const prisma = new PrismaClient();
