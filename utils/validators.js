// utils/validators.js

/**
 * Validates Indian phone numbers (10-digit, optionally with +91).
 */
function validatePhone(phone) {
  if (!phone) return false;
  const cleaned = phone.toString().replace(/\s/g, "").replace(/^\+91/, "");
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Validates latitude/longitude ranges.
 */
function validateCoords(lat, lng) {
  const la = Number(lat);
  const ln = Number(lng);
  return !isNaN(la) && !isNaN(ln) && la >= -90 && la <= 90 && ln >= -180 && ln <= 180;
}

module.exports = { validatePhone, validateCoords };
