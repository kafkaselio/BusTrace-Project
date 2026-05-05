// routes/routeRoutes.js
const express = require("express");
const router = express.Router();
const { searchRoutes, getAllStops } = require("../controllers/routeController");

router.get("/search", searchRoutes);
router.get("/stops", getAllStops);

module.exports = router;
