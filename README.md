# 🚌 BusTrace — Real-Time Bus Tracking Web Application

<p align="center">
  <b>A modern real-time transit tracking platform built using Node.js, Express, MongoDB, Socket.IO, Tailwind CSS, and Mapbox.</b>
</p>

<p align="center">
  Live Bus Tracking • Real-Time ETAs • OTP Login • Passenger Reviews • WebSockets • Map Visualization
</p>

---

# 📌 Overview

BusTrace is a full-stack web application designed to simulate and manage a modern public transit tracking system.

The platform allows users to:

- Search buses between two stops
- Track buses in real time on a live map
- View live ETA calculations
- Monitor seat availability and crowd density
- Authenticate using OTP login
- Leave ratings and reviews for buses
- Receive real-time updates using WebSockets

The project combines:

- Real-time systems
- WebSocket communication
- Geolocation logic
- Route matching algorithms
- Interactive UI design
- Session-based authentication
- Map visualization

into a single cohesive transit platform.

---

# ✨ Core Features

## 🚍 Real-Time Bus Tracking
- Live bus coordinates updated using Socket.IO
- Dynamic movement broadcasting
- Real-time passenger-side updates
- Simulated driver GPS updates

---

## 📍 Interactive Map System
- Integrated Mapbox GL JS
- Dark-themed custom map styling
- Live bus markers
- Stop markers
- Popup information panels
- Zoom + navigation controls

---

## ⏱ Live ETA Prediction
- ETA calculated dynamically using:
  - Haversine distance
  - Current bus coordinates
  - Route stop sequence
  - Simulated speed

---

## 👥 Crowd Detection
Passenger density indicators:

| Indicator | Meaning |
|---|---|
| 🟢 Green | Comfortable |
| 🟡 Yellow | Moderate Crowd |
| 🔴 Red | Heavily Crowded |

Crowd level automatically changes based on available seats.

---

## 📱 OTP Authentication
- Phone-number-based login
- 6-digit OTP verification
- Session authentication
- No password required
- Demo mode support

---

## ⭐ Passenger Reviews
Users can:
- Rate buses
- Add comments
- Add tags like:
  - Clean
  - Safe
  - Comfortable
  - Crowded
  - Punctual

---

## ⚡ Real-Time WebSocket System
Using Socket.IO namespaces:

- Passenger clients receive updates
- Driver events broadcast new locations
- UI updates without page refresh

---

## 🌙 Modern UI Design
- Fully dark-themed aesthetic
- Tailwind CSS styling
- Glassmorphism effects
- Neon accents
- Responsive layout
- Animated transitions

---

# 🛠 Tech Stack

# Backend

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | REST API Server |
| MongoDB | Database |
| Mongoose | ODM |
| Socket.IO | Real-time communication |
| express-session | Session authentication |

---

# Frontend

| Technology | Purpose |
|---|---|
| HTML5 | Structure |
| Tailwind CSS | Styling |
| Vanilla JavaScript | Client-side logic |
| Socket.IO Client | Real-time updates |
| Mapbox GL JS | Maps & geolocation |

---

# Algorithms & Logic

| Logic System | Purpose |
|---|---|
| Haversine Formula | Coordinate distance calculation |
| Route Sequence Matching | Correct direction detection |
| ETA Prediction | Arrival estimation |
| Fare Calculation | Dynamic pricing |
| Crowd Classification | Seat-based occupancy analysis |

---

# 📂 Complete Folder Structure

```text
bus-tracker/
│
├── server.js
│   └── Main application entry point
│
├── seed.js
│   └── Seeds MongoDB with demo buses and stops
│
├── package.json
│   └── Dependencies and npm scripts
│
├── package-lock.json
│
├── .env.example
│   └── Environment variable template
│
├── .env
│   └── Local environment configuration
│
├── README.md
│
├── config/
│   │
│   └── db.js
│       └── MongoDB connection logic
│
├── models/
│   │
│   ├── Bus.js
│   │   └── Bus schema and metadata
│   │
│   ├── Stop.js
│   │   └── Stop schema and route mapping
│   │
│   ├── User.js
│   │   └── User authentication schema
│   │
│   └── Review.js
│       └── Passenger review schema
│
├── controllers/
│   │
│   ├── authController.js
│   │   └── OTP send/verify logic
│   │
│   ├── busController.js
│   │   └── Bus CRUD + live updates
│   │
│   ├── routeController.js
│   │   └── Route searching logic
│   │
│   └── reviewController.js
│       └── Review create/fetch system
│
├── routes/
│   │
│   ├── authRoutes.js
│   │   └── Authentication endpoints
│   │
│   ├── busRoutes.js
│   │   └── Bus-related endpoints
│   │
│   ├── routeRoutes.js
│   │   └── Route endpoints
│   │
│   └── reviewRoutes.js
│       └── Review endpoints
│
├── services/
│   │
│   ├── otpService.js
│   │   └── OTP generation + storage
│   │
│   ├── routeService.js
│   │   └── Route matching engine
│   │
│   ├── etaService.js
│   │   └── ETA calculations
│   │
│   └── fareService.js
│       └── Dynamic fare pricing
│
├── middleware/
│   │
│   ├── authMiddleware.js
│   │   └── Session protection middleware
│   │
│   └── errorHandler.js
│       └── Global error handler
│
├── sockets/
│   │
│   └── busSocket.js
│       └── Real-time Socket.IO events
│
├── utils/
│   │
│   ├── distance.js
│   │   └── Haversine distance utility
│   │
│   └── validators.js
│       └── Validation helper functions
│
├── data/
│   │
│   ├── buses.json
│   │   └── Demo bus dataset
│   │
│   └── stops.json
│       └── Demo stop dataset
│
└── public/
    │
    ├── index.html
    │   └── Main frontend UI
    │
    └── app.js
        └── Frontend application logic
