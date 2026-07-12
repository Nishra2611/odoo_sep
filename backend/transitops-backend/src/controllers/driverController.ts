import { Response, NextFunction } from 'express';
import { createDriverSchema, updateDriverSchema } from '../validators/driverValidator';
import * as driverService from '../services/driverService';
import { AuthRequest } from '../middleware/auth';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { status, search } = req.query;
    res.json(await driverService.listDrivers({ status: status as string, search: search as string }));
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await driverService.getDriver(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createDriverSchema.parse(req.body);
    res.status(201).json(await driverService.createDriver(data));
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = updateDriverSchema.parse(req.body);
    res.json(await driverService.updateDriver(req.params.id, data));
  } catch (err) {
    next(err);
  }
}
