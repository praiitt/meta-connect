#!/bin/bash
set -e
pm2 delete preview-b5f35e45-15234 2>/dev/null || true && pm2 delete lt-b5f35e45-15234 2>/dev/null || true && echo 'npx localtunnel --port 15234' > preview_15234.sh && chmod +x preview_15234.sh && pm2 start ./preview_15234.sh --name "preview-b5f35e45-15234" && echo 'npx --yes localtunnel --port 15234' > tunnel_15234.sh && chmod +x tunnel_15234.sh && pm2 start ./tunnel_15234.sh --name "lt-b5f35e45-15234"
