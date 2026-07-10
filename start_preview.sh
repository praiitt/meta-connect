#!/bin/bash
set -e
pm2 delete preview-b5f35e45-11501 2>/dev/null || true && pm2 delete lt-b5f35e45-11501 2>/dev/null || true && echo 'cd /opt/ad/.vibe_data/b5f35e45-44ea-4e44-b954-5e07369d3dab/workspace/web && npm run dev -- --port 11501' > preview_11501.sh && chmod +x preview_11501.sh && pm2 start ./preview_11501.sh --name "preview-b5f35e45-11501" && echo 'npx --yes localtunnel --port 11501' > tunnel_11501.sh && chmod +x tunnel_11501.sh && pm2 start ./tunnel_11501.sh --name "lt-b5f35e45-11501"
