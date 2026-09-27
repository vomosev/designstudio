#!/usr/bin/env bash
#
# START.sh — boot the Prism Studio Express API (server/index.js)
#
# Usage:
#   ./START.sh
#
# Behaviour:
#   * cd to the directory containing this script
#   * export PORT=4112 when PORT is not already set in the environment
#   * install production dependencies when node_modules/ is missing
#   * launch the API detached with nohup, logging to logs/api.log
#   * record the child PID in designstudio.pid
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# --- Environment -------------------------------------------------------------
export PORT="${PORT:-4112}"
export NODE_ENV="${NODE_ENV:-production}"

# Load .env if present so the API inherits DB/SSL/session settings.
if [ -f "$SCRIPT_DIR/.env" ]; then
  echo "[START] Loading environment from .env"
  set -o allexport
  # shellcheck disable=SC1091
  . "$SCRIPT_DIR/.env"
  set +o allexport
  # .env must never override an explicitly supplied PORT
  export PORT="${PORT:-4112}"
fi

# --- Sanity checks -----------------------------------------------------------
if ! command -v node >/dev/null 2>&1; then
  echo "[START] ERROR: node is not installed or not on PATH." >&2
  exit 1
fi

if [ ! -f "$SCRIPT_DIR/server/index.js" ]; then
  echo "[START] ERROR: server/index.js not found in $SCRIPT_DIR." >&2
  exit 1
fi

# --- Dependencies ------------------------------------------------------------
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
  echo "[START] node_modules missing — running npm install --omit=dev"
  if ! command -v npm >/dev/null 2>&1; then
    echo "[START] ERROR: npm is not installed or not on PATH." >&2
    exit 1
  fi
  npm install --omit=dev
fi

# --- Launch ------------------------------------------------------------------
mkdir -p logs

# Stop an existing instance recorded in designstudio.pid, if it is still alive.
if [ -f "$SCRIPT_DIR/designstudio.pid" ]; then
  OLD_PID="$(cat "$SCRIPT_DIR/designstudio.pid" 2>/dev/null || true)"
  if [ -n "${OLD_PID:-}" ] && kill -0 "$OLD_PID" >/dev/null 2>&1; then
    echo "[START] Stopping previous instance (PID $OLD_PID)"
    kill "$OLD_PID" >/dev/null 2>&1 || true
    sleep 1
  fi
  rm -f "$SCRIPT_DIR/designstudio.pid"
fi

echo "[START] Launching Prism Studio API on port $PORT"
nohup node server/index.js > logs/api.log 2>&1 &
API_PID=$!
echo "$API_PID" > "$SCRIPT_DIR/designstudio.pid"

sleep 1
if ! kill -0 "$API_PID" >/dev/null 2>&1; then
  echo "[START] ERROR: the API exited immediately. Last log lines:" >&2
  tail -n 20 logs/api.log >&2 || true
  exit 1
fi

echo "[START] API running with PID $API_PID"
echo "[START] Logs: $SCRIPT_DIR/logs/api.log"
echo "[START] Health check: https://designstudio-api.arx-app.com:4112/health"