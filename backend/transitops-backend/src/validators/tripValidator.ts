import { z } from 'zod';

export const createTripSchema = z.object({
  driverId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  source: z.string().min(1),
  destination: z.string().min(1),
  cargoWeightKg: z.number().positive(),
  plannedDistanceKm: z.number().positive(),
});
