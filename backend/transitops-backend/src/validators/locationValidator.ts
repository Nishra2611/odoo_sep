import { z } from 'zod';

export const recordLocationSchema = z.object({
  body: z.object({
    vehicleId: z.string().uuid(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    timestamp: z.string().datetime().optional(), // defaults to now() if omitted
  }),
});

export const getLatestLocationsSchema = z.object({
  query: z.object({
    vehicleIds: z.string().optional(), // comma-separated list, optional filter
  }),
});

export const getVehicleLocationHistorySchema = z.object({
  params: z.object({
    vehicleId: z.string().uuid(),
  }),
  query: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export type RecordLocationInput = z.infer<typeof recordLocationSchema>['body'];
