#!/bin/bash
set -e

APP_DIR="/home/ubuntu/mediation-system"
PORT=3002

echo "=== Installing Node.js ==="
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

echo "=== Setting up application ==="
mkdir -p $APP_DIR
cd $APP_DIR

echo "=== Installing dependencies ==="
npm install --production

echo "=== Creating data directory ==="
mkdir -p data

echo "=== Creating systemd service ==="
sudo tee /etc/systemd/system/mediation.service > /dev/null <<EOF
[Unit]
Description=Mediation Management Platform
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=$APP_DIR
ExecStart=$(which node) server/index.js
Restart=always
RestartSec=5
Environment=PORT=$PORT
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

echo "=== Updating server port to $PORT ==="
cd $APP_DIR

echo "=== Starting service ==="
sudo systemctl daemon-reload
sudo systemctl enable mediation
sudo systemctl restart mediation

echo "=== Waiting for service to start ==="
sleep 3

echo "=== Service status ==="
sudo systemctl status mediation --no-pager || true

echo "=== Deployment complete! ==="
echo "Application should be running on port $PORT"
