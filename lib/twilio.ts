import { Twilio } from 'twilio';

// Initialize Twilio client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export interface SMSParams {
  to: string;
  body: string;
  from?: string;
}

export interface SMSServiceResult {
  success: boolean;
  sid?: string;
  error?: string;
  message: string;
}

/**
 * Send SMS using Twilio
 */
export async function sendSMS(params: SMSParams): Promise<SMSServiceResult> {
  try {
    // Validate Twilio configuration
    if (!twilioClient) {
      throw new Error('Twilio not configured. Please check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.');
    }

    if (!process.env.TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio phone number not configured. Please set TWILIO_PHONE_NUMBER environment variable.');
    }

    // Validate phone number format
    if (!isValidPhoneNumber(params.to)) {
      throw new Error(`Invalid phone number format: ${params.to}. Phone numbers must be 10-15 digits and can include country code.`);
    }

    const formattedTo = formatPhoneNumber(params.to);
    const formattedFrom = formatPhoneNumber(params.from || process.env.TWILIO_PHONE_NUMBER!);

    // Log attempt for debugging
    console.log(`Attempting to send SMS to ${formattedTo} from ${formattedFrom}`);

    // Send SMS
    const message = await twilioClient.messages.create({
      body: params.body,
      from: formattedFrom,
      to: formattedTo
    });

    console.log(`SMS sent successfully. SID: ${message.sid}, To: ${formattedTo}, Status: ${message.status}`);

    return {
      success: true,
      sid: message.sid,
      message: `SMS sent successfully to ${params.to}`
    };

  } catch (error: any) {
    console.error('SMS sending failed:', error);

    // Handle specific Twilio errors
    let errorMessage = error.message;
    if (error.code === 21211) {
      errorMessage = `Invalid 'To' Phone Number: ${params.to}. Please check the phone number format and ensure it's a valid mobile number.`;
    }

    return {
      success: false,
      error: errorMessage || error.message,
      message: `Failed to send SMS to ${params.to}: ${errorMessage || error.message}`
    };
  }
}

/**
 * Format phone number to E.164 format
 */
function formatPhoneNumber(phoneNumber: string): string {
  // Allow X characters for testing/masked numbers, but remove other non-digit characters
  let cleaned = phoneNumber.replace(/[^0-9X+]/g, '');

  // If already has + prefix, just validate the rest
  if (phoneNumber.startsWith('+')) {
    return '+' + cleaned;
  }

  // Handle specific country patterns - only add country code for recognized patterns
  if (cleaned.length === 10) {
    // US number format - add country code 1
    if (cleaned.startsWith('0')) {
      // Pakistan format - don't add country code, keep as is
      // Pakistan numbers start with 0, followed by 9 digits
      return cleaned;
    } else {
      cleaned = '1' + cleaned;
    }
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    // UK format - remove leading 0 and add 44
    cleaned = '44' + cleaned.substring(1);
  } else if (cleaned.length >= 10 && cleaned.length <= 15) {
    // Already has country code or is international format
    // Don't modify, just add + if needed
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
  } else {
    // Invalid length
    throw new Error(`Invalid phone number length: ${phoneNumber}`);
  }

  return cleaned;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Allow X characters for testing, but count digits for validation
  const digitsOnly = phoneNumber.replace(/[^0-9]/g, '');

  // Check if it starts with + and has valid length
  if (phoneNumber.startsWith('+')) {
    const afterPlus = phoneNumber.substring(1);
    const digitsAfterPlus = afterPlus.replace(/[^0-9]/g, '');
    return digitsAfterPlus.length >= 10 && digitsAfterPlus.length <= 15;
  }

  // Handle various international formats
  if (phoneNumber.length >= 10 && phoneNumber.length <= 16) {
    // Accept numbers that look valid (including country codes)
    return true;
  }

  return false;
}

/**
 * Get SMS pricing estimate (optional)
 */
export function getSMSPriceEstimate(charCount: number, country: string = 'US'): number {
  // Twilio pricing varies by country and message type
  // These are approximate estimates in USD
  const prices: Record<string, number> = {
    'US': 0.0079,
    'CA': 0.0079,
    'GB': 0.0450,
    'AU': 0.0520,
    'DE': 0.0690,
    'FR': 0.0690,
    'IN': 0.0185,
    'BR': 0.0500,
    'MX': 0.0500,
  };

  const basePrice = prices[country.toUpperCase()] || prices['US'];

  // Account for message segments (160 chars per segment for standard SMS)
  const segments = Math.ceil(charCount / 160);

  return basePrice * segments;
}

export default twilioClient;
