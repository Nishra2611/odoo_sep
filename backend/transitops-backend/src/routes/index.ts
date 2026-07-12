import { Router } from 'express';
import authRoutes from './authRoutes';
import vehicleRoutes from './vehicleRoutes';
import driverRoutes from './driverRoutes';
import tripRoutes from './tripRoutes';
import maintenanceRoutes from './maintenanceRoutes';
import fuelExpenseRoutes from './fuelExpenseRoutes';
import analyticsRoutes from './analyticsRoutes';
import oauthRoutes from './oauthRoutes';
import locationRoutes from './locationRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/auth', oauthRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/drivers', driverRoutes);
router.use('/trips', tripRoutes);
router.use('/locations', locationRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/', fuelExpenseRoutes); // exposes /fuel-logs and /expenses
router.use('/analytics', analyticsRoutes);

export default router;
