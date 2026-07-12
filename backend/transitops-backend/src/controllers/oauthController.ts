import { Request, Response, NextFunction } from 'express';
import { googleAuthService } from '../services/googleAuthService';
import { signAccessToken, signRefreshToken } from '../utils/jwt';

/**
 * POST /api/v1/auth/google
 * Body: { idToken: string }
 *
 * Mirrors the existing email/password login response shape exactly:
 *   { user, accessToken, refreshToken }
 * so frontend clients can reuse the same auth-handling code path
 * regardless of which login method was used.
 */
export async function googleLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { idToken } = req.body as { idToken: string };

    const profile = await googleAuthService.verifyGoogleIdToken(idToken);
    const { user, isNewUser } = await googleAuthService.findOrCreateGoogleUser(profile);

    const tokenPayload = { userId: user.id, role: user.role };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    return res.status(isNewUser ? 201 : 200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        authProvider: user.authProvider,
      },
      token: accessToken,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    return next(err);
  }
}
