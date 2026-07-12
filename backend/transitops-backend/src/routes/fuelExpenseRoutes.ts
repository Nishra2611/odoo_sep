import { Router } from 'express';
import * as controller from '../controllers/fuelExpenseController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();
const MANAGE_ROLES = ['FLEET_MANAGER', 'FINANCIAL_ANALYST'];
const VIEW_ROLES = ['FLEET_MANAGER', 'FINANCIAL_ANALYST'];

router.get('/fuel-logs', authenticate, authorize(VIEW_ROLES), controller.listFuelLogs);
router.post('/fuel-logs', authenticate, authorize(MANAGE_ROLES), controller.createFuelLog);
router.get('/expenses', authenticate, authorize(VIEW_ROLES), controller.listExpenses);
router.post('/expenses', authenticate, authorize(MANAGE_ROLES), controller.createExpense);

export default router;
