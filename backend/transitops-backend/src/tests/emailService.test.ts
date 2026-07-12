import { emailService } from '../services/emailService';
import { resendClient } from '../config/resend';

jest.mock('../config/resend', () => ({
  resendClient: { emails: { send: jest.fn() } },
  RESEND_FROM_EMAIL: 'TransitOps <notifications@transitops.example.com>',
}));

describe('emailService.sendWelcomeEmail', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sends a welcome email with the correct recipient and subject', async () => {
    (resendClient.emails.send as jest.Mock).mockResolvedValue({
      data: { id: 'email-1' },
      error: null,
    });

    const result = await emailService.sendWelcomeEmail('driver@example.com', {
      name: 'Test Driver',
      email: 'driver@example.com',
      role: 'DRIVER',
    });

    expect(resendClient.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'driver@example.com',
        subject: expect.stringContaining('Welcome'),
        html: expect.stringContaining('Test Driver'),
      })
    );
    expect(result).toEqual({ sent: true, id: 'email-1' });
  });

  it('returns sent:false without throwing when Resend returns an error', async () => {
    (resendClient.emails.send as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'invalid domain' },
    });

    const result = await emailService.sendWelcomeEmail('driver@example.com', {
      name: 'Test Driver',
      email: 'driver@example.com',
      role: 'DRIVER',
    });

    expect(result).toEqual({ sent: false, error: 'invalid domain' });
  });

  it('returns sent:false without throwing when Resend throws', async () => {
    (resendClient.emails.send as jest.Mock).mockRejectedValue(new Error('network down'));

    const result = await emailService.sendWelcomeEmail('driver@example.com', {
      name: 'Test Driver',
      email: 'driver@example.com',
      role: 'DRIVER',
    });

    expect(result).toEqual({ sent: false, error: 'network down' });
  });
});

describe('emailService.sendLateTicketEmail', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sends a late ticket email containing the trip and ticket IDs', async () => {
    (resendClient.emails.send as jest.Mock).mockResolvedValue({
      data: { id: 'email-2' },
      error: null,
    });

    const result = await emailService.sendLateTicketEmail('driver@example.com', {
      driverName: 'Test Driver',
      driverEmail: 'driver@example.com',
      tripId: 'trip-123',
      scheduledTime: '09:00',
      actualTime: '09:25',
      minutesLate: 25,
      ticketId: 'ticket-456',
    });

    expect(resendClient.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'driver@example.com',
        subject: expect.stringContaining('trip-123'),
        html: expect.stringContaining('ticket-456'),
      })
    );
    expect(result.sent).toBe(true);
  });
});
