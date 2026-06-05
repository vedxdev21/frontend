#!/bin/bash
set -e
echo ""
echo "  Repnex Gateway Agent - Linux/Mac Setup"
echo "======================================================"
echo ""

# Find Python 3
PY=""
for cmd in python3 python; do
  if command -v "$cmd" &>/dev/null && "$cmd" --version 2>&1 | grep -q "Python 3"; then
    PY="$cmd"; echo "Found: $($cmd --version)"; break
  fi
done

if [ -z "$PY" ]; then
  echo "Python 3 not found. Installing..."
  if command -v apt-get &>/dev/null; then
    sudo apt-get update -y && sudo apt-get install -y python3 python3-pip && PY=python3
  elif command -v yum &>/dev/null; then
    sudo yum install -y python3 python3-pip && PY=python3
  elif command -v brew &>/dev/null; then
    brew install python3 && PY=python3
  else
    echo "Cannot auto-install Python. Visit: https://python.org/downloads"; exit 1
  fi
fi

$PY -m pip --version &>/dev/null || $PY -m ensurepip --upgrade 2>/dev/null || curl -sS https://bootstrap.pypa.io/get-pip.py | $PY

echo "Installing Python dependencies..."
$PY -m pip install websockets pymssql asyncpg --quiet

DIR="$(cd "$(dirname "$0")" && pwd)"
echo ""
echo "Downloading repnex-agent.py..."
curl -fsSL "https://repnex-backend.onrender.com/v1/agent/download" -o "$DIR/repnex-agent.py"

echo ""
echo "Registering as auto-start service..."
$PY "$DIR/repnex-agent.py" --install-service \
  --server "wss://repnex-backend.onrender.com" \
  --token "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiODk4ZjU1Zi03MTJiLTRkMDAtYjdhMC1kNWQyMjgyYjBjN2YiLCJvcmciOiJjMGVlZGJjYy1kZjhiLTRmZmQtODk4MS1hYTcyZjg0MTkxYjQiLCJlbWFpbCI6InNoYXJtYTA5a2VzaGF2QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3ODA0Njk4MzksImV4cCI6MTc4MDQ3MDczOSwianRpIjoiYzQyMDBiNjAtMTc4Yi00ZjcwLWExYmItZDNkYzVlZjYyMzk5In0.143SEkvmwUkIycEbCFrYqOT6GLzew0Q-2YYd-XmifVU" \
  --agent-name "my-laptop" \
  --db-type "mssql" \
  --db-host "localhost" \
  --db-port "1433" \
  --db-user "sa" \
  --db-password ""

echo ""
echo "SUCCESS! Agent running and auto-starts on reboot."