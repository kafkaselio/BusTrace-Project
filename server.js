/**
 * server.js
 *
 * FIXES APPLIED:
 *  - SESSION_SECRET: fail-fast in production if missing; warn in dev
 *  - Session cookie: added httpOnly:true, sameSite:'lax', secure: env-aware
 *  - Route sequences: fixed S11 (Rajiv Chowk) to be reachable as a source on ROUTE-A
 *  - Startup DB check: warns if stops table is empty (seed not run)
 */
/**
 * server.js
 *
 * FIXES APPLIED:
 *  - SESSION_SECRET: fail-fast in production if missing; warn in dev
 *  - Session cookie: added httpOnly:true, sameSite:'lax', secure: env-aware
 *  - Route sequences: fixed S11 (Rajiv Chowk) to be reachable as a source on ROUTE-A
 *  - Startup DB check: warns if stops table is empty (seed not run)
 *  - DEMO MODE: skips MongoDB connection entirely when DEMO_MODE=true
 *  - DEMO MODE: loads demo route sequences on startup
 */

require("dotenv").config();
const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const session = require("express-session");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const { initBusSocket } = require("./sockets/busSocket");
const { loadRouteSequences } = require("./services/routeService");
const Stop = require("./models/Stop");
const { demoRouteSequences } = require("./data/demoData");

// Route imports
const authRoutes = require("./routes/authRoutes");
const busRoutes = require("./routes/busRoutes");
const routeRoutes = require("./routes/routeRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// ─────────────────────────────────────────────
//  FIX: Fail-fast if SESSION_SECRET is missing in production
// ─────────────────────────────────────────────
if (!process.env.SESSION_SECRET) {
  if (process.env.NODE_ENV === "production") {
    console.error(
      "FATAL: SESSION_SECRET environment variable is required in production.\n" +
      "Set it in your .env file or deployment environment."
    );
    process.exit(1);
  } else {
    console.warn(
      "⚠️  SESSION_SECRET not set — using insecure dev fallback. " +
      "Set SESSION_SECRET in .env before deploying."
    );
  }
}

const DEMO_MODE = process.env.DEMO_MODE === "true";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// ─────────────────────────────────────────────
//  FIX: Skip MongoDB in DEMO_MODE
// ─────────────────────────────────────────────
if (!DEMO_MODE) {
  connectDB().then(async () => {
    try {
      const stopCount = await Stop.countDocuments();
      if (stopCount === 0) {
        console.warn(
          "\n⚠️  Database has no stops. The search feature will not work.\n" +
          "   Run: npm run seed\n"
        );
      } else {
        console.log(`📍 ${stopCount} stops loaded from DB`);
      }
    } catch (e) {
      console.warn("Could not check stop count:", e.message);
    }
  });
} else {
  console.log("🎭 DEMO MODE — skipping MongoDB connection");
}

// ─────────────────────────────────────────────
//  FIX: Load demo route sequences for route matching
// ─────────────────────────────────────────────
loadRouteSequences(demoRouteSequences);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "bus-tracker-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Serve socket.io client bundle to browser
app.get("/socket.io/socket.io.js", (_req, res) => {
  res.sendFile(require.resolve("socket.io/client-dist/socket.io.js"));
});

// Static frontend files
app.use(express.static(path.join(__dirname, "public")));

// Make io accessible in controllers
app.set("io", io);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/reviews", reviewRoutes);

// WebSocket
initBusSocket(io);

// SPA fallback
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  }
});

// Central error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🚌  BusTrace is live!`);
  console.log(`🌐  http://localhost:${PORT}`);
  console.log(`📡  WebSocket: ws://localhost:${PORT}/bus`);
  console.log(`🔧  Env: ${process.env.NODE_ENV || "development"}`);
  if (DEMO_MODE) {
    console.log(`\n🎭  DEMO MODE ON — all data is mocked, OTP is: 123456`);
    console.log(`   Set DEMO_MODE=false in .env to use real DB + SMS.\n`);
  } else {
    console.log(`\n✅  Real API mode — make sure MongoDB is running and seed is done.\n`);
  }
});