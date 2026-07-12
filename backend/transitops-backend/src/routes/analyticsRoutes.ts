import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
const VIEW_ROLES = ['FLEET_MANAGER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'];

router.get('/dashboard', authenticate, authorize(VIEW_ROLES), analyticsController.dashboard);
router.get('/vehicle/:id', authenticate, authorize(VIEW_ROLES), analyticsController.vehicleAnalytics);

export default router;
