export interface WelcomeEmailData {
  name: string;
  email: string;
  role: string;
}

/**
 * Reusable, inline-styled HTML template (safe for all major email clients).
 */
export function welcomeEmailTemplate(data: WelcomeEmailData): { subject: string; html: string } {
  const { name, email, role } = data;
  const frontendUrl = process.env.FRONTEND_URL ?? '#';

  const subject = 'Welcome to TransitOps 🚚';

  const html = `
  <!DOCTYPE html>
  <html>
    <body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:32px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
              <tr>
                <td style="background:#0f172a;padding:24px 32px;">
                  <span style="color:#ffffff;font-size:20px;font-weight:bold;">TransitOps</span>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;">
                  <h1 style="margin:0 0 16px;font-size:20px;color:#0f172a;">Welcome, ${escapeHtml(name)}!</h1>
                  <p style="margin:0 0 16px;font-size:14px;line-height:22px;color:#334155;">
                    Your TransitOps account has been created via Google Sign-In using
                    <strong>${escapeHtml(email)}</strong>.
                  </p>
                  <p style="margin:0 0 16px;font-size:14px;line-height:22px;color:#334155;">
                    You've been set up with the <strong>${escapeHtml(role)}</strong> role. You can now
                    sign in and start managing fleet operations right away.
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                    <tr>
                      <td style="background:#2563eb;border-radius:6px;">
                        <a href="${frontendUrl}" style="display:inline-block;padding:12px 24px;font-size:14px;color:#ffffff;text-decoration:none;font-weight:bold;">
                          Go to Dashboard
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 32px;background:#f8fafc;">
                  <p style="margin:0;font-size:12px;color:#94a3b8;">
                    You're receiving this because a TransitOps account was created for this email address.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;

  return { subject, html };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
