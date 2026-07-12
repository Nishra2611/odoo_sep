import { prisma } from '../config/db';

export async function createFuelLog(data: { vehicleId: string; liters: number; cost: number; odometerKm: number }) {
  return prisma.fuelLog.create({ data });
}

export async function listFuelLogs(vehicleId?: string) {
  return prisma.fuelLog.findMany({ where: { vehicleId }, orderBy: { loggedAt: 'desc' } });
}

export async function createExpense(data: { vehicleId: string; category: string; amount: number; note?: string }) {
  return prisma.expense.create({ data });
}

export async function listExpenses(vehicleId?: string) {
  return prisma.expense.findMany({ where: { vehicleId }, orderBy: { loggedAt: 'desc' } });
}
