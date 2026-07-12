import { Router } from 'express';
import * as vehicleController from '../controllers/vehicleController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
const MANAGE_ROLES = ['FLEET_MANAGER'];
const VIEW_ROLES = ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'];

router.get('/', authenticate, authorize(VIEW_ROLES), vehicleController.list);
router.get('/:id', authenticate, authorize(VIEW_ROLES), vehicleController.getOne);
router.post('/', authenticate, authorize(MANAGE_ROLES), vehicleController.create);
router.patch('/:id', authenticate, authorize(MANAGE_ROLES), vehicleController.update);
router.delete('/:id', authenticate, authorize(MANAGE_ROLES), vehicleController.remove);

export default router;
