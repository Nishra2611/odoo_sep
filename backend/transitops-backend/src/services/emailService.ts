import { resendClient, RESEND_FROM_EMAIL } from '../config/resend';
import { welcomeEmailTemplate, WelcomeEmailData } from '../templates/emails/welcomeTemplate';
import {
  lateTicketEmailTemplate,
  LateTicketEmailData,
} from '../templates/emails/lateTicketTemplate';

/**
 * Centralized email service. Every outbound email in the app should go
 * through here so templates, the "from" address, and error handling stay
 * in one place.
 *
 * Failures are logged but never thrown — a missing/failed email should
 * never roll back a business transaction (e.g. user registration, ticket
 * creation). Callers that need to know the outcome can check the
 * returned `{ sent: boolean }` result.
 */

interface SendResult {
  sent: boolean;
  id?: string;
  error?: string;
}

async function sendWelcomeEmail(to: string, data: WelcomeEmailData): Promise<SendResult> {
  const { subject, html } = welcomeEmailTemplate(data);
  return dispatch(to, subject, html, 'welcome');
}

async function sendLateTicketEmail(to: string, data: LateTicketEmailData): Promise<SendResult> {
  const { subject, html } = lateTicketEmailTemplate(data);
  return dispatch(to, subject, html, 'late-ticket');
}

async function dispatch(
  to: string,
  subject: string,
  html: string,
  templateName: string
): Promise<SendResult> {
  try {
    const { data, error } = await resendClient.emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      // eslint-disable-next-line no-console
      console.error(`[email.service] Failed to send "${templateName}" email to ${to}:`, error);
      return { sent: false, error: error.message };
    }

    return { sent: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown email error';
    // eslint-disable-next-line no-console
    console.error(`[email.service] Exception sending "${templateName}" email to ${to}:`, message);
    return { sent: false, error: message };
  }
}

export const emailService = {
  sendWelcomeEmail,
  sendLateTicketEmail,
};
