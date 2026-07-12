import { Request, Response, NextFunction } from 'express';
import { locationService } from '../services/locationService';

/**
 * POST /api/v1/locations
 * Body: { vehicleId, latitude, longitude, timestamp? }
 * Records a single location ping. Not live tracking — a periodic push
 * (e.g. from a driver's device or fleet telematics box) lands here.
 */
export async function recordLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const point = await locationService.recordLocation(req.body);
    return res.status(201).json({ data: point });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/v1/locations/latest?vehicleIds=id1,id2
 * Returns the latest known position per vehicle, ready for React Leaflet
 * markers: [{ vehicleId, position: [lat, lng], timestamp }]
 */
export async function getLatestLocations(req: Request, res: Response, next: NextFunction) {
  try {
    const { vehicleIds } = req.query as { vehicleIds?: string };
    const ids = vehicleIds ? vehicleIds.split(',').filter(Boolean) : undefined;
    const points = await locationService.getLatestLocations(ids);
    return res.status(200).json({ data: points });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/v1/locations/:vehicleId/history?from=&to=&limit=
 * Returns stored location history for one vehicle, ready for a Leaflet
 * <Polyline> of its route over the given window.
 */
export async function getVehicleLocationHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const { vehicleId } = req.params;
    const { from, to, limit } = req.query as { from?: string; to?: string; limit?: string };
    const points = await locationService.getVehicleLocationHistory(vehicleId, {
      from,
      to,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return res.status(200).json({ data: points });
  } catch (err) {
    return next(err);
  }
}
