/**
 * distance.js
 * Haversine formula for calculating distance between two lat/lng points.
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Calculate distance in kilometers between two coordinates.
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} distance in km
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Find the N nearest stops to a given coordinate.
 * @param {Array} stops - array of stop objects with lat/lng
 * @param {number} lat
 * @param {number} lng
 * @param {number} n - max results
 * @param {number} radiusKm - max search radius
 * @returns {Array} sorted stops with distance property added
 */
function findNearestStops(stops, lat, lng, n = 3, radiusKm = 2) {
  return stops
    .map((stop) => ({
      ...stop,
      distance: haversineDistance(lat, lng, stop.lat, stop.lng),
    }))
    .filter((s) => s.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, n);
}

module.exports = { haversineDistance, findNearestStops };
