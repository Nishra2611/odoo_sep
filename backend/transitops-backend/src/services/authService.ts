import { prisma } from '../config/db';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

export async function signup(name: string, email: string, password: string, role: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Email already registered', 409);

  const hashed = await hashPassword(password);

  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: role as any },
  });

  // If signing up as a Driver, auto-create a linked Driver profile so they
  // immediately appear in fleet operations (placeholder license data that
  // Safety Officer/Fleet Manager should complete afterwards).
  if (role === 'DRIVER') {
    await prisma.driver.create({
      data: {
        userId: user.id,
        name,
        licenseNumber: `PENDING-${user.id.slice(0, 8)}`,
        licenseExpiry: new Date(),
        contact: 'PENDING',
      },
    });
  }

  const token = signToken({ userId: user.id, role: user.role });
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) throw new AppError('Invalid credentials', 401);

  const valid = await comparePassword(password, user.password);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const token = signToken({ userId: user.id, role: user.role });
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

export async function loginWithGoogle(accessToken: string, role: string) {
  // Fetch user info from Google using the access token
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new AppError('Invalid Google access token', 401);
  }

  const googleUser = await response.json();
  const email = googleUser.email;
  const name = googleUser.name || 'Google User';
  const googleId = googleUser.sub;

  if (!email) throw new AppError('Google account has no email', 400);

  // Check if user exists
  let user = await prisma.user.findFirst({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: { name, email, role: role as any, authProvider: 'GOOGLE', googleId },
    });

    if (role === 'DRIVER') {
      await prisma.driver.create({
        data: {
          userId: user.id,
          name,
          licenseNumber: `PENDING-${user.id.slice(0, 8)}`,
          licenseExpiry: new Date(),
          contact: 'PENDING',
        },
      });
    }
  } else {
    // If user exists but used local auth before, link googleId if missing
    if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, authProvider: 'GOOGLE' },
      });
    }
    if (user.role !== role) {
      throw new AppError(`Account role mismatch. Expected ${role}.`, 403);
    }
  }

  const token = signToken({ userId: user.id, role: user.role });
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
}
