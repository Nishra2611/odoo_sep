import { Response, NextFunction } from 'express';
import { signupSchema, loginSchema } from '../validators/authValidator';
import * as authService from '../services/authService';
import { AuthRequest } from '../middleware/auth';

export async function signup(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = signupSchema.parse(req.body);
    const result = await authService.signup(data.name, data.email, data.password, data.role);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data.email, data.password);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function googleLogin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { accessToken, role } = req.body;
    if (!accessToken || !role) {
      return res.status(400).json({ error: 'Missing accessToken or role' });
    }
    const result = await authService.loginWithGoogle(accessToken, role);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user!.userId);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}
