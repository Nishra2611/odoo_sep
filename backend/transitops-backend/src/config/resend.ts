import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  // eslint-disable-next-line no-console
  console.warn('[resend.config] RESEND_API_KEY is not set. Emails will fail to send.');
}

export const resendClient = new Resend(RESEND_API_KEY ?? '');

export const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? 'TransitOps <notifications@transitops.example.com>';
