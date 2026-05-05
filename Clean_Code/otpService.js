/**
 * otpService.js
 * In-memory OTP store. Replace map with Redis in production.
 * OTP TTL: 5 minutes | Max verify attempts: 3 | Send cooldown: 30s
 *
 * CHANGES (second-pass stabilisation):
 *  - DEMO_MODE=true => fixed OTP "123456" for all numbers, logged clearly
 *  - DEMO_OTP also activates if no SMS gateway is configured
 *    (SMS_API_KEY not set in env) so dev experience is always smooth
 */

const OTP_TTL_MS    = 5 * 60 * 1000;
const MAX_ATTEMPTS  = 3;
const SEND_COOLDOWN = 30 * 1000;
const DEMO_OTP      = '123456';

const DEMO_MODE = process.env.DEMO_MODE === 'true';
// Also activate demo OTP if SMS gateway is not configured
const SMS_CONFIGURED = !!(process.env.SMS_API_KEY);

/**
 * Map<phone, { otp, expiresAt, attempts, lastSentAt }>
 */
const otpStore = new Map();

// ─── GENERATE OTP ─────────────────────────────────────────────────────────────

function generateOTP(phone) {
  const existing = otpStore.get(phone);

  if (existing) {
    const elapsed = Date.now() - existing.lastSentAt;
    if (elapsed < SEND_COOLDOWN) {
      const cooldownRemaining = Math.ceil((SEND_COOLDOWN - elapsed) / 1000);
      return { otp: null, cooldownRemaining };
    }
  }

  // Use fixed demo OTP when: DEMO_MODE=true, OR SMS not configured
  const useDemo = DEMO_MODE || !SMS_CONFIGURED;
  const otp = useDemo ? DEMO_OTP : Math.floor(100000 + Math.random() * 900000).toString();

  otpStore.set(phone, {
    otp,
    expiresAt:  Date.now() + OTP_TTL_MS,
    attempts:   0,
    lastSentAt: Date.now(),
  });

  if (useDemo) {
    console.log('\n🔐 ==========================================');
    console.log(`   DEMO OTP for ${phone}: ${DEMO_OTP}`);
    console.log('   (Fixed OTP — SMS gateway not configured)');
    console.log('==========================================\n');
  } else {
    // Production: integrate real SMS gateway here (Twilio / MSG91)
    console.log(`📱 [DEV] OTP for ${phone}: ${otp}`);
  }

  return { otp, cooldownRemaining: 0 };
}

// ─── VERIFY OTP ───────────────────────────────────────────────────────────────

function verifyOTP(phone, enteredOtp) {
  if (!phone || !enteredOtp) {
    return { success: false, message: 'Phone and OTP are required.', code: 'MISSING_INPUT' };
  }

  if (!/^\d{6}$/.test(enteredOtp)) {
    return { success: false, message: 'OTP must be exactly 6 digits.', code: 'INVALID_FORMAT' };
  }

  const record = otpStore.get(phone);

  if (!record) {
    return {
      success: false,
      message: 'No OTP found for this number. Please request a new one.',
      code: 'NOT_FOUND',
    };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return {
      success: false,
      message: 'OTP has expired (5-minute limit). Please request a new one.',
      code: 'EXPIRED',
    };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(phone);
    return {
      success: false,
      message: 'Too many failed attempts. Please request a new OTP.',
      code: 'MAX_ATTEMPTS',
    };
  }

  if (record.otp !== enteredOtp) {
    record.attempts++;
    const remainingAttempts = MAX_ATTEMPTS - record.attempts;

    if (remainingAttempts === 0) {
      otpStore.delete(phone);
      return {
        success: false,
        message: 'Incorrect OTP. No attempts remaining — please request a new one.',
        code: 'MAX_ATTEMPTS',
        remainingAttempts: 0,
      };
    }

    return {
      success: false,
      message: `Incorrect OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`,
      code: 'WRONG_OTP',
      remainingAttempts,
    };
  }

  otpStore.delete(phone);
  return { success: true, message: 'OTP verified successfully.' };
}

// ─── HOUSEKEEPING ─────────────────────────────────────────────────────────────

function purgeExpiredOTPs() {
  const now = Date.now();
  for (const [phone, record] of otpStore.entries()) {
    if (now > record.expiresAt) otpStore.delete(phone);
  }
}

setInterval(purgeExpiredOTPs, 10 * 60 * 1000);

module.exports = { generateOTP, verifyOTP };
