import { z } from 'zod';

export const createTripSchema = z.object({
  driverId: z.string().uuid().nullable().optional(),
  vehicleId: z.string().uuid().nullable().optional(),
  tripCode: z.string().optional(),
  route: z.string().optional(),
  pickup: z.string().min(1),
  destination: z.string().min(1),
  stops: z.array(z.string()).optional(),
  cargoWeightKg: z.number().nonnegative(),
  estDistanceKm: z.number().nonnegative(),
  estDurationMin: z.number().nonnegative(),
  departureTime: z.string().optional(),
  eta: z.string().optional(),
  cargoDetails: z.string().optional(),
  passengerCount: z.number().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional().default('NORMAL'),
  notes: z.string().optional(),
  fuelEstimateL: z.number().optional(),
});

export const updateTripSchema = createTripSchema.partial().extend({
  status: z.enum(['DRAFT', 'DISPATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DELAYED']).optional(),
  actualArrival: z.string().optional(),
});
