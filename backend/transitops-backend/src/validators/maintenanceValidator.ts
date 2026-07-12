import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().uuid(),
  description: z.string().min(1),
  cost: z.number().nonnegative(),
});
