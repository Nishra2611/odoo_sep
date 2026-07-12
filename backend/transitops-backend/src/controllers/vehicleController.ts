import { Response, NextFunction } from 'express';
import { createVehicleSchema, updateVehicleSchema } from '../validators/vehicleValidator';
import * as vehicleService from '../services/vehicleService';
import { AuthRequest } from '../middleware/auth';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { type, status, region, search } = req.query;
    const vehicles = await vehicleService.listVehicles({
      type: type as string,
      status: status as string,
      region: region as string,
      search: search as string,
    });
    res.json(vehicles);
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await vehicleService.getVehicle(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createVehicleSchema.parse(req.body);
    res.status(201).json(await vehicleService.createVehicle(data));
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = updateVehicleSchema.parse(req.body);
    res.json(await vehicleService.updateVehicle(req.params.id, data));
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await vehicleService.deleteVehicle(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
