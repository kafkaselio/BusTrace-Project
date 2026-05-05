#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  BusTrace — Setup Script
#  Run once before first launch: bash setup.sh
# ─────────────────────────────────────────────────────────────

set -e  # Exit immediately on any error

BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
RESET="\033[0m"

log()    { echo -e "${GREEN}✅ $1${RESET}"; }
warn()   { echo -e "${YELLOW}⚠️  $1${RESET}"; }
error()  { echo -e "${RED}❌ $1${RESET}"; exit 1; }
header() { echo -e "\n${BOLD}$1${RESET}"; }

echo ""
echo "🚌  BusTrace — Project Setup"
echo "════════════════════════════════"

# ── 1. Check Node ──────────────────────────────────────────
header "Checking Node.js..."
if ! command -v node &>/dev/null; then
  error "Node.js not found. Run: bash check-deps.sh for install instructions."
fi
NODE_VER=$(node -e "process.stdout.write(process.version)")
log "Node.js found: $NODE_VER"

# ── 2. Check npm ───────────────────────────────────────────
if ! command -v npm &>/dev/null; then
  error "npm not found. Install Node.js from https://nodejs.org"
fi
log "npm found: $(npm -v)"

# ── 3. Check MongoDB ───────────────────────────────────────
header "Checking MongoDB..."
if command -v mongod &>/dev/null; then
  log "MongoDB found: $(mongod --version | head -1)"
elif command -v mongosh &>/dev/null; then
  log "MongoDB shell found (mongod may be a service)"
else
  warn "MongoDB not detected locally. Make sure it's running or update MONGO_URI in .env"
  warn "Install guide: https://www.mongodb.com/docs/manual/installation/"
fi

# ── 4. Install dependencies ────────────────────────────────
header "Installing npm dependencies..."
npm install
log "Dependencies installed"

# ── 5. Create .env ─────────────────────────────────────────
header "Setting up environment..."
if [ -f ".env" ]; then
  warn ".env already exists — skipping copy"
else
  cp .env.example .env
  log ".env created from .env.example"
  echo ""
  warn "ACTION REQUIRED: Open .env and set your MONGO_URI and SESSION_SECRET"
fi

# ── 6. Seed database ───────────────────────────────────────
header "Seeding database with demo data..."
echo "   This inserts sample buses and stops into MongoDB."
echo ""
read -p "   Seed the database now? (y/N): " SEED_CONFIRM
if [[ "$SEED_CONFIRM" =~ ^[Yy]$ ]]; then
  node seed.js
  log "Database seeded successfully"
else
  warn "Skipped seeding. Run 'node seed.js' manually before starting."
fi

# ── Done ───────────────────────────────────────────────────
echo ""
echo "════════════════════════════════"
echo -e "${GREEN}${BOLD}🎉 Setup complete!${RESET}"
echo ""
echo "  Start the app:    npm start"
echo "  Development mode: npm run dev   (requires nodemon)"
echo "  Open browser:     http://localhost:3000"
echo ""
