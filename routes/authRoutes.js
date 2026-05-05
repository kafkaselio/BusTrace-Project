// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { sendOTP, verifyOTPHandler, logout, getMe } = require("../controllers/authController");

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTPHandler);
router.post("/logout", logout);
router.get("/me", getMe);

module.exports = router;
