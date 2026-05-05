const mongoose = require("mongoose");

const busSchema = new mongoose.Schema(
  {
    busId: { type: String, required: true, unique: true },
    routeId: { type: String, required: true },
    driverId: { type: String, default: null },
    registrationNumber: { type: String, required: true },
    type: { type: String, enum: ["AC", "Non-AC"], default: "Non-AC" },
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
    speed: { type: Number, default: 0 }, // km/h
    seatsAvailable: { type: Number, required: true },
    capacity: { type: Number, required: true },
    status: { type: String, enum: ["active", "inactive", "maintenance"], default: "active" },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Virtual: crowd level
busSchema.virtual("crowdLevel").get(function () {
  const ratio = this.seatsAvailable / this.capacity;
  if (ratio > 0.6) return "green";
  if (ratio >= 0.3) return "yellow";
  return "red";
});

// Virtual: occupancy %
busSchema.virtual("occupancyPercent").get(function () {
  return Math.round(((this.capacity - this.seatsAvailable) / this.capacity) * 100);
});

busSchema.set("toJSON", { virtuals: true });
busSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Bus", busSchema);
