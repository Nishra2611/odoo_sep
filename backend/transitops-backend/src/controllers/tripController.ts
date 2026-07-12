import { Response, NextFunction } from 'express';
import { createTripSchema } from '../validators/tripValidator';
import * as tripService from '../services/tripService';
import { AuthRequest } from '../middleware/auth';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { status, driverId, vehicleId } = req.query;
    res.json(
      await tripService.listTrips({
        status: status as string,
        driverId: driverId as string,
        vehicleId: vehicleId as string,
      })
    );
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await tripService.getTrip(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createTripSchema.parse(req.body);
    res.status(201).json(await tripService.createTrip(data));
  } catch (err) {
    next(err);
  }
}

export async function dispatch(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await tripService.dispatchTrip(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function complete(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await tripService.completeTrip(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function cancel(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await tripService.cancelTrip(req.params.id));
  } catch (err) {
    next(err);
  }
}
