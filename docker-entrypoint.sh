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

