import { Router } from 'express';
import { googleLogin } from '../controllers/oauthController';
import { validate } from '../middleware/validate.middleware';
import { googleLoginSchema } from '../validators/oauthValidator';

const router = Router();

// Public route — same trust level as the existing POST /auth/login
router.post('/google', validate(googleLoginSchema), googleLogin);

export default router;
