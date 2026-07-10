#!/bin/bash
set -e
pm2 delete preview-b5f35e45-11520 2>/dev/null || true && pm2 delete lt-b5f35e45-11520 2>/dev/null || true && echo 'cd /opt/ad/.vibe_data/b5f35e45-44ea-4e44-b954-5e07369d3dab/workspace/backend && PORT=11520 npm start' > preview_11520.sh && chmod +x preview_11520.sh && pm2 start ./preview_11520.sh --name "preview-b5f35e45-11520" && echo 'npx --yes localtunnel --port 11520' > tunnel_11520.sh && chmod +x tunnel_11520.sh && pm2 start ./tunnel_11520.sh --name "lt-b5f35e45-11520"
