#!/bin/bash

# OpenClaw Monitor Dashboard - Build & Start Script

set -e

echo "🦞 Building OpenClaw Monitor..."

# Build the Docker image
docker build -t openclaw-monitor:latest .

echo "✅ Build complete!"
echo ""
echo "Starting OpenClaw Monitor..."
echo "Dashboard: http://localhost:8899"
echo ""

# Run the container
docker run -d \
  --name openclaw-monitor \
  -p 8899:8899 \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v /usr/local/bin/openclaw:/usr/local/bin/openclaw:ro \
  --restart unless-stopped \
  openclaw-monitor:latest

echo "🚀 OpenClaw Monitor is running!"
echo "   Dashboard: http://localhost:8899"
echo "   API: http://localhost:8899/api/dashboard"
