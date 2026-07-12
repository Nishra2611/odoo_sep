import { Router } from 'express';
import {
  recordLocation,
  getLatestLocations,
  getVehicleLocationHistory,
} from '../controllers/locationController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { validate } from '../middleware/validate.middleware';
import {
  recordLocationSchema,
  getLatestLocationsSchema,
  getVehicleLocationHistorySchema,
} from '../validators/locationValidator';

const router = Router();

// All location endpoints require auth. Writing a location ping is
// restricted to Fleet Managers/Safety Officers (or a telematics service
// account with that role) — reads are open to any authenticated role
// that already has fleet visibility. Adjust roles to match your product.
router.post(
  '/',
  authenticate,
  authorize(['FLEET_MANAGER', 'SAFETY_OFFICER']),
  validate(recordLocationSchema),
  recordLocation
);

router.get('/latest', authenticate, validate(getLatestLocationsSchema), getLatestLocations);

router.get(
  '/:vehicleId/history',
  authenticate,
  validate(getVehicleLocationHistorySchema),
  getVehicleLocationHistory
);

export default router;
