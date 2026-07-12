import { Response, NextFunction } from 'express';
import { createMaintenanceSchema } from '../validators/maintenanceValidator';
import * as maintenanceService from '../services/maintenanceService';
import { AuthRequest } from '../middleware/auth';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await maintenanceService.listMaintenanceLogs(req.query.vehicleId as string));
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createMaintenanceSchema.parse(req.body);
    res.status(201).json(await maintenanceService.startMaintenance(data.vehicleId, data.description, data.cost));
  } catch (err) {
    next(err);
  }
}

export async function complete(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await maintenanceService.completeMaintenance(req.params.id));
  } catch (err) {
    next(err);
  }
}
