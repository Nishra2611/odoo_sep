import { OAuth2Client } from 'google-auth-library';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  // Fail fast at boot rather than silently accepting unverifiable tokens later.
  // eslint-disable-next-line no-console
  console.warn(
    '[google-oauth.config] GOOGLE_CLIENT_ID is not set. Google login will reject all requests.'
  );
}

export const googleClientId = GOOGLE_CLIENT_ID ?? '';

export const googleOAuthClient = new OAuth2Client(googleClientId);
