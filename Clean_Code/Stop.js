const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema({
  stopId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  routeIds: [{ type: String }], // all routes passing through this stop
  landmark: { type: String, default: "" },
  isTerminus: { type: Boolean, default: false },
});

// 2dsphere index for geospatial queries
stopSchema.index({ lat: 1, lng: 1 });

module.exports = mongoose.model("Stop", stopSchema);
