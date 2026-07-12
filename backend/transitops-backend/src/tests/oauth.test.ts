import { googleAuthService } from '../services/googleAuthService';
import { googleOAuthClient } from '../config/googleOauth';
import { prisma } from '../config/db';
import { emailService } from '../services/emailService';

jest.mock('../config/googleOauth', () => ({
  googleOAuthClient: { verifyIdToken: jest.fn() },
  googleClientId: 'test-client-id',
}));

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
  emailService: {
    sendWelcomeEmail: jest.fn().mockResolvedValue({ sent: true }),
  },
}));

describe('googleAuthService.verifyGoogleIdToken', () => {
  beforeEach(() => jest.clearAllMocks());

  it('throws 400 if no idToken is provided', async () => {
    await expect(googleAuthService.verifyGoogleIdToken('')).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('throws 401 when Google rejects the token', async () => {
    (googleOAuthClient.verifyIdToken as jest.Mock).mockRejectedValue(new Error('bad token'));
    await expect(googleAuthService.verifyGoogleIdToken('bad-token')).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('throws 401 when the payload is missing required fields', async () => {
    (googleOAuthClient.verifyIdToken as jest.Mock).mockResolvedValue({
      getPayload: () => ({ sub: undefined, email: undefined }),
    });
    await expect(googleAuthService.verifyGoogleIdToken('token')).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('throws 401 when the Google email is unverified', async () => {
    (googleOAuthClient.verifyIdToken as jest.Mock).mockResolvedValue({
      getPayload: () => ({
        sub: 'google-123',
        email: 'driver@example.com',
        email_verified: false,
        name: 'Test Driver',
      }),
    });
    await expect(googleAuthService.verifyGoogleIdToken('token')).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('returns a normalized profile on success', async () => {
    (googleOAuthClient.verifyIdToken as jest.Mock).mockResolvedValue({
      getPayload: () => ({
        sub: 'google-123',
        email: 'driver@example.com',
        email_verified: true,
        name: 'Test Driver',
      }),
    });

    const profile = await googleAuthService.verifyGoogleIdToken('good-token');

    expect(profile).toEqual({
      googleId: 'google-123',
      email: 'driver@example.com',
      name: 'Test Driver',
      emailVerified: true,
    });
  });
});

describe('googleAuthService.findOrCreateGoogleUser', () => {
  const profile = {
    googleId: 'google-123',
    email: 'driver@example.com',
    name: 'Test Driver',
    emailVerified: true,
  };

  beforeEach(() => jest.clearAllMocks());

  it('returns the existing user when found by googleId (no new email sent)', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 'user-1',
      email: profile.email,
      googleId: profile.googleId,
      role: 'DRIVER',
    });

    const result = await googleAuthService.findOrCreateGoogleUser(profile);

    expect(result.isNewUser).toBe(false);
    expect(emailService.sendWelcomeEmail).not.toHaveBeenCalled();
  });

  it('links googleId to an existing LOCAL user found by email', async () => {
    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce(null) // by googleId
      .mockResolvedValueOnce({
        id: 'user-2',
        email: profile.email,
        password: 'hashed',
        authProvider: 'LOCAL',
      }); // by email

    (prisma.user.update as jest.Mock).mockResolvedValue({
      id: 'user-2',
      email: profile.email,
      googleId: profile.googleId,
      authProvider: 'LOCAL',
    });

    const result = await googleAuthService.findOrCreateGoogleUser(profile);

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'user-2' } })
    );
    expect(result.isNewUser).toBe(false);
    expect(emailService.sendWelcomeEmail).not.toHaveBeenCalled();
  });

  it('creates a brand-new user and sends the welcome email exactly once', async () => {
    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce(null) // by googleId
      .mockResolvedValueOnce(null); // by email

    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: 'user-3',
      email: profile.email,
      name: profile.name,
      role: 'DRIVER',
      googleId: profile.googleId,
      authProvider: 'GOOGLE',
    });

    const result = await googleAuthService.findOrCreateGoogleUser(profile);

    expect(result.isNewUser).toBe(true);
    expect(prisma.user.create).toHaveBeenCalledTimes(1);
    expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(
      profile.email,
      expect.objectContaining({ email: profile.email, name: profile.name })
    );
  });
});
