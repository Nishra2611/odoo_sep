import { Router } from 'express';
import * as tripController from '../controllers/tripController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
const MANAGE_ROLES = ['FLEET_MANAGER'];
const VIEW_ROLES = ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'];

router.get('/', authenticate, authorize(VIEW_ROLES), tripController.list);
router.get('/:id', authenticate, authorize(VIEW_ROLES), tripController.getOne);
router.post('/', authenticate, authorize(MANAGE_ROLES), tripController.create);
router.post('/:id/dispatch', authenticate, authorize(MANAGE_ROLES), tripController.dispatch);
router.post('/:id/complete', authenticate, authorize(MANAGE_ROLES), tripController.complete);
router.post('/:id/cancel', authenticate, authorize(MANAGE_ROLES), tripController.cancel);

export default router;
