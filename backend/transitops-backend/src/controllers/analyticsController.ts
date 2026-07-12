import { Response, NextFunction } from 'express';
import * as analyticsService from '../services/analyticsService';
import { AuthRequest } from '../middleware/auth';

export async function dashboard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { type, status, region } = req.query;
    res.json(
      await analyticsService.getDashboardKpis({
        type: type as string,
        status: status as string,
        region: region as string,
      })
    );
  } catch (err) {
    next(err);
  }
}

export async function vehicleAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await analyticsService.getVehicleAnalytics(req.params.id));
  } catch (err) {
    next(err);
  }
}
