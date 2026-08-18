#!/bin/sh
set -eu

REAL_YTDLP="/usr/local/bin/yt-dlp-real"
COOKIE_FILE="/tmp/youtube-cookies.txt"

# Optional: Railway secret containing base64-encoded Netscape cookies.txt.
# The secret is never stored in the repository.
if [ -n "${YOUTUBE_COOKIES_B64:-}" ]; then
  if printf '%s' "$YOUTUBE_COOKIES_B64" | base64 -d > "$COOKIE_FILE" 2>/dev/null; then
    chmod 600 "$COOKIE_FILE"
    exec "$REAL_YTDLP" --cookies "$COOKIE_FILE" "$@"
  fi
  echo "WARNING: YOUTUBE_COOKIES_B64 is set but could not be decoded; continuing without cookies." >&2
fi

exec "$REAL_YTDLP" "$@"
