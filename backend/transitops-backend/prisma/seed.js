"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding TransitOps demo data...');
    const password = await bcryptjs_1.default.hash('password123', 12);
    const fleetManager = await prisma.user.create({
        data: { name: 'Priya Sharma', email: 'manager@transitops.dev', password, role: 'FLEET_MANAGER' },
    });
    await prisma.user.create({
        data: { name: 'Kavita Rao', email: 'safety@transitops.dev', password, role: 'SAFETY_OFFICER' },
    });
    await prisma.user.create({
        data: { name: 'Rohan Mehta', email: 'finance@transitops.dev', password, role: 'FINANCIAL_ANALYST' },
    });
    // Vehicles covering every status so the rule engine has real edge cases to demo
    const truck1 = await prisma.vehicle.create({
        data: {
            regNumber: 'GJ-01-AB-1234',
            model: 'Tata LPT 1613',
            type: 'TRUCK',
            loadCapacityKg: 9000,
            odometerKm: 45210,
            acquisitionCost: 2500000,
            region: 'Ahmedabad',
            status: 'AVAILABLE',
        },
    });
    const van1 = await prisma.vehicle.create({
        data: {
            regNumber: 'GJ-01-CD-5678',
            model: 'Mahindra Bolero Pickup',
            type: 'VAN',
            loadCapacityKg: 1500,
            odometerKm: 12030,
            acquisitionCost: 900000,
            region: 'Ahmedabad',
            status: 'AVAILABLE',
        },
    });
    await prisma.vehicle.create({
        data: {
            regNumber: 'GJ-05-EF-9012',
            model: 'Ashok Leyland Dost',
            type: 'PICKUP',
            loadCapacityKg: 1250,
            odometerKm: 78900,
            acquisitionCost: 700000,
            region: 'Surat',
            status: 'IN_SHOP', // demo: cannot be dispatched
        },
    });
    await prisma.vehicle.create({
        data: {
            regNumber: 'GJ-01-GH-3456',
            model: 'Tata 407 Gold',
            type: 'TRAILER',
            loadCapacityKg: 3500,
            odometerKm: 152000,
            acquisitionCost: 1100000,
            region: 'Vadodara',
            status: 'RETIRED', // demo: cannot be dispatched
        },
    });
    // Drivers covering edge cases
    const driver1 = await prisma.driver.create({
        data: {
            name: 'Arjun Patel',
            licenseNumber: 'DL-GJ-2020-001',
            licenseExpiry: new Date('2027-06-30'), // valid
            contact: '9876500001',
            safetyScore: 92,
            status: 'AVAILABLE',
        },
    });
    await prisma.driver.create({
        data: {
            name: 'Vikram Singh',
            licenseNumber: 'DL-GJ-2019-002',
            licenseExpiry: new Date('2025-01-15'), // demo: already expired
            contact: '9876500002',
            safetyScore: 78,
            status: 'AVAILABLE',
        },
    });
    await prisma.driver.create({
        data: {
            name: 'Rakesh Kumar',
            licenseNumber: 'DL-GJ-2021-003',
            licenseExpiry: new Date('2027-03-20'),
            contact: '9876500003',
            safetyScore: 65,
            status: 'SUSPENDED', // demo: cannot be dispatched
        },
    });
    await prisma.driver.create({
        data: {
            name: 'Sunita Devi',
            licenseNumber: 'DL-GJ-2022-004',
            licenseExpiry: new Date('2026-08-10'),
            contact: '9876500004',
            safetyScore: 88,
            status: 'AVAILABLE',
        },
    });
    // A draft trip ready to dispatch live in the demo
    await prisma.trip.create({
        data: {
            driverId: driver1.id,
            vehicleId: truck1.id,
            source: 'Ahmedabad',
            destination: 'Mumbai',
            cargoWeightKg: 6000,
            plannedDistanceKm: 530,
            status: 'DRAFT',
        },
    });
    // Sample fuel logs for analytics
    await prisma.fuelLog.createMany({
        data: [
            { vehicleId: truck1.id, liters: 150, cost: 15000, odometerKm: 44000 },
            { vehicleId: truck1.id, liters: 140, cost: 14200, odometerKm: 44850 },
            { vehicleId: van1.id, liters: 40, cost: 4200, odometerKm: 11800 },
        ],
    });
    await prisma.expense.createMany({
        data: [
            { vehicleId: truck1.id, category: 'Toll', amount: 1200 },
            { vehicleId: truck1.id, category: 'Insurance', amount: 25000 },
        ],
    });
    console.log('Seed complete. Login with manager@transitops.dev / password123');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map