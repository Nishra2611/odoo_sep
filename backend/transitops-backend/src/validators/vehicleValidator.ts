import { z } from 'zod';

export const createVehicleSchema = z.object({
  regNumber: z.string().min(3),
  model: z.string().min(1),
  type: z.enum(['TRUCK', 'VAN', 'TRAILER', 'PICKUP']),
  loadCapacityKg: z.number().positive(),
  odometerKm: z.number().nonnegative(),
  acquisitionCost: z.number().nonnegative(),
  region: z.string().min(1),
});

export const updateVehicleSchema = createVehicleSchema.partial().extend({
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED']).optional(),
});
