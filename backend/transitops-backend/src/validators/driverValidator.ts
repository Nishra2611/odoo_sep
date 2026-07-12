import { z } from 'zod';

export const createDriverSchema = z.object({
  name: z.string().min(2),
  licenseNumber: z.string().min(3),
  licenseExpiry: z.coerce.date(),
  contact: z.string().min(5),
});

export const updateDriverSchema = createDriverSchema.partial().extend({
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'SUSPENDED', 'INACTIVE']).optional(),
  safetyScore: z.number().int().min(0).max(100).optional(),
});
