import { prisma } from '../config/db';

/**
 * Aggregates the KPI cards shown on the Dashboard: fleet composition by
 * status, trip pipeline counts, drivers on duty, and overall utilization.
 */
export async function getDashboardKpis(filters: { type?: string; status?: string; region?: string }) {
  const vehicleWhere = {
    type: filters.type as any,
    status: filters.status as any,
    region: filters.region,
  };

  const [totalVehicles, availableVehicles, onTripVehicles, inShopVehicles, retiredVehicles] = await Promise.all([
    prisma.vehicle.count({ where: vehicleWhere }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: 'AVAILABLE' } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: 'ON_TRIP' } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: 'IN_SHOP' } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: 'RETIRED' } }),
  ]);

  const [activeTrips, pendingTrips, driversOnDuty] = await Promise.all([
    prisma.trip.count({ where: { status: 'DISPATCHED' } }),
    prisma.trip.count({ where: { status: 'DRAFT' } }),
    prisma.driver.count({ where: { status: 'ON_TRIP' } }),
  ]);

  const utilization = totalVehicles > 0 ? Math.round((onTripVehicles / totalVehicles) * 100) : 0;

  return {
    totalVehicles,
    availableVehicles,
    onTripVehicles,
    inShopVehicles,
    retiredVehicles,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    fleetUtilizationPct: utilization,
  };
}

/**
 * Per-vehicle cost/efficiency/ROI breakdown for the Analytics page.
 * Fuel efficiency = total km driven (from fuel log odometer deltas) / total liters.
 * ROI is a simplified heuristic: (estimated revenue proxy - total opex) / acquisition cost.
 * In a production system, revenue would come from a real billing/invoicing module;
 * here we surface the cost side precisely and leave revenue as an editable input
 * on the frontend rather than fabricating a number the team can't defend.
 */
export async function getVehicleAnalytics(vehicleId: string) {
  const [vehicle, fuelLogs, maintenanceLogs, expenses] = await Promise.all([
    prisma.vehicle.findUnique({ where: { id: vehicleId } }),
    prisma.fuelLog.findMany({ where: { vehicleId }, orderBy: { loggedAt: 'asc' } }),
    prisma.maintenanceLog.findMany({ where: { vehicleId } }),
    prisma.expense.findMany({ where: { vehicleId } }),
  ]);

  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
  const totalLiters = fuelLogs.reduce((sum, f) => sum + f.liters, 0);
  const totalMaintenanceCost = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalOpex = totalFuelCost + totalMaintenanceCost + totalExpenses;

  let fuelEfficiencyKmPerLiter: number | null = null;
  if (fuelLogs.length >= 2) {
    const kmDriven = fuelLogs[fuelLogs.length - 1].odometerKm - fuelLogs[0].odometerKm;
    fuelEfficiencyKmPerLiter = totalLiters > 0 ? +(kmDriven / totalLiters).toFixed(2) : null;
  }

  return {
    vehicleId,
    regNumber: vehicle?.regNumber,
    totalFuelCost,
    totalMaintenanceCost,
    totalExpenses,
    totalOpex,
    fuelEfficiencyKmPerLiter,
    acquisitionCost: vehicle?.acquisitionCost,
  };
}
