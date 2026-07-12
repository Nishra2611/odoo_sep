import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

import { ZodError } from 'zod';

// Centralized error handler - keeps controllers free of repetitive try/catch
// boilerplate for known error shapes, and never leaks stack traces to the client.
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return res.status(400).json({ error: `Validation error - ${messages}` });
  }

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({ error: `Duplicate value for field: ${err.meta?.target}` });
  }

  console.error('[Unhandled Error]:', err);
  return res.status(500).json({ error: err.message || 'Internal server error' });
}
