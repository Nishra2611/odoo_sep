export interface LateTicketEmailData {
  driverName: string;
  driverEmail: string;
  tripId: string;
  scheduledTime: string;
  actualTime: string;
  minutesLate: number;
  ticketId: string;
}

export function lateTicketEmailTemplate(
  data: LateTicketEmailData
): { subject: string; html: string } {
  const { driverName, tripId, scheduledTime, actualTime, minutesLate, ticketId } = data;
  const frontendUrl = process.env.FRONTEND_URL ?? '#';

  const subject = `Late Ticket Issued — Trip ${tripId}`;

  const html = `
  <!DOCTYPE html>
  <html>
    <body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:32px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
              <tr>
                <td style="background:#b91c1c;padding:24px 32px;">
                  <span style="color:#ffffff;font-size:18px;font-weight:bold;">Late Ticket Notice</span>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;">
                  <p style="margin:0 0 16px;font-size:14px;line-height:22px;color:#334155;">
                    Hi ${escapeHtml(driverName)}, a late ticket has been issued for the following trip.
                  </p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:6px;">
                    <tr>
                      <td style="padding:12px 16px;font-size:13px;color:#64748b;border-bottom:1px solid #e2e8f0;">Ticket ID</td>
                      <td style="padding:12px 16px;font-size:13px;color:#0f172a;border-bottom:1px solid #e2e8f0;text-align:right;">${escapeHtml(ticketId)}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 16px;font-size:13px;color:#64748b;border-bottom:1px solid #e2e8f0;">Trip ID</td>
                      <td style="padding:12px 16px;font-size:13px;color:#0f172a;border-bottom:1px solid #e2e8f0;text-align:right;">${escapeHtml(tripId)}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 16px;font-size:13px;color:#64748b;border-bottom:1px solid #e2e8f0;">Scheduled</td>
                      <td style="padding:12px 16px;font-size:13px;color:#0f172a;border-bottom:1px solid #e2e8f0;text-align:right;">${escapeHtml(scheduledTime)}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 16px;font-size:13px;color:#64748b;border-bottom:1px solid #e2e8f0;">Actual</td>
                      <td style="padding:12px 16px;font-size:13px;color:#0f172a;border-bottom:1px solid #e2e8f0;text-align:right;">${escapeHtml(actualTime)}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 16px;font-size:13px;color:#64748b;">Minutes Late</td>
                      <td style="padding:12px 16px;font-size:13px;color:#b91c1c;font-weight:bold;text-align:right;">${minutesLate}</td>
                    </tr>
                  </table>
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                    <tr>
                      <td style="background:#0f172a;border-radius:6px;">
                        <a href="${frontendUrl}" style="display:inline-block;padding:12px 24px;font-size:14px;color:#ffffff;text-decoration:none;font-weight:bold;">
                          View in TransitOps
                        </a>
                      </td>
                    </tr>
                  </table>
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
