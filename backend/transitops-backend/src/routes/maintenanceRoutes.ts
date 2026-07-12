import { Router } from 'express';
import * as maintenanceController from '../controllers/maintenanceController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
const MANAGE_ROLES = ['FLEET_MANAGER', 'SAFETY_OFFICER'];
const VIEW_ROLES = ['FLEET_MANAGER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'];

router.get('/', authenticate, authorize(VIEW_ROLES), maintenanceController.list);
router.post('/', authenticate, authorize(MANAGE_ROLES), maintenanceController.create);
router.post('/:id/complete', authenticate, authorize(MANAGE_ROLES), maintenanceController.complete);

export default router;
