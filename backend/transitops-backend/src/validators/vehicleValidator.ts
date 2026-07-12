import { z } from 'zod';

export const createVehicleSchema = z.object({
  regNumber: z.string().min(3),
  name: z.string().optional(),
  model: z.string().min(1).optional().default("Unknown"),
  type: z.enum(['TRUCK', 'VAN', 'TRAILER', 'PICKUP', 'Truck', 'Van', 'Trailer', 'Pickup']),
  capacityKg: z.number().nonnegative(),
  odometerKm: z.number().nonnegative(),
  acquisitionCost: z.number().nonnegative(),
  region: z.string().optional().default("US"),
  lastServiceDate: z.string().optional(),
  insuranceExpiry: z.string().optional(),
  registrationExpiry: z.string().optional(),
  gpsStatus: z.string().optional(),
  riskScore: z.number().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial().extend({
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED']).optional(),
});
