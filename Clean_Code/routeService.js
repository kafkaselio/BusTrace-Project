/**
 * routeService.js
 * Core route matching algorithm.
 *
 * FIXES APPLIED:
 *  - No longer throws 404 for "no routes found" or "no active buses"
 *    → Returns [] instead, letting the controller respond 200 + empty array
 *  - 503 retained for genuine infrastructure failure (no stops in DB)
 *  - 400 retained for same source/destination (invalid input)
 */

const Stop = require("../models/Stop");
const Bus = require("../models/Bus");
const { findNearestStops, haversineDistance } = require("../utils/distance");
const { calculateETA } = require("./etaService");
const { calculateFare } = require("./fareService");

let routeStopSequences = {};

function loadRouteSequences(sequences) {
  routeStopSequences = sequences;
}

async function findMatchingRoutes(srcLat, srcLng, dstLat, dstLng) {
  // Same source and destination — invalid input
  const samePointDist = haversineDistance(srcLat, srcLng, dstLat, dstLng);
  if (samePointDist < 0.05) {
    throw Object.assign(new Error("Source and destination are too close or identical."), {
      statusCode: 400,
    });
  }

  // Step 1: Get all stops from DB
  const allStops = await Stop.find({}).lean();
  if (!allStops.length) {
    // 503 = infrastructure not ready — DB was never seeded
    throw Object.assign(new Error("No stops configured in the system. Run: npm run seed"), {
      statusCode: 503,
    });
  }

  // Step 2: Nearest source stops within 2 km
  const srcStops = findNearestStops(allStops, srcLat, srcLng, 3, 2.0);
  if (!srcStops.length) return []; // Valid "no results" — not a server error

  // Step 3: Nearest destination stops within 2 km
  const dstStops = findNearestStops(allStops, dstLat, dstLng, 3, 2.0);
  if (!dstStops.length) return [];

  const srcStopIds = new Set(srcStops.map((s) => s.stopId));
  const dstStopIds = new Set(dstStops.map((s) => s.stopId));

  // Step 4: Routes covering both stops in correct direction
  const matchedRoutes = [];
  for (const [routeId, sequence] of Object.entries(routeStopSequences)) {
    const srcIdx = sequence.findIndex((sid) => srcStopIds.has(sid));
    const dstIdx = sequence.findIndex((sid) => dstStopIds.has(sid));

    if (srcIdx === -1 || dstIdx === -1) continue;
    if (srcIdx >= dstIdx) continue; // wrong direction

    const srcStop = srcStops.find((s) => s.stopId === sequence[srcIdx]);
    const dstStop = dstStops.find((s) => s.stopId === sequence[dstIdx]);

    matchedRoutes.push({
      routeId,
      srcStop,
      dstStop,
      numIntermediateStops: dstIdx - srcIdx - 1,
      routeDistance: haversineDistance(srcStop.lat, srcStop.lng, dstStop.lat, dstStop.lng),
    });
  }

  if (!matchedRoutes.length) return []; // No connecting routes — valid empty result

  // Step 5: Active buses on matched routes
  const activeBuses = await Bus.find({
    routeId: { $in: matchedRoutes.map((r) => r.routeId) },
    status: "active",
  }).lean();

  if (!activeBuses.length) return []; // Routes exist but no buses running — valid empty result

  // Step 6: Enrich and sort
  const results = activeBuses.map((bus) => {
    const routeInfo = matchedRoutes.find((r) => r.routeId === bus.routeId);
    const distanceToBus = haversineDistance(srcLat, srcLng, bus.lat, bus.lng);
    const eta = calculateETA(bus, routeInfo?.srcStop);
    const fare = calculateFare(routeInfo?.routeDistance || 0, bus.type);
    const ratio = bus.seatsAvailable / bus.capacity;
    const crowdLevel = ratio > 0.6 ? "green" : ratio >= 0.3 ? "yellow" : "red";

    return {
      busId: bus.busId,
      routeId: bus.routeId,
      registrationNumber: bus.registrationNumber,
      type: bus.type,
      seatsAvailable: bus.seatsAvailable,
      capacity: bus.capacity,
      crowdLevel,
      occupancyPercent: Math.round(((bus.capacity - bus.seatsAvailable) / bus.capacity) * 100),
      currentLocation: { lat: bus.lat, lng: bus.lng },
      speed: bus.speed,
      distanceToBus: Math.round(distanceToBus * 10) / 10,
      eta,
      fare,
      srcStop: routeInfo?.srcStop,
      dstStop: routeInfo?.dstStop,
      numIntermediateStops: routeInfo?.numIntermediateStops,
      routeDistance: Math.round((routeInfo?.routeDistance || 0) * 10) / 10,
      lastUpdated: bus.lastUpdated,
    };
  });

  results.sort((a, b) => {
    if (a.eta.minutes !== b.eta.minutes) return a.eta.minutes - b.eta.minutes;
    if (a.distanceToBus !== b.distanceToBus) return a.distanceToBus - b.distanceToBus;
    return a.numIntermediateStops - b.numIntermediateStops;
  });

  return results;
}

module.exports = { findMatchingRoutes, loadRouteSequences };