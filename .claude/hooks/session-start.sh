#!/bin/bash
# Cloud sessions start from a fresh clone: install the app's dependencies so
# typecheck, lint, build and the layout test work right away.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR/client"
npm install --no-audit --no-fund --loglevel=error

# api.expo.dev is not reachable from the sandbox; Expo CLI must not try it.
echo 'export EXPO_OFFLINE=1' >> "$CLAUDE_ENV_FILE"
