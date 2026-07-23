#!/usr/bin/env bash
# Package the extension/ folder into croissant-viewer.zip for the Chrome Web Store.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -f croissant-viewer.zip
( cd extension && zip -qr ../croissant-viewer.zip . )
echo "Wrote croissant-viewer.zip ($(du -h croissant-viewer.zip | cut -f1))"
