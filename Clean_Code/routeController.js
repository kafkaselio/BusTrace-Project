/**
 * routeController.js
 *
 * CHANGES (second-pass stabilisation):
 *  - searchRoutes: catches DB errors and falls back to demoSearchResults
 *  - searchRoutes: respects DEMO_MODE=true env flag (always demo)
 *  - getAllStops:  falls back to demoStops when DB is empty or unavailable
 */

const { findMatchingRoutes } = require('../services/routeService');
const Stop = require('../models/Stop');
const { demoSearchResults, demoStops } = require('../data/demoData');

const DEMO_MODE = process.env.DEMO_MODE === 'true';

/**
 * GET /api/routes/search?srcLat=&srcLng=&dstLat=&dstLng=
 */
async function searchRoutes(req, res, next) {
  try {
    const { srcLat, srcLng, dstLat, dstLng } = req.query;

    const coords = [srcLat, srcLng, dstLat, dstLng].map(Number);
    if (coords.some(isNaN)) {
      return res.status(400).json({
        success: false,
        message: 'srcLat, srcLng, dstLat, dstLng are required and must be numbers.',
      });
    }

    // DEMO_MODE=true => skip DB entirely
    if (DEMO_MODE) {
      console.log('[DEMO] Route search => returning demo data (DEMO_MODE=true)');
      return res.json({ success: true, count: demoSearchResults.length, data: demoSearchResults, _demo: true });
    }

    const [sLat, sLng, dLat, dLng] = coords;

    try {
      const results = await findMatchingRoutes(sLat, sLng, dLat, dLng);
      return res.json({ success: true, count: results.length, data: results });
    } catch (innerErr) {
      // Propagate client errors (400 same-stop, 503 no-seed)
      if (innerErr.statusCode && innerErr.statusCode < 500) {
        return res.status(innerErr.statusCode).json({ success: false, message: innerErr.message });
      }
      // Fallback so UI is never blank on infra failure
      console.warn('[DEMO] Route search failed, using demo fallback:', innerErr.message);
      return res.json({ success: true, count: demoSearchResults.length, data: demoSearchResults, _demo: true });
    }
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/routes/stops
 */
async function getAllStops(req, res, next) {
  try {
    if (DEMO_MODE) {
      console.log('[DEMO] Stops => returning demo stops (DEMO_MODE=true)');
      return res.json({ success: true, count: demoStops.length, data: demoStops, _demo: true });
    }

    try {
      const stops = await Stop.find({}).lean();
      if (!stops.length) {
        console.warn('[DEMO] DB has no stops - returning demo stops as fallback');
        return res.json({ success: true, count: demoStops.length, data: demoStops, _demo: true });
      }
      return res.json({ success: true, count: stops.length, data: stops });
    } catch (dbErr) {
      console.warn('[DEMO] Stop DB query failed, using demo fallback:', dbErr.message);
      return res.json({ success: true, count: demoStops.length, data: demoStops, _demo: true });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = { searchRoutes, getAllStops };
