#!/usr/bin/env bash
set -euo pipefail

# Converts wav files in static/music-dir (pattern pNNNN_0.wav) to mp3 as song<index>.mp3
# Skips existing mp3 files with same name.
# After conversion, optionally removes original wavs (default: keep unless REMOVE=1)
# Finally regenerates manifest via gen-manifest.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MUSIC_DIR="$ROOT_DIR/static/music-dir"
REMOVE_ORIGINAL="${REMOVE:-0}"
BITRATE="${BITRATE:-192k}" # Allow override

if [[ ! -d "$MUSIC_DIR" ]]; then
  echo "Music directory not found: $MUSIC_DIR" >&2
  exit 1
fi

shopt -s nullglob
wav_files=("$MUSIC_DIR"/p????_0.wav)

if (( ${#wav_files[@]} == 0 )); then
  echo "No matching wav files (pNNNN_0.wav) found."
fi

idx=0
for wav in "${wav_files[@]}"; do
  mp3="$MUSIC_DIR/song${idx}.mp3"
  if [[ -f "$mp3" ]]; then
    echo "Skipping existing $mp3"
  else
    echo "Converting $(basename "$wav") -> $(basename "$mp3")"
    ffmpeg -v error -y -i "$wav" -codec:a libmp3lame -b:a "$BITRATE" "$mp3"
  fi
  if [[ "$REMOVE_ORIGINAL" == "1" ]]; then
    rm -f -- "$wav"
  fi
  # Increment index without triggering -e on zero result
  : $((idx++))
done

# Regenerate manifest
"$ROOT_DIR/scripts/gen-manifest.sh"

echo "Conversion complete. Generated $(grep -c 'song[0-9]*.mp3' "$MUSIC_DIR/manifest.json" || true) mp3 entries."
