════════════════════════════════════════════════════════════════
  🚌  BusTrace — Real-Time Bus Tracking Web Application
════════════════════════════════════════════════════════════════

OVERVIEW
────────
BusTrace is a full-stack web application that tracks city buses
in real time. Users can search for buses between two stops, see
live ETAs, seat availability, and fare estimates — all from a
dark-themed web UI.

Built with: Node.js · Express · MongoDB · Socket.IO · Tailwind CSS

────────────────────────────────────────────────────────────────
  FOLDER STRUCTURE
────────────────────────────────────────────────────────────────

bus-tracker/
│
├── server.js              ← App entry point. Starts Express + Socket.IO
├── seed.js                ← Populates MongoDB with demo buses and stops
├── package.json           ← npm dependencies and scripts
├── .env.example           ← Environment variable template
├── .env                   ← Your local config (created by setup.sh)
│
├── /config
│   └── db.js              ← MongoDB connection logic
│
├── /models
│   ├── Bus.js             ← Bus schema (busId, route, seats, location...)
│   ├── Stop.js            ← Bus stop schema (name, lat, lng, routes...)
│   ├── User.js            ← User schema (phone, role, verified...)
│   └── Review.js          ← Review schema (rating, comment, tags...)
│
├── /controllers
│   ├── authController.js  ← OTP send/verify, session management
│   ├── busController.js   ← CRUD for buses, location updates
│   ├── routeController.js ← Route search endpoint
│   └── reviewController.js← Review create/list
│
├── /routes
│   ├── authRoutes.js      ← /api/auth/*
│   ├── busRoutes.js       ← /api/buses/*
│   ├── routeRoutes.js     ← /api/routes/*
│   └── reviewRoutes.js    ← /api/reviews/*
│
├── /services
│   ├── otpService.js      ← OTP generation and in-memory storage
│   ├── routeService.js    ← Core route matching algorithm
│   ├── etaService.js      ← ETA calculation using Haversine formula
│   └── fareService.js     ← Dynamic fare with peak-hour pricing
│
├── /sockets
│   └── busSocket.js       ← Socket.IO: live bus location broadcasting
│
├── /middleware
│   ├── authMiddleware.js  ← Session-based auth guards
│   └── errorHandler.js    ← Central error handling
│
├── /utils
│   ├── distance.js        ← Haversine distance calculation
│   └── validators.js      ← Phone and coordinate validators
│
├── /data
│   ├── buses.json         ← Demo bus data (5 buses, 3 routes)
│   └── stops.json         ← Demo stop data (12 stops, Delhi/NCR)
│
└── /public
    ├── index.html         ← Main UI (Tailwind dark theme)
    └── app.js             ← Frontend JS (search, auth, live updates)

────────────────────────────────────────────────────────────────
  QUICK START (First Time)
────────────────────────────────────────────────────────────────

STEP 1 — Check requirements
   bash check-deps.sh
   (Checks Node.js, npm, MongoDB — shows install instructions if missing)

STEP 2 — Run setup (installs everything automatically)
   bash setup.sh
   (Installs npm packages, creates .env, seeds the database)

STEP 3 — Start the app
   npm start

STEP 4 — Open in browser
   http://localhost:3000

That's it! 🎉

────────────────────────────────────────────────────────────────
  MANUAL SETUP (if you prefer step-by-step)
────────────────────────────────────────────────────────────────

1. Install dependencies:
   npm install

2. Create your .env file:
   cp .env.example .env
   Then open .env and set:
     MONGO_URI=mongodb://localhost:27017/bus-tracker
     SESSION_SECRET=any-random-string-here
     PORT=3000
     NODE_ENV=development

3. Make sure MongoDB is running:
   Ubuntu:   sudo systemctl start mongod
   macOS:    brew services start mongodb-community
   Windows:  net start MongoDB

4. Seed the database:
   node seed.js
   (Creates sample buses and stops in MongoDB)

5. Start the server:
   npm start
   OR for auto-reload during development:
   npm run dev

6. Open: http://localhost:3000

────────────────────────────────────────────────────────────────
  HOW OTP LOGIN WORKS
────────────────────────────────────────────────────────────────

BusTrace uses phone number + OTP (one-time password) login.
No usernames or passwords needed.

THE FLOW:
  1. User enters their 10-digit Indian mobile number
  2. Server generates a 6-digit OTP (valid 5 minutes)
  3. In production: OTP is sent via SMS gateway (MSG91/Twilio)
  4. In development: OTP is printed in the server console AND
     shown in the browser as a toast notification
  5. User enters the OTP
  6. Server verifies and creates a session (valid 24 hours)

DEMO LOGIN:
  - Enter any valid 10-digit number (e.g., 9876543210)
  - Check the server terminal for the OTP
  - Enter the OTP in the browser
  - You're logged in!

────────────────────────────────────────────────────────────────
  HOW ROUTE SEARCH WORKS
────────────────────────────────────────────────────────────────

1. Select a source stop (e.g., "Connaught Place")
2. Select a destination stop (e.g., "AIIMS")
3. Click SEARCH BUSES

The algorithm:
  → Finds stops near source coordinates
  → Finds stops near destination coordinates
  → Matches routes passing through BOTH stops
  → Verifies source stop comes BEFORE destination (correct direction)
  → Fetches active buses on matched routes
  → Sorts by ETA, then distance, then number of stops

DEMO ROUTES (from seed data):
  ROUTE-A: Connaught Place → Mandi House → ITO → Pragati Maidan → Supreme Court
  ROUTE-B: Connaught Place → Supreme Court → India Gate → Khan Market → AIIMS
  ROUTE-C: Kashmere Gate → Civil Lines → Old Delhi Rly Stn → ITO → Rajiv Chowk

Try searching: Connaught Place → AIIMS
(Goes via ROUTE-B, through Supreme Court → India Gate → Khan Market)

────────────────────────────────────────────────────────────────
  LIVE BUS UPDATES
────────────────────────────────────────────────────────────────

BusTrace uses Socket.IO for real-time communication.

Passengers (browser):
  - Connect to the /bus namespace automatically on page load
  - Receive live location and seat updates pushed from server
  - Crowd indicator updates in real time (green/yellow/red)

Drivers (API):
  - Emit "driver:location" event with { busId, lat, lng, speed, seatsAvailable }
  - Server saves to DB and broadcasts to all passengers

Test the WebSocket manually:
  const socket = io('http://localhost:3000/bus');
  socket.emit('driver:location', {
    busId: 'BUS-001',
    lat: 28.6352,
    lng: 77.2245,
    speed: 35,
    seatsAvailable: 12
  });

────────────────────────────────────────────────────────────────
  FARE CALCULATION
────────────────────────────────────────────────────────────────

Formula:
  fare = (baseFare + distance × perKmRate) × peakMultiplier × typeMultiplier

Settings:
  Base fare:      ₹10
  Per km rate:    ₹2.50
  AC multiplier:  ×1.5
  Peak hours:     8–10 AM, 5–8 PM (×1.25)

Example: 5 km trip, AC bus, peak hour
  = (10 + 5×2.5) × 1.25 × 1.5
  = 22.5 × 1.875
  = ₹43

────────────────────────────────────────────────────────────────
  API ENDPOINTS SUMMARY
────────────────────────────────────────────────────────────────

AUTH
  POST  /api/auth/send-otp       Body: { phone }
  POST  /api/auth/verify-otp     Body: { phone, otp }
  POST  /api/auth/logout
  GET   /api/auth/me             Returns current session user

BUSES
  GET   /api/buses               List all active buses
  GET   /api/buses/:busId        Get single bus details
  POST  /api/buses               Create bus (admin only)
  PATCH /api/buses/:busId/location  Update position (driver)

ROUTES
  GET   /api/routes/search       ?srcLat=&srcLng=&dstLat=&dstLng=
  GET   /api/routes/stops        List all stops

REVIEWS
  GET   /api/reviews             ?busId= or ?routeId=
  POST  /api/reviews             Body: { busId, rating, comment, tags }
                                 (requires login)

────────────────────────────────────────────────────────────────
  CROWD INDICATOR
────────────────────────────────────────────────────────────────

  🟢 Green  → More than 60% seats available (comfortable)
  🟡 Yellow → 30–60% seats available (moderate)
  🔴 Red    → Less than 30% seats available (crowded)

────────────────────────────────────────────────────────────────
  PACKAGING (ZIP)
────────────────────────────────────────────────────────────────

To create a shareable ZIP of this project:
  bash create-zip.sh
  → Creates: bus-tracker.zip (excludes node_modules and .env)

OR manually:
  zip -r bus-tracker.zip . --exclude "node_modules/*" --exclude ".env"

────────────────────────────────────────────────────────────────
  COMMON ISSUES
────────────────────────────────────────────────────────────────

❌  "Cannot connect to MongoDB"
    → Make sure MongoDB is running (see Step 3 above)
    → Check MONGO_URI in your .env file

❌  "Port 3000 already in use"
    → Change PORT=3001 in .env, then restart

❌  "No buses found"
    → Run: node seed.js to insert demo data
    → Make sure you're searching between valid stop pairs

❌  OTP not showing in browser
    → Check the terminal where npm start is running
    → OTP is logged there in development mode

❌  Live updates not working
    → Make sure the browser loaded /socket.io/socket.io.js
    → Check browser console for socket connection errors

────────────────────────────────────────────────────────────────
  TECH STACK
────────────────────────────────────────────────────────────────

Backend:
  • Node.js + Express.js    — HTTP server and API
  • MongoDB + Mongoose       — Database and ODM
  • Socket.IO                — Real-time WebSocket communication
  • express-session          — Session-based authentication

Frontend:
  • Tailwind CSS (CDN)       — Utility-first styling
  • Vanilla JavaScript       — No framework, fast load
  • Socket.IO client         — Real-time UI updates

Algorithm:
  • Haversine formula        — Accurate distance between coordinates
  • Route sequence matching  — Direction-aware stop pair matching

════════════════════════════════════════════════════════════════
  Thank you for using BusTrace! 🚌
════════════════════════════════════════════════════════════════
