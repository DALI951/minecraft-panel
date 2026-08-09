#!/bin/bash
# Update script for Minecraft Panel
# Run this on the server to pull latest changes and rebuild

set -e

PANEL_DIR="/home/modali/minecraft-panel"

echo "=== Minecraft Panel Updater ==="
echo ""

cd "$PANEL_DIR"

echo "[1/4] Pulling latest changes..."
git pull origin master

echo "[2/4] Installing backend dependencies..."
npm install --production

echo "[3/4] Installing and building frontend..."
cd client
npm install
npm run build
cd ..

echo "[4/4] Restarting panel..."
pm2 restart minecraft-panel

echo ""
echo "Done! Panel updated and restarted."
echo "Access at: http://$(hostname -I | awk '{print $1}'):3000"
