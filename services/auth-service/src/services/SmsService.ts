import twilio from 'twilio';
import { config } from '../config';
import { createLogger } from '@realestate/utils';

const logger = createLogger('SmsService');

export class SmsService {
  private _client: twilio.Twilio | null = null;

  private get client(): twilio.Twilio {
    if (!this._client) {
      this._client = twilio(config.twilio.accountSid, config.twilio.authToken);
    }
    return this._client;
  }

  async sendOtp(phone: string, otpCode: string): Promise<void> {
    if (config.env === 'development') {
      logger.info(`[DEV] OTP for ${phone}: ${otpCode}`);
      return;
    }

    try {
      await this.client.messages.create({
        body: `رمز التحقق الخاص بك هو: ${otpCode}\nYour verification code: ${otpCode}\nValid for ${config.otp.expiresInMinutes} minutes.`,
        from: config.twilio.phoneNumber,
        to: phone,
      });
      logger.info(`OTP sent to ${phone}`);
    } catch (error) {
      logger.error(`Failed to send OTP to ${phone}`, error);
      throw new Error('Failed to send OTP. Please try again.');
    }
  }
}
