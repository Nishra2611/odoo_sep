import { Response, NextFunction } from 'express';
import { createFuelLogSchema, createExpenseSchema } from '../validators/fuelExpenseValidator';
import * as service from '../services/fuelExpenseService';
import { AuthRequest } from '../middleware/auth';

export async function listFuelLogs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await service.listFuelLogs(req.query.vehicleId as string));
  } catch (err) {
    next(err);
  }
}

export async function createFuelLog(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createFuelLogSchema.parse(req.body);
    res.status(201).json(await service.createFuelLog(data));
  } catch (err) {
    next(err);
  }
}

export async function listExpenses(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(await service.listExpenses(req.query.vehicleId as string));
  } catch (err) {
    next(err);
  }
}

export async function createExpense(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createExpenseSchema.parse(req.body);
    res.status(201).json(await service.createExpense(data));
  } catch (err) {
    next(err);
  }
}
