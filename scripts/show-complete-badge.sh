#!/bin/zsh

set -euo pipefail

PROJECT_DIR="${0:A:h:h}"
APP_DIR="${PROJECT_DIR}/tools/CompletionBadge.app"
APP_EXECUTABLE="${APP_DIR}/Contents/MacOS/HandwritingNotesCompletionBadge"

mkdir -p "${APP_DIR}/Contents/MacOS" "${APP_DIR}/Contents/Resources"

swiftc "${PROJECT_DIR}/tools/CompletionBadge/main.swift" \
  -framework Cocoa \
  -o "${APP_EXECUTABLE}"

cp "${PROJECT_DIR}/tools/CompletionBadge/Info.plist" "${APP_DIR}/Contents/Info.plist"

# Restarting the tiny helper lets a later task raise the badge again.
pkill -x HandwritingNotesCompletionBadge 2>/dev/null || true
open "${APP_DIR}"
