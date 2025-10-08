#!/usr/bin/env bash
set -euo pipefail

# start.sh - helper to prepare environment and run the project on a new machine
# Usage:
#   ./start.sh                        # prompts for missing values and runs dev
#   ./start.sh --mongo-uri <URI>      # provide MongoDB URI non-interactively
#   ./start.sh --no-install           # skip npm install
#   ./start.sh --port <PORT>          # set PORT env for Next (optional)

show_help(){
  cat <<EOS
Usage: $0 [--mongo-uri <MONGODB_URI>] [--port <PORT>] [--no-install]

This script will:
  - create or update .env.local with MONGODB_URI
  - optionally run npm install
  - run a quick DB connectivity check (scripts/check-db.js)
  - start the dev server (npm run dev)

Notes:
  - If you already have MONGODB_URI set in your environment, the script will use it.
  - Recommended to run this in WSL or Git Bash on Windows.
EOS
}

MONGO_URI=""
PORT="${PORT:-9002}"
NO_INSTALL=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mongo-uri)
      MONGO_URI="$2"
      shift 2
      ;;
    --port)
      PORT="$2"
      shift 2
      ;;
    --no-install)
      NO_INSTALL=1
      shift
      ;;
    --help|-h)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

# Prefer runtime env first
if [[ -z "$MONGO_URI" && -n "${MONGODB_URI:-}" ]]; then
  MONGO_URI="$MONGODB_URI"
fi

if [[ -z "$MONGO_URI" ]]; then
  read -r -p "No MongoDB URI provided. Use default mongodb://localhost:27017/ai-hairstyle-pa? [Y/n] " yn
  yn=${yn:-Y}
  if [[ "$yn" =~ ^[Yy] ]]; then
    MONGO_URI="mongodb://localhost:27017/ai-hairstyle-pa"
  else
    echo "Please re-run with --mongo-uri or set MONGODB_URI env var"
    exit 1
  fi
fi

# create .env.local (backup if exists)
ENV_FILE=".env.local"
if [[ -f "$ENV_FILE" ]]; then
  echo "Backing up existing $ENV_FILE -> ${ENV_FILE}.bak"
  cp "$ENV_FILE" "${ENV_FILE}.bak"
fi

cat > "$ENV_FILE" <<EOF
MONGODB_URI=$MONGO_URI
EOF

echo "Wrote $ENV_FILE"

# Install deps unless requested otherwise
if [[ $NO_INSTALL -eq 0 ]]; then
  if command -v npm >/dev/null 2>&1; then
    echo "Installing npm dependencies..."
    npm install
  else
    echo "npm not found in PATH. Please install Node.js and npm, then re-run." >&2
    exit 1
  fi
else
  echo "Skipping npm install (--no-install supplied)"
fi

# Ensure scripts/check-db.js exists before running check
if [[ -f "scripts/check-db.js" ]]; then
  echo "Checking MongoDB connectivity using scripts/check-db.js"
  # Non-fatal: allow the script to continue even if DB check fails
  MONGODB_URI="$MONGO_URI" node scripts/check-db.js || echo "DB check failed (continuing)"
else
  echo "No scripts/check-db.js found; skipping DB check"
fi

echo "Starting Next dev server (port $PORT)"
# Export PORT (Next will respect -p from package.json script; still set PORT env)
PORT="$PORT" npm run dev
