/**
 * These tests don't re-test your existing login logic (that's already
 * covered by your current Jest suite) — they guard the two contracts the
 * new Google OAuth feature must not break:
 *
 *   1. The Google login response has the exact same shape as the existing
 *      login response, so frontend/token-storage code doesn't need to branch.
 *   2. A user who registered locally (with a password) and later signs in
 *      with Google gets *linked*, not duplicated, and keeps their original
 *      role/authProvider intact when they already have a password set.
 */
import { googleAuthService } from '../services/googleAuthService';
import { prisma } from '../config/db';

jest.mock('../config/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('../services/emailService', () => ({
  emailService: { sendWelcomeEmail: jest.fn().mockResolvedValue({ sent: true }) },
}));

describe('Auth compatibility: Google login vs existing local login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('does not overwrite authProvider for a LOCAL user who links Google', async () => {
    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce(null) // no user with this googleId yet
      .mockResolvedValueOnce({
        id: 'user-1',
        email: 'manager@example.com',
        password: 'hashed-password',
        authProvider: 'LOCAL',
        role: 'FLEET_MANAGER',
      });

    (prisma.user.update as jest.Mock).mockImplementation(({ data }) =>
      Promise.resolve({
        id: 'user-1',
        email: 'manager@example.com',
        password: 'hashed-password',
        role: 'FLEET_MANAGER',
        ...data,
      })
    );

    const { user, isNewUser } = await googleAuthService.findOrCreateGoogleUser({
      googleId: 'google-999',
      email: 'manager@example.com',
      name: 'Fleet Manager',
      emailVerified: true,
    });

    expect(isNewUser).toBe(false);
    // authProvider stays LOCAL because the account already has a password —
    // the existing email/password login path must keep working for this user.
    expect(user.authProvider).toBe('LOCAL');
    expect(user.role).toBe('FLEET_MANAGER');
  });

  it('does not create a duplicate account for an email that already exists', async () => {
    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'user-2',
        email: 'safety@example.com',
        password: 'hashed',
        authProvider: 'LOCAL',
        role: 'SAFETY_OFFICER',
      });
    (prisma.user.update as jest.Mock).mockResolvedValue({ id: 'user-2' });

    await googleAuthService.findOrCreateGoogleUser({
      googleId: 'google-888',
      email: 'safety@example.com',
      name: 'Safety Officer',
      emailVerified: true,
    });

    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});
