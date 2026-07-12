import { prisma } from '../config/db';
import { AppError } from '../middleware/errorHandler';

interface CreateTripInput {
  driverId: string;
  vehicleId: string;
  source: string;
  destination: string;
  cargoWeightKg: number;
  plannedDistanceKm: number;
}

export async function listTrips(filters: { status?: string; driverId?: string; vehicleId?: string }) {
  return prisma.trip.findMany({
    where: {
      status: filters.status as any,
      driverId: filters.driverId,
      vehicleId: filters.vehicleId,
    },
    include: { driver: true, vehicle: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTrip(id: string) {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { driver: true, vehicle: true },
  });
  if (!trip) throw new AppError('Trip not found', 404);
  return trip;
}

/**
 * Creates a trip in DRAFT status. No vehicle/driver state is touched yet -
 * only dispatch() actually commits a vehicle/driver to this trip. This lets
 * managers draft trips without locking resources prematurely.
 */
export async function createTrip(input: CreateTripInput) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: input.vehicleId } });
  if (!vehicle) throw new AppError('Vehicle not found', 404);

  if (input.cargoWeightKg > vehicle.capacityKg) {
    throw new AppError(
      `Cargo weight (${input.cargoWeightKg}kg) exceeds vehicle load capacity (${vehicle.capacityKg}kg)`,
      400
    );
  }

  return prisma.trip.create({ data: { ...input, status: 'DRAFT' } });
}

/**
 * THE CORE BUSINESS-RULE ENGINE.
 *
 * Dispatching a trip must atomically:
 *   1. Re-validate every rule (vehicle/driver eligibility, license expiry,
 *      cargo capacity, no double-assignment) at the moment of dispatch -
 *      not just at trip-creation time, since state may have changed since.
 *   2. Flip vehicle -> ON_TRIP, driver -> ON_TRIP, trip -> DISPATCHED
 *      all inside a single DB transaction, so two managers racing to
 *      dispatch the same vehicle can never both succeed.
 */
export async function dispatchTrip(tripId: string) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({
      where: { id: tripId },
      include: { driver: true, vehicle: true },
    });
    if (!trip) throw new AppError('Trip not found', 404);
    if (trip.status !== 'DRAFT') {
      throw new AppError(`Only DRAFT trips can be dispatched (current status: ${trip.status})`, 400);
    }

    const { driver, vehicle } = trip;

    // Rule: vehicle must be AVAILABLE (blocks IN_SHOP, RETIRED, ON_TRIP)
    if (vehicle.status !== 'AVAILABLE') {
      throw new AppError(`Vehicle is not available (current status: ${vehicle.status})`, 400);
    }

    // Rule: driver must be AVAILABLE (blocks SUSPENDED, ON_TRIP, INACTIVE)
    if (driver.status !== 'AVAILABLE') {
      throw new AppError(`Driver is not available (current status: ${driver.status})`, 400);
    }

    // Rule: driver's license must not be expired
    if (driver.licenseExpiry < new Date()) {
      throw new AppError('Driver license has expired', 400);
    }

    // Rule: cargo weight must not exceed vehicle capacity (re-checked here
    // in case vehicle capacity was edited after the trip was drafted)
    if (trip.cargoWeightKg > vehicle.capacityKg) {
      throw new AppError('Cargo weight exceeds vehicle load capacity', 400);
    }

    // Rule: no double-assignment - vehicle or driver must not already be on
    // another DISPATCHED trip (belt-and-braces on top of the status check
    // above, and safe under the transaction against race conditions).
    const conflicting = await tx.trip.findFirst({
      where: {
        status: 'DISPATCHED',
        OR: [{ vehicleId: vehicle.id }, { driverId: driver.id }],
        NOT: { id: trip.id },
      },
    });
    if (conflicting) {
      throw new AppError('Vehicle or driver is already assigned to another active trip', 400);
    }

    // All rules passed - commit the atomic transition
    await tx.vehicle.update({ where: { id: vehicle.id }, data: { status: 'ON_TRIP' } });
    await tx.driver.update({ where: { id: driver.id }, data: { status: 'ON_TRIP' } });
    const updatedTrip = await tx.trip.update({
      where: { id: trip.id },
      data: { status: 'DISPATCHED', dispatchedAt: new Date() },
    });

    return updatedTrip;
  });
}

export async function completeTrip(tripId: string) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new AppError('Trip not found', 404);
    if (trip.status !== 'DISPATCHED') {
      throw new AppError(`Only DISPATCHED trips can be completed (current status: ${trip.status})`, 400);
    }

    await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'AVAILABLE' } });
    await tx.driver.update({ where: { id: trip.driverId }, data: { status: 'AVAILABLE' } });

    return tx.trip.update({
      where: { id: tripId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
  });
}

export async function cancelTrip(tripId: string) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new AppError('Trip not found', 404);
    if (!['DRAFT', 'DISPATCHED'].includes(trip.status)) {
      throw new AppError(`Cannot cancel a trip with status ${trip.status}`, 400);
    }

    // Only free up the vehicle/driver if they were actually locked (i.e. the
    // trip had been dispatched) - a DRAFT trip never touched their status.
    if (trip.status === 'DISPATCHED') {
      await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'AVAILABLE' } });
      await tx.driver.update({ where: { id: trip.driverId }, data: { status: 'AVAILABLE' } });
    }

    return tx.trip.update({ where: { id: tripId }, data: { status: 'CANCELLED' } });
  });
}
