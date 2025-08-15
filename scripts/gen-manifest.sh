#!/usr/bin/env bash
set -euo pipefail

# Generates static/music-dir/manifest.json listing audio files.
# Supports: wav, mp3, ogg, m4a, flac
# Usage: ./scripts/gen-manifest.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MUSIC_DIR="$ROOT_DIR/static/music-dir"
OUT_FILE="$MUSIC_DIR/manifest.json"

if [[ ! -d "$MUSIC_DIR" ]]; then
  echo "Music directory not found: $MUSIC_DIR" >&2
  exit 1
fi

# Collect files (non-recursive) and sort
mapfile -t FILES < <(find "$MUSIC_DIR" -maxdepth 1 -type f \
  \( -iname '*.wav' -o -iname '*.mp3' -o -iname '*.ogg' -o -iname '*.m4a' -o -iname '*.flac' \) \
  -printf '%f\n' | sort)

echo "Writing manifest with ${#FILES[@]} entries -> $OUT_FILE"

{
  printf '[\n'
  for ((i=0; i<${#FILES[@]}; i++)); do
    f="${FILES[$i]}"
    # Escape any embedded quotes just in case
  esc="${f//\"/\\\"}"
    if (( i == ${#FILES[@]} - 1 )); then
      printf '  "%s"\n' "$esc"
    else
      printf '  "%s",\n' "$esc"
    fi
  done
  printf ']\n'
} > "$OUT_FILE"

echo "Done."
