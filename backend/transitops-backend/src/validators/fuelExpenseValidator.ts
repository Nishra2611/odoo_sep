import { z } from 'zod';

export const createFuelLogSchema = z.object({
  vehicleId: z.string().uuid(),
  liters: z.number().positive(),
  cost: z.number().nonnegative(),
  odometerKm: z.number().nonnegative(),
});

export const createExpenseSchema = z.object({
  vehicleId: z.string().uuid(),
  category: z.string().min(1),
  amount: z.number().nonnegative(),
  note: z.string().optional(),
});
