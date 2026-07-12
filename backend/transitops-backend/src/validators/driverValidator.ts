import { z } from 'zod';

export const createDriverSchema = z.object({
  name: z.string().min(2),
  licenseNumber: z.string().min(3),
  licenseExpiry: z.coerce.date(),
  contact: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  safetyRating: z.number().optional(),
  tripCompletionPct: z.number().optional(),
  emergencyContact: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  violationsCount: z.number().optional(),
  attendancePct: z.number().optional(),
  assignedVehicleId: z.string().nullable().optional(),
});

export const updateDriverSchema = createDriverSchema.partial().extend({
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED', 'LEAVE', 'EXPIRED_LICENSE', 'INACTIVE']).optional(),
});
