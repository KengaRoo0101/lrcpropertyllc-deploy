#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-3000}"
LOG_FILE="${TMPDIR:-/tmp}/lrc-ninja-${PORT}.log"

cd "$ROOT_DIR"

if ! lsof -ti "tcp:${PORT}" >/dev/null 2>&1; then
  PORT="$PORT" node server.js >"$LOG_FILE" 2>&1 &
fi

open "http://localhost:${PORT}/ninja/"
