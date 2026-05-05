/**
 * authController.js
 * Handles phone + OTP based authentication.
 *
 * FIXES APPLIED:
 *  - sendOTP: now checks cooldownRemaining from generateOTP() and returns 429
 *    (previously returned success:true even when no OTP was generated)
 *  - sendOTP: _devOtp now correctly sends result.otp (not the whole result object)
 *  - verifyOTPHandler: returns remainingAttempts so frontend can display count
 */

const User = require("../models/User");
const { generateOTP, verifyOTP } = require("../services/otpService");
const { validatePhone } = require("../utils/validators");

/**
 * POST /api/auth/send-otp
 * Body: { phone }
 */
async function sendOTP(req, res, next) {
  try {
    const { phone } = req.body;

    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number. Enter a 10-digit Indian mobile number (starts with 6–9).",
      });
    }

    const result = generateOTP(phone);

    // FIX: enforce rate-limit at HTTP layer — was previously ignored
    if (result.cooldownRemaining > 0) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${result.cooldownRemaining}s before requesting a new OTP.`,
        cooldownRemaining: result.cooldownRemaining,
      });
    }

    res.json({
      success: true,
      message: `OTP sent to ${phone}.`,
      // FIX: was passing the whole result object — now correctly sends result.otp
      _devOtp: process.env.NODE_ENV !== "production" ? result.otp : undefined,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/verify-otp
 * Body: { phone, otp }
 */
async function verifyOTPHandler(req, res, next) {
  try {
    const { phone, otp } = req.body;

    if (!validatePhone(phone) || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone and OTP are required.",
      });
    }

    const result = verifyOTP(phone, otp.toString().trim());

    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.message,
        code: result.code,
        remainingAttempts: result.remainingAttempts,
      });
    }

    // Find or create user
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone, isVerified: true, lastLogin: new Date() });
    } else {
      user.isVerified = true;
      user.lastLogin = new Date();
      await user.save();
    }

    // Regenerate session to prevent session fixation
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = user._id.toString();
      req.session.phone = user.phone;
      req.session.role = user.role;

      res.json({
        success: true,
        message: "Login successful.",
        user: { id: user._id, phone: user.phone, name: user.name, role: user.role },
      });
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 */
async function logout(req, res, next) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("connect.sid");
    res.json({ success: true, message: "Logged out successfully." });
  });
}

/**
 * GET /api/auth/me
 */
async function getMe(req, res, next) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: "Not authenticated." });
    }
    const user = await User.findById(req.session.userId).select("-__v");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

module.exports = { sendOTP, verifyOTPHandler, logout, getMe };