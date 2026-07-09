#!/bin/bash
set -e
pm2 delete preview-b5f35e45-15302 2>/dev/null || true && pm2 delete lt-b5f35e45-15302 2>/dev/null || true && echo 'cd /opt/ad/.vibe_data/b5f35e45-44ea-4e44-b954-5e07369d3dab/workspace/web && VITE_API_URL=https://lazy-lands-sip.loca.lt/api npm run dev -- --port 15302' > preview_15302.sh && chmod +x preview_15302.sh && pm2 start ./preview_15302.sh --name "preview-b5f35e45-15302" && echo 'npx --yes localtunnel --port 15302' > tunnel_15302.sh && chmod +x tunnel_15302.sh && pm2 start ./tunnel_15302.sh --name "lt-b5f35e45-15302"
