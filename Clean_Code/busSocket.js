/**
 * busSocket.js
 * Real-time bus location broadcasting via Socket.IO.
 *
 * FIXES APPLIED:
 *  - Merged two separate busNS.on("connection", ...) handlers into one
 *    (previously both fired on every connection, could cause double snapshot emit)
 *
 * Events emitted to clients:
 *   bus:snapshot → Array of all active buses (sent once on connect)
 *   bus:update   → { busId, lat, lng, speed, seatsAvailable, crowdLevel, lastUpdated }
 *   bus:offline  → { busId }
 *
 * Events received from drivers:
 *   driver:location → { busId, lat, lng, speed, seatsAvailable }
 *   driver:offline  → { busId }
 */

const Bus = require("../models/Bus");

function initBusSocket(io) {
  const busNS = io.of("/bus");

  // FIX: single merged connection handler (was two separate handlers)
  busNS.on("connection", async (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Send full snapshot to the newly connected client
    try {
      const activeBuses = await Bus.find({ status: "active" }).lean();
      socket.emit("bus:snapshot", activeBuses);
    } catch (err) {
      console.error("Snapshot error:", err.message);
    }

    // ── Driver sends a location update ──────────────────────────
    socket.on("driver:location", async (data) => {
      const { busId, lat, lng, speed, seatsAvailable } = data;

      if (!busId || lat === undefined || lng === undefined) {
        socket.emit("error", { message: "Invalid location data. busId, lat, lng are required." });
        return;
      }

      // Basic range check
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        socket.emit("error", { message: "Coordinates out of valid range." });
        return;
      }

      try {
        const bus = await Bus.findOneAndUpdate(
          { busId },
          { lat, lng, speed: speed || 0, seatsAvailable, lastUpdated: new Date() },
          { new: true }
        );

        if (!bus) {
          socket.emit("error", { message: `Bus ${busId} not found.` });
          return;
        }

        const ratio = bus.seatsAvailable / bus.capacity;
        const crowdLevel = ratio > 0.6 ? "green" : ratio >= 0.3 ? "yellow" : "red";

        busNS.emit("bus:update", {
          busId: bus.busId,
          routeId: bus.routeId,
          lat: bus.lat,
          lng: bus.lng,
          speed: bus.speed,
          seatsAvailable: bus.seatsAvailable,
          capacity: bus.capacity,
          crowdLevel,
          lastUpdated: bus.lastUpdated,
        });
      } catch (err) {
        console.error("Socket location update error:", err.message);
      }
    });

    // ── Driver goes offline ───────────────────────────────────────
    socket.on("driver:offline", async ({ busId }) => {
      if (busId) {
        await Bus.findOneAndUpdate({ busId }, { status: "inactive" }).catch((e) =>
          console.error("Offline update error:", e.message)
        );
        busNS.emit("bus:offline", { busId });
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  console.log("🔌 Bus WebSocket initialized at /bus");
}

module.exports = { initBusSocket };