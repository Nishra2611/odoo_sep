import { prisma } from '../config/db';
import { googleOAuthClient, googleClientId } from '../config/googleOauth';
import { AppError } from '../middleware/errorHandler';
import { emailService } from './emailService';

interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

/**
 * Verifies a Google ID token (sent from the frontend's Google Sign-In flow)
 * and returns the decoded, trusted profile. Never trust a client-supplied
 * email/name directly — always verify the token server-side.
 */
async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  if (!idToken) {
    throw new AppError('Google idToken is required', 400);
  }

  let ticket;
  try {
    ticket = await googleOAuthClient.verifyIdToken({
      idToken,
      audience: googleClientId,
    });
  } catch (err) {
    throw new AppError('Invalid or expired Google token', 401);
  }

  const payload = ticket.getPayload();

  if (!payload || !payload.sub || !payload.email) {
    throw new AppError('Google token did not contain the expected profile data', 401);
  }

  if (!payload.email_verified) {
    throw new AppError('Google account email is not verified', 401);
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name ?? payload.email.split('@')[0],
    emailVerified: payload.email_verified,
  };
}

/**
 * Finds an existing user by googleId or email, or creates a new one.
 *
 * - If a user already exists with this email but registered via LOCAL
 *   (password) signup, we link the googleId to that account rather than
 *   creating a duplicate — this keeps "existing users should simply log in"
 *   true regardless of how they originally signed up.
 * - Brand-new users are created with role DRIVER by default (adjust to your
 *   product's actual default/invite flow if different) and trigger the
 *   welcome email exactly once, on creation.
 */
async function findOrCreateGoogleUser(profile: GoogleProfile) {
  const existingByGoogleId = await prisma.user.findUnique({
    where: { googleId: profile.googleId },
  });

  if (existingByGoogleId) {
    return { user: existingByGoogleId, isNewUser: false };
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: profile.email },
  });

  if (existingByEmail) {
    const linkedUser = await prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        googleId: profile.googleId,
        authProvider: existingByEmail.password ? existingByEmail.authProvider : 'GOOGLE',
      },
    });
    return { user: linkedUser, isNewUser: false };
  }

  const newUser = await prisma.user.create({
    data: {
      email: profile.email,
      name: profile.name,
      googleId: profile.googleId,
      authProvider: 'GOOGLE',
      password: null,
      role: 'DRIVER', // NOTE: adjust default role to match product requirements
    },
  });

  // Fire-and-forget: don't block/fail login on email delivery.
  emailService
    .sendWelcomeEmail(newUser.email, {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[google-auth.service] Welcome email dispatch failed:', err);
    });

  return { user: newUser, isNewUser: true };
}

export const googleAuthService = {
  verifyGoogleIdToken,
  findOrCreateGoogleUser,
};
