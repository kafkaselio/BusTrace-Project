/**
 * seed.js — Run with: node seed.js
 * Seeds the database with mock buses and stops, then loads route sequences.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Bus = require("./models/Bus");
const Stop = require("./models/Stop");
const buses = require("./data/buses.json");
const stops = require("./data/stops.json");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/bus-tracker");
  console.log("Connected to MongoDB");

  await Bus.deleteMany({});
  await Stop.deleteMany({});
  console.log("Cleared existing data");

  await Stop.insertMany(stops);
  console.log(`✅ Inserted ${stops.length} stops`);

  await Bus.insertMany(buses);
  console.log(`✅ Inserted ${buses.length} buses`);

  console.log("\n📍 Route Sequences (used in routeService):");
  console.log("ROUTE-A: S01 → S02 → S03 → S04 → S05");
  console.log("ROUTE-B: S01 → S05 → S06 → S07 → S08");
  console.log("ROUTE-C: S09 → S10 → S12 → S03 → S11");

  await mongoose.disconnect();
  console.log("\n🎉 Seeding complete!");
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
