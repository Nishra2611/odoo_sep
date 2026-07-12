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
  if (!user) throw new AppError('Invalid credentials', 401);

  const valid = await comparePassword(password, user.password);
  if (!valid) throw new AppError('Invalid credentials', 401);

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
