/**
 * Unit tests for the core business-rule engine (tripService).
 * These use a mocked Prisma client so they run without a live DB -
 * ideal for a fast hackathon CI check.
 *
 * Run with: npm test
 */
import { AppError } from '../middleware/errorHandler';

// Mock the prisma singleton before importing the service that uses it
jest.mock('../config/db', () => ({
  prisma: {
    $transaction: jest.fn(),
    trip: { findUnique: jest.fn(), findFirst: jest.fn(), update: jest.fn(), create: jest.fn() },
    vehicle: { findUnique: jest.fn(), update: jest.fn() },
    driver: { update: jest.fn() },
  },
}));

import { prisma } from '../config/db';
import { dispatchTrip } from '../services/tripService';

describe('dispatchTrip business rules', () => {
  beforeEach(() => jest.clearAllMocks());

  function mockTx(tripData: any) {
    (prisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
      const tx = {
        trip: {
          findUnique: jest.fn().mockResolvedValue(tripData),
          findFirst: jest.fn().mockResolvedValue(null),
          update: jest.fn().mockResolvedValue({ ...tripData, status: 'DISPATCHED' }),
        },
        vehicle: { update: jest.fn().mockResolvedValue({}) },
        driver: { update: jest.fn().mockResolvedValue({}) },
      };
      return cb(tx);
    });
  }

  it('rejects dispatch when vehicle is IN_SHOP', async () => {
    mockTx({
      id: 't1',
      status: 'DRAFT',
      cargoWeightKg: 1000,
      vehicle: { id: 'v1', status: 'IN_SHOP', loadCapacityKg: 2000 },
      driver: { id: 'd1', status: 'AVAILABLE', licenseExpiry: new Date('2099-01-01') },
    });

    await expect(dispatchTrip('t1')).rejects.toThrow('Vehicle is not available');
  });

  it('rejects dispatch when driver license has expired', async () => {
    mockTx({
      id: 't2',
      status: 'DRAFT',
      cargoWeightKg: 1000,
      vehicle: { id: 'v1', status: 'AVAILABLE', loadCapacityKg: 2000 },
      driver: { id: 'd1', status: 'AVAILABLE', licenseExpiry: new Date('2020-01-01') },
    });

    await expect(dispatchTrip('t2')).rejects.toThrow('license has expired');
  });

  it('rejects dispatch when cargo exceeds vehicle capacity', async () => {
    mockTx({
      id: 't3',
      status: 'DRAFT',
      cargoWeightKg: 5000,
      vehicle: { id: 'v1', status: 'AVAILABLE', loadCapacityKg: 2000 },
      driver: { id: 'd1', status: 'AVAILABLE', licenseExpiry: new Date('2099-01-01') },
    });

    await expect(dispatchTrip('t3')).rejects.toThrow('exceeds vehicle load capacity');
  });

  it('rejects dispatch when driver is SUSPENDED', async () => {
    mockTx({
      id: 't4',
      status: 'DRAFT',
      cargoWeightKg: 1000,
      vehicle: { id: 'v1', status: 'AVAILABLE', loadCapacityKg: 2000 },
      driver: { id: 'd1', status: 'SUSPENDED', licenseExpiry: new Date('2099-01-01') },
    });

    await expect(dispatchTrip('t4')).rejects.toThrow('Driver is not available');
  });

  it('successfully dispatches a fully valid trip', async () => {
    mockTx({
      id: 't5',
      status: 'DRAFT',
      cargoWeightKg: 1000,
      vehicle: { id: 'v1', status: 'AVAILABLE', loadCapacityKg: 2000 },
      driver: { id: 'd1', status: 'AVAILABLE', licenseExpiry: new Date('2099-01-01') },
    });

    const result = await dispatchTrip('t5');
    expect(result.status).toBe('DISPATCHED');
  });
});
