const express = require("express");
const router = express.Router();
const { getAllBuses, getBus, createBus, updateLocation } = require("../controllers/busController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

router.get("/", getAllBuses);
router.get("/:busId", getBus);
router.post("/", requireAuth, requireAdmin, createBus);
router.patch("/:busId/location", requireAuth, updateLocation);

module.exports = router;
