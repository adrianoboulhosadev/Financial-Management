import { PrismaClient } from 'database'

/** One client for the whole process — the worker is a single long-lived
 * consumer, not a request/response server. */
export const prisma = new PrismaClient()
