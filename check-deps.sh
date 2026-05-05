#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  BusTrace — Dependency Checker
#  Run: bash check-deps.sh
# ─────────────────────────────────────────────────────────────

GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
BOLD="\033[1m"
RESET="\033[0m"

found()   { echo -e "  ${GREEN}✅ $1${RESET}"; }
missing() { echo -e "  ${RED}❌ $1 — NOT FOUND${RESET}"; }
info()    { echo -e "  ${BLUE}ℹ  $1${RESET}"; }

echo ""
echo -e "${BOLD}🔍  BusTrace — Dependency Check${RESET}"
echo "════════════════════════════════"

ALL_OK=true

# ── Node.js ────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Node.js${RESET}"
if command -v node &>/dev/null; then
  VER=$(node -v)
  MAJOR=$(echo $VER | sed 's/v//' | cut -d. -f1)
  found "node $VER"
  if [ "$MAJOR" -lt 16 ]; then
    echo -e "  ${YELLOW}⚠  Version $VER is below minimum (v16). Please upgrade.${RESET}"
    ALL_OK=false
  fi
else
  missing "node"
  ALL_OK=false
  echo ""
  echo -e "  ${BOLD}Install Node.js:${RESET}"
  info "Ubuntu/Debian:"
  echo "    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
  echo "    sudo apt-get install -y nodejs"
  info "macOS (Homebrew):"
  echo "    brew install node"
  info "Windows:"
  echo "    Download installer: https://nodejs.org/en/download/"
fi

# ── npm ────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}npm${RESET}"
if command -v npm &>/dev/null; then
  found "npm $(npm -v)"
else
  missing "npm"
  ALL_OK=false
  info "npm is bundled with Node.js. Reinstall Node to get npm."
fi

# ── MongoDB ────────────────────────────────────────────────
echo ""
echo -e "${BOLD}MongoDB${RESET}"
MONGO_FOUND=false

if command -v mongod &>/dev/null; then
  MONGO_VER=$(mongod --version 2>/dev/null | head -1 | grep -oP '\d+\.\d+\.\d+' | head -1)
  found "mongod $MONGO_VER"
  MONGO_FOUND=true
fi

if command -v mongosh &>/dev/null; then
  found "mongosh $(mongosh --version 2>/dev/null | grep -oP '\d+\.\d+\.\d+' | head -1)"
  MONGO_FOUND=true
fi

# Check if MongoDB is accepting connections
if $MONGO_FOUND; then
  if mongosh --quiet --eval "db.runCommand({ping:1})" &>/dev/null 2>&1; then
    found "MongoDB is running and accepting connections"
  else
    echo -e "  ${YELLOW}⚠  MongoDB is installed but not running${RESET}"
    info "Ubuntu:   sudo systemctl start mongod"
    info "macOS:    brew services start mongodb-community"
    info "Windows:  net start MongoDB"
  fi
else
  missing "MongoDB"
  ALL_OK=false
  echo ""
  echo -e "  ${BOLD}Install MongoDB:${RESET}"
  info "Ubuntu/Debian:"
  echo "    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -"
  echo "    echo 'deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse' | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list"
  echo "    sudo apt-get update && sudo apt-get install -y mongodb-org"
  echo "    sudo systemctl enable --now mongod"
  info "macOS (Homebrew):"
  echo "    brew tap mongodb/brew"
  echo "    brew install mongodb-community"
  echo "    brew services start mongodb-community"
  info "Windows:"
  echo "    Download: https://www.mongodb.com/try/download/community"
  echo "    Run installer, then: net start MongoDB"
  info "Cloud (no local install needed):"
  echo "    Use MongoDB Atlas: https://www.mongodb.com/atlas"
  echo "    Update MONGO_URI in .env with your Atlas connection string"
fi

# ── nodemon (optional) ─────────────────────────────────────
echo ""
echo -e "${BOLD}nodemon (optional — for development)${RESET}"
if command -v nodemon &>/dev/null; then
  found "nodemon $(nodemon --version 2>/dev/null)"
else
  echo -e "  ${YELLOW}ℹ  nodemon not found (optional)${RESET}"
  info "Install globally: npm install -g nodemon"
  info "Or use: npm run dev (uses local nodemon)"
fi

# ── git (optional) ─────────────────────────────────────────
echo ""
echo -e "${BOLD}git (optional)${RESET}"
if command -v git &>/dev/null; then
  found "git $(git --version | cut -d' ' -f3)"
else
  echo -e "  ${YELLOW}ℹ  git not found (optional)${RESET}"
fi

# ── Summary ────────────────────────────────────────────────
echo ""
echo "════════════════════════════════"
if $ALL_OK; then
  echo -e "${GREEN}${BOLD}✅  All required dependencies found!${RESET}"
  echo ""
  echo "  Next steps:"
  echo "    bash setup.sh    ← First-time setup"
  echo "    npm start        ← Launch the app"
else
  echo -e "${RED}${BOLD}❌  Some dependencies are missing. Install them above, then retry.${RESET}"
fi
echo ""
