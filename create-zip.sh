#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  BusTrace — ZIP Packager
#  Creates bus-tracker.zip excluding node_modules and .env
#  Run from inside the project root: bash create-zip.sh
# ─────────────────────────────────────────────────────────────

OUTPUT="bus-tracker.zip"

echo ""
echo "📦  Packaging BusTrace..."

# Remove old zip if exists
[ -f "$OUTPUT" ] && rm "$OUTPUT"

zip -r "$OUTPUT" . \
  --exclude "*.git*" \
  --exclude "node_modules/*" \
  --exclude ".env" \
  --exclude "*.log" \
  --exclude "__pycache__/*" \
  --exclude "*.DS_Store" \
  --exclude "$OUTPUT"

SIZE=$(du -sh "$OUTPUT" | cut -f1)
echo ""
echo "✅  Created: $OUTPUT ($SIZE)"
echo ""
echo "📋  Contents:"
unzip -l "$OUTPUT" | tail -n +4 | head -n -2 | awk '{print "   " $4}'
echo ""
echo "Share $OUTPUT — recipients run: bash setup.sh"
echo ""
