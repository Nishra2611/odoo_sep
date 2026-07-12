import { Router } from 'express';
import authRoutes from './authRoutes';
import vehicleRoutes from './vehicleRoutes';
import driverRoutes from './driverRoutes';
import tripRoutes from './tripRoutes';
import maintenanceRoutes from './maintenanceRoutes';
import fuelExpenseRoutes from './fuelExpenseRoutes';
import analyticsRoutes from './analyticsRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/drivers', driverRoutes);
router.use('/trips', tripRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/', fuelExpenseRoutes); // exposes /fuel-logs and /expenses
router.use('/analytics', analyticsRoutes);

export default router;
