#!/usr/bin/env bash
#
# Re-encode all MP4s under public/video/ for web: H.264 + CRF + yuv420p + faststart.
# Keeps visuals close to the source; file size usually drops a lot on ProRes / high-bitrate exports.
#
# Prerequisites (macOS):
#   brew install ffmpeg
#
# Usage (from repo root):
#   npm run compress:videos
#   # or
#   bash scripts/compress-public-videos.sh
#
# Behavior:
#   - Writes each encode to a temp file next to the source.
#   - Replaces the original only if the new file is smaller (by at least 1%).
#   - Skips gracefully if ffmpeg fails for one file.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VIDEO_DIR="${ROOT}/public/video"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found. Install with:  brew install ffmpeg"
  exit 1
fi

filesize() {
  if stat -f%z "$1" >/dev/null 2>&1; then
    stat -f%z "$1"
  else
    stat -c%s "$1"
  fi
}

has_audio() {
  ffprobe -v error -select_streams a:0 -show_entries stream=codec_type -of csv=p=0 "$1" 2>/dev/null | grep -q .
}

# CRF: lower = higher quality / larger files. 20–23 is typical “visually transparent” for HD web.
# Preset: slower = better compression at same CRF (encode takes longer).
CRF="${VIDEO_CRF:-22}"
PRESET="${VIDEO_PRESET:-slow}"
# Optional: cap the longest side (e.g. VIDEO_MAX_DIM=1080). Never upscales; keeps aspect and even dimensions.
MAX_DIM="${VIDEO_MAX_DIM:-}"

echo "Video dir: ${VIDEO_DIR}"
echo "Using libx264 CRF=${CRF} preset=${PRESET}${MAX_DIM:+ max-dim=${MAX_DIM}} (override: VIDEO_CRF=23 VIDEO_PRESET=medium VIDEO_MAX_DIM=1080 $0)"
echo ""

shopt -s nullglob
count=0
for src in "${VIDEO_DIR}"/*.mp4; do
  [[ -f "$src" ]] || continue
  base="$(basename "$src")"
  tmp="${src%.mp4}.tmp-compress-$$.mp4"
  count=$((count + 1))

  echo "── ${base}"

  scale_args=()
  if [[ -n "$MAX_DIM" ]]; then
    scale_args=(-vf "scale='min(${MAX_DIM},iw)':'min(${MAX_DIM},ih)':force_original_aspect_ratio=decrease:force_divisible_by=2")
  fi

  if has_audio "$src"; then
    audio_args=(-c:a aac -b:a 128k)
  else
    audio_args=(-an)
  fi

  if ! ffmpeg -hide_banner -loglevel warning -stats \
    -i "$src" \
    -map_metadata 0 \
    "${scale_args[@]}" \
    -c:v libx264 -crf "${CRF}" -preset "${PRESET}" -pix_fmt yuv420p \
    -movflags +faststart \
    "${audio_args[@]}" \
    -y "$tmp"; then
    echo "  ffmpeg failed, skipping."
    rm -f "$tmp"
    continue
  fi

  old_sz="$(filesize "$src")"
  new_sz="$(filesize "$tmp")"
  pct=$((100 - (new_sz * 100 / old_sz)))

  if (( new_sz >= old_sz )); then
    echo "  Not smaller (old ${old_sz} bytes, new ${new_sz} bytes) — keeping original."
    rm -f "$tmp"
    continue
  fi

  # Require at least 1% savings to avoid pointless churn
  if (( pct < 1 )); then
    echo "  Savings <1% — keeping original."
    rm -f "$tmp"
    continue
  fi

  mv "$tmp" "$src"
  echo "  Replaced.  ${old_sz} → ${new_sz} bytes (~${pct}% smaller)"
  echo ""
done

if (( count == 0 )); then
  echo "No .mp4 files in ${VIDEO_DIR}"
  exit 0
fi

echo "Done. Processed ${count} file(s)."
