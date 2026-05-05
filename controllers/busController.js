/**
 * busController.js
 *
 * FIXES (first pass - already applied):
 *  - updateLocation: validates lat/lng and seatsAvailable before writing
 *
 * CHANGES (second-pass stabilisation):
 *  - getAllBuses: falls back to demoBuses when DB is empty or unavailable
 *  - Respects DEMO_MODE=true
 */

const Bus = require('../models/Bus');
const { validateCoords } = require('../utils/validators');
const { demoBuses } = require('../data/demoData');

const DEMO_MODE = process.env.DEMO_MODE === 'true';

// GET /api/buses
async function getAllBuses(req, res, next) {
  try {
    if (DEMO_MODE) {
      const filtered = req.query.routeId
        ? demoBuses.filter(b => b.routeId === req.query.routeId)
        : demoBuses;
      return res.json({ success: true, count: filtered.length, data: filtered, _demo: true });
    }

    try {
      const filter = { status: 'active' };
      if (req.query.routeId) filter.routeId = req.query.routeId;
      const buses = await Bus.find(filter).lean();
      if (!buses.length) {
        // Fallback if DB empty (not seeded)
        const filtered = req.query.routeId
          ? demoBuses.filter(b => b.routeId === req.query.routeId)
          : demoBuses;
        console.warn('[DEMO] No buses in DB - using demo fallback');
        return res.json({ success: true, count: filtered.length, data: filtered, _demo: true });
      }
      return res.json({ success: true, count: buses.length, data: buses });
    } catch (dbErr) {
      console.warn('[DEMO] Bus DB query failed, using demo fallback:', dbErr.message);
      return res.json({ success: true, count: demoBuses.length, data: demoBuses, _demo: true });
    }
  } catch (err) {
    next(err);
  }
}

// GET /api/buses/:busId
async function getBus(req, res, next) {
  try {
    if (DEMO_MODE) {
      const bus = demoBuses.find(b => b.busId === req.params.busId);
      if (!bus) return res.status(404).json({ success: false, message: 'Bus not found.' });
      return res.json({ success: true, data: bus, _demo: true });
    }
    const bus = await Bus.findOne({ busId: req.params.busId }).lean();
    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found.' });
    }
    res.json({ success: true, data: bus });
  } catch (err) {
    next(err);
  }
}

// POST /api/buses — admin only
async function createBus(req, res, next) {
  try {
    const bus = await Bus.create(req.body);
    res.status(201).json({ success: true, data: bus });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/buses/:busId/location
async function updateLocation(req, res, next) {
  try {
    const { lat, lng, speed, seatsAvailable } = req.body;

    if (!validateCoords(lat, lng)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates. lat must be -90..90 and lng must be -180..180.',
      });
    }

    if (
      seatsAvailable !== undefined &&
      (isNaN(Number(seatsAvailable)) || Number(seatsAvailable) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: 'seatsAvailable must be a non-negative number.',
      });
    }

    const speedVal = Number(speed);
    if (speed !== undefined && (isNaN(speedVal) || speedVal < 0)) {
      return res.status(400).json({
        success: false,
        message: 'speed must be a non-negative number.',
      });
    }

    const bus = await Bus.findOneAndUpdate(
      { busId: req.params.busId },
      {
        lat: Number(lat),
        lng: Number(lng),
        speed: speedVal || 0,
        seatsAvailable: Number(seatsAvailable),
        lastUpdated: new Date(),
      },
      { new: true }
    );

    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found.' });
    }

    const io = req.app.get('io');
    if (io) {
      const ratio = bus.seatsAvailable / bus.capacity;
      io.of('/bus').emit('bus:update', {
        busId: bus.busId,
        routeId: bus.routeId,
        lat: bus.lat,
        lng: bus.lng,
        speed: bus.speed,
        seatsAvailable: bus.seatsAvailable,
        capacity: bus.capacity,
        crowdLevel: ratio > 0.6 ? 'green' : ratio >= 0.3 ? 'yellow' : 'red',
        lastUpdated: bus.lastUpdated,
      });
    }

    res.json({ success: true, data: bus });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllBuses, getBus, createBus, updateLocation };
