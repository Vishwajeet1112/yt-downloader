#!/bin/sh
set -eu

REAL_YTDLP="/usr/local/bin/yt-dlp-real"
COOKIE_FILE="/tmp/youtube-cookies.txt"

# Rebuild the temporary cookie file on EVERY yt-dlp invocation.
# This ensures a refreshed Railway secret is picked up without using stale cookies.
rm -f "$COOKIE_FILE"

if [ -n "${YOUTUBE_COOKIES_B64:-}" ]; then
  if printf '%s' "$YOUTUBE_COOKIES_B64" | base64 -d > "$COOKIE_FILE" 2>/dev/null && [ -s "$COOKIE_FILE" ]; then
    chmod 600 "$COOKIE_FILE"
    exec "$REAL_YTDLP" --cookies "$COOKIE_FILE" "$@"
  fi

  rm -f "$COOKIE_FILE"
  echo "WARNING: YOUTUBE_COOKIES_B64 is set but invalid/empty; continuing without cookies." >&2
fi

exec "$REAL_YTDLP" "$@"
