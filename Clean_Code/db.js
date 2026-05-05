/**
 * config/db.js
 *
 * FIXES APPLIED:
 *  - Removed useNewUrlParser and useUnifiedTopology (deprecated since driver v4,
 *    caused console warnings on every startup)
 */

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/bus-tracker"
      // FIX: no options object needed — deprecated options removed
    );
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;