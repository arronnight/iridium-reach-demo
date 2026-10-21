#!/usr/bin/env bash
# Build the static game into ./dist and serve it in the foreground.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${PROJECT_DIR:-$SCRIPT_DIR}" && pwd)"
PORT="${PORT:-3000}"
BUILD_DIR="$PROJECT_DIR/dist"
OPENCODE_WEB_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
DEPLOYMENT_OUTPUT="$OPENCODE_WEB_DIR/deployment-output.json"
export PYTHONUNBUFFERED=1

now_ms() { date +%s%3N; }
run() {
  local label="$1" started ended status
  shift
  started="$(now_ms)"
  echo "[start] $label: begin"
  set +e
  "$@"
  status=$?
  set -e
  ended="$(now_ms)"
  local elapsed=$((ended - started))
  if (( elapsed < 0 )); then elapsed=0; fi
  echo "[start] $label: end (${status}, ${elapsed}ms)"
  return "$status"
}

write_metadata() {
  printf '{"project":"%s","directory":"%s"}\n' "$PROJECT_DIR" "$BUILD_DIR" > "$DEPLOYMENT_OUTPUT"
}

install_dependencies() {
  if [[ -f package.json ]]; then
    if [[ -f package-lock.json ]]; then
      npm ci
    else
      npm install
    fi
  else
    echo "No package.json; this is a static ES-module project."
  fi
}

run "cd $PROJECT_DIR" cd "$PROJECT_DIR"
run "ensure metadata dir" mkdir -p "$OPENCODE_WEB_DIR"
run "install dependencies" install_dependencies

# This project has no npm dependencies and no bundler: the browser loads the
# ES modules directly. Rebuild a self-contained static directory on every
# start so deployment always matches the checked-out source.
run "clean build dir" rm -rf "$BUILD_DIR"
run "create build dir" mkdir -p "$BUILD_DIR"
run "copy static source" cp -a index.html src vendor assets "$BUILD_DIR"/

run "verify entry point" test -f "$BUILD_DIR/index.html"
run "write deployment metadata" write_metadata
run "validate deployment metadata" python3 -c 'import json,sys; json.load(open(sys.argv[1]))' "$DEPLOYMENT_OUTPUT"

echo "[start] serving $BUILD_DIR on 0.0.0.0:$PORT"
run "serve" python3 -m http.server "$PORT" --bind 0.0.0.0 --directory "$BUILD_DIR"
