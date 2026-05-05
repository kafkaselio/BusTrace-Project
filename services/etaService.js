/**
 * etaService.js
 * Calculates estimated time of arrival for a bus to reach a stop.
 */

const { haversineDistance } = require("../utils/distance");

const AVG_SPEED_FALLBACK_KMH = 20; // used if bus speed is 0 or unreliable
const TRAFFIC_BUFFER_PERCENT = 0.2; // 20% buffer for traffic

/**
 * Calculate ETA from bus current position to a target stop.
 * @param {Object} bus - bus object with lat, lng, speed
 * @param {Object} targetStop - stop object with lat, lng
 * @returns {{ minutes: number, label: string }}
 */
function calculateETA(bus, targetStop) {
  if (!targetStop) return { minutes: 999, label: "Unknown" };

  const distanceKm = haversineDistance(bus.lat, bus.lng, targetStop.lat, targetStop.lng);
  const speedKmh = bus.speed > 5 ? bus.speed : AVG_SPEED_FALLBACK_KMH;

  // Time in hours × (1 + buffer)
  const timeHours = (distanceKm / speedKmh) * (1 + TRAFFIC_BUFFER_PERCENT);
  const minutes = Math.ceil(timeHours * 60);

  let label;
  if (minutes <= 1) label = "Arriving now";
  else if (minutes < 60) label = `${minutes} min`;
  else {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    label = `${hrs}h ${mins}m`;
  }

  return { minutes, label, distanceKm: Math.round(distanceKm * 10) / 10 };
}

module.exports = { calculateETA };
