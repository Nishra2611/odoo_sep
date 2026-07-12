import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

/**
 * Restricts a route to a whitelist of roles. Must run AFTER `authenticate`
 * so that req.user is already populated.
 *
 * This is the real enforcement layer - the frontend may also hide buttons
 * for UX purposes, but that is never trusted as a security boundary.
 */
export function authorize(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role permissions' });
    }
    next();
  };
}
