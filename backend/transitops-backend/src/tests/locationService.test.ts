import { locationService } from '../services/locationService';
import { prisma } from '../config/db';

jest.mock('../config/db', () => ({
  prisma: {
    vehicle: { findUnique: jest.fn() },
    vehicleLocation: { create: jest.fn(), findMany: jest.fn() },
  },
}));

const mockVehicle = { id: 'vehicle-1' };

describe('locationService.recordLocation', () => {
  beforeEach(() => jest.clearAllMocks());

  it('throws 404 when the vehicle does not exist', async () => {
    (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      locationService.recordLocation({ vehicleId: 'missing', latitude: 1, longitude: 1 })
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('creates a location row and returns a Leaflet-ready point', async () => {
    (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(mockVehicle);
    (prisma.vehicleLocation.create as jest.Mock).mockResolvedValue({
      vehicleId: 'vehicle-1',
      latitude: 23.03,
      longitude: 72.58,
      timestamp: new Date('2026-07-12T10:00:00.000Z'),
    });

    const result = await locationService.recordLocation({
      vehicleId: 'vehicle-1',
      latitude: 23.03,
      longitude: 72.58,
    });

    expect(result).toEqual({
      vehicleId: 'vehicle-1',
      position: [23.03, 72.58],
      timestamp: '2026-07-12T10:00:00.000Z',
    });
  });
});

describe('locationService.getLatestLocations', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns only the most recent point per vehicle', async () => {
    (prisma.vehicleLocation.findMany as jest.Mock).mockResolvedValue([
      {
        vehicleId: 'vehicle-1',
        latitude: 23.05,
        longitude: 72.6,
        timestamp: new Date('2026-07-12T11:00:00.000Z'),
      },
      {
        vehicleId: 'vehicle-1',
        latitude: 23.03,
        longitude: 72.58,
        timestamp: new Date('2026-07-12T10:00:00.000Z'),
      },
      {
        vehicleId: 'vehicle-2',
        latitude: 22.3,
        longitude: 70.8,
        timestamp: new Date('2026-07-12T09:30:00.000Z'),
      },
    ]);

    const result = await locationService.getLatestLocations();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      vehicleId: 'vehicle-1',
      position: [23.05, 72.6],
      timestamp: '2026-07-12T11:00:00.000Z',
    });
  });

  it('filters by vehicleIds when provided', async () => {
    (prisma.vehicleLocation.findMany as jest.Mock).mockResolvedValue([]);

    await locationService.getLatestLocations(['vehicle-1']);

    expect(prisma.vehicleLocation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { vehicleId: { in: ['vehicle-1'] } } })
    );
  });
});

describe('locationService.getVehicleLocationHistory', () => {
  beforeEach(() => jest.clearAllMocks());

  it('throws 404 when the vehicle does not exist', async () => {
    (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(locationService.getVehicleLocationHistory('missing')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('returns ordered Leaflet points for a valid vehicle', async () => {
    (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(mockVehicle);
    (prisma.vehicleLocation.findMany as jest.Mock).mockResolvedValue([
      {
        vehicleId: 'vehicle-1',
        latitude: 23.0,
        longitude: 72.5,
        timestamp: new Date('2026-07-12T08:00:00.000Z'),
      },
    ]);

    const result = await locationService.getVehicleLocationHistory('vehicle-1', { limit: 100 });

    expect(prisma.vehicleLocation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 })
    );
    expect(result[0].position).toEqual([23.0, 72.5]);
  });
});
