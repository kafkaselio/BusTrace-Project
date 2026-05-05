/**
 * fareService.js
 * Dynamic fare calculation.
 *
 * Formula: fare = baseFare + (distance × perKmRate) × peakMultiplier × typeMultiplier
 */

const BASE_FARE = 10; // INR base fare
const PER_KM_RATE = 2.5; // INR per km

const BUS_TYPE_MULTIPLIER = {
  AC: 1.5,
  "Non-AC": 1.0,
};

// Peak hours: 8–10 AM and 5–8 PM
const PEAK_WINDOWS = [
  { start: 8, end: 10 },
  { start: 17, end: 20 },
];

/**
 * Check if the current hour falls within peak windows.
 * @returns {boolean}
 */
function isPeakHour() {
  const currentHour = new Date().getHours();
  return PEAK_WINDOWS.some((w) => currentHour >= w.start && currentHour < w.end);
}

/**
 * Calculate fare for a given distance and bus type.
 * @param {number} distanceKm
 * @param {string} busType - "AC" | "Non-AC"
 * @returns {{ amount: number, currency: string, breakdown: Object }}
 */
function calculateFare(distanceKm, busType = "Non-AC") {
  const peakMultiplier = isPeakHour() ? 1.25 : 1.0;
  const typeMultiplier = BUS_TYPE_MULTIPLIER[busType] ?? 1.0;

  const rawFare = BASE_FARE + distanceKm * PER_KM_RATE;
  const amount = Math.ceil(rawFare * peakMultiplier * typeMultiplier);

  return {
    amount,
    currency: "INR",
    breakdown: {
      baseFare: BASE_FARE,
      distanceFare: Math.round(distanceKm * PER_KM_RATE * 100) / 100,
      peakMultiplier,
      typeMultiplier,
      distanceKm: Math.round(distanceKm * 10) / 10,
    },
    isPeak: isPeakHour(),
  };
}

module.exports = { calculateFare, isPeakHour };
