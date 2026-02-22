#!/bin/sh
set -eu

# Path where the built site is served from in the nginx image
OUT_FILE=/usr/share/nginx/html/runtime-config.js

# Helper: escape single quotes for safe JS single-quoted string
escape() {
  printf "%s" "$1" | sed "s/'/\\\\'/" 
}

SUP_URL=""
SUP_KEY=""

if [ -n "${VITE_SUPABASE_URL:-}" ]; then
  SUP_URL=$(escape "$VITE_SUPABASE_URL")
fi

if [ -n "${VITE_SUPABASE_ANON_KEY:-}" ]; then
  SUP_KEY=$(escape "$VITE_SUPABASE_ANON_KEY")
fi

cat > "$OUT_FILE" <<EOF
window.__RUNTIME_SUPABASE_URL='${SUP_URL}';
window.__RUNTIME_SUPABASE_ANON_KEY='${SUP_KEY}';
EOF

exec "$@"

#!/bin/sh
set -e

# Generate runtime-config.js from environment variables so the built bundle
# (which contains no Vite build-time envs) can read them at runtime.
# Expects VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to be provided to the container.

RUNTIME_FILE="/usr/share/nginx/html/runtime-config.js"

cat > "${RUNTIME_FILE}" <<EOF
// This file is generated at container start from environment variables.
window.__RUNTIME_SUPABASE_URL = ${VITE_SUPABASE_URL ? "'"${VITE_SUPABASE_URL}"'" : 'undefined'};
window.__RUNTIME_SUPABASE_ANON_KEY = ${VITE_SUPABASE_ANON_KEY ? "'"${VITE_SUPABASE_ANON_KEY}"'" : 'undefined'};
EOF

echo "Wrote runtime config to ${RUNTIME_FILE}"

# Exec passed command (default will be nginx -g 'daemon off;')
exec "$@"

