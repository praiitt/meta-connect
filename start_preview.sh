#!/bin/bash
set -e
pm2 delete preview-b5f35e45-14567 2>/dev/null || true && pm2 delete lt-b5f35e45-14567 2>/dev/null || true && echo 'cd /opt/ad/.vibe_data/b5f35e45-44ea-4e44-b954-5e07369d3dab/workspace/backend && PORT=14567 npm run dev' > preview_14567.sh && chmod +x preview_14567.sh && pm2 start ./preview_14567.sh --name "preview-b5f35e45-14567" && echo 'npx --yes localtunnel --port 14567' > tunnel_14567.sh && chmod +x tunnel_14567.sh && pm2 start ./tunnel_14567.sh --name "lt-b5f35e45-14567"
