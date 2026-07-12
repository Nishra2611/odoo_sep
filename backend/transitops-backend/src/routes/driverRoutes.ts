import { Router } from 'express';
import * as driverController from '../controllers/driverController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
const MANAGE_ROLES = ['FLEET_MANAGER', 'SAFETY_OFFICER'];
const VIEW_ROLES = ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'];

router.get('/', authenticate, authorize(VIEW_ROLES), driverController.list);
router.get('/:id', authenticate, authorize(VIEW_ROLES), driverController.getOne);
router.post('/', authenticate, authorize(MANAGE_ROLES), driverController.create);
router.patch('/:id', authenticate, authorize(MANAGE_ROLES), driverController.update);

export default router;
