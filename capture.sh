#!/usr/bin/env bash
# Capture desktop and mobile screenshots of a running deployment.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
: "${CAPTURE_URL:?Set CAPTURE_URL to the deployed page URL.}"
: "${CAPTURE_DIR:?Set CAPTURE_DIR to the screenshot output directory.}"
export CAPTURE_URL CAPTURE_DIR
export PLAYWRIGHT_RUNTIME="${PLAYWRIGHT_RUNTIME:-$HOME/.local/share/omgithub-playwright}"

now_ms() { date +%s%3N; }
run() {
  local label="$1" started ended status
  shift
  started="$(now_ms)"
  echo "[capture.sh] $label: begin"
  set +e
  "$@"
  status=$?
  set -e
  ended="$(now_ms)"
  local elapsed=$((ended - started))
  if (( elapsed < 0 )); then elapsed=0; fi
  echo "[capture.sh] $label: end (${status}, ${elapsed}ms)"
  return "$status"
}

run "cd $SCRIPT_DIR" cd "$SCRIPT_DIR"
check_playwright_runtime() {
  [[ -f "$PLAYWRIGHT_RUNTIME/package.json" || -f "$PLAYWRIGHT_RUNTIME/node_modules/playwright/package.json" ]]
}

run "check capture script" test -f capture.mjs
run "check node" node --version
run "check playwright runtime" check_playwright_runtime
run "create output dir" mkdir -p "$CAPTURE_DIR"
CAPTURE_DIR="$(cd "$CAPTURE_DIR" && pwd)"
export CAPTURE_DIR
if [[ "$CAPTURE_DIR" == "$SCRIPT_DIR" || "$CAPTURE_DIR" == "$SCRIPT_DIR/"* ]]; then
  echo "[capture.sh] CAPTURE_DIR must be outside the project source: $CAPTURE_DIR" >&2
  exit 1
fi
run "capture desktop and mobile" node capture.mjs
run "verify desktop screenshot" test -s "$CAPTURE_DIR/final-desktop.png"
run "verify mobile screenshot" test -s "$CAPTURE_DIR/final-mobile.png"
