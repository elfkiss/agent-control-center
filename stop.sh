#!/bin/bash

# OpenClaw Monitor Dashboard - Stop Script

echo "🛑 Stopping OpenClaw Monitor..."

# Stop and remove container
docker stop openclaw-monitor 2>/dev/null || true
docker rm openclaw-monitor 2>/dev/null || true

echo "✅ OpenClaw Monitor stopped."
