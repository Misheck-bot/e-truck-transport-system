#!/bin/bash
# Script to start MongoDB on different operating systems

echo "🚀 Starting MongoDB..."

# Detect operating system
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    echo "🐧 Detected Linux system"
    sudo systemctl start mongod
    sudo systemctl status mongod
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "🍎 Detected macOS system"
    brew services start mongodb-community
    brew services list | grep mongodb
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    echo "🪟 Detected Windows system"
    net start MongoDB
else
    echo "❓ Unknown operating system: $OSTYPE"
    echo "Please start MongoDB manually"
fi

echo "✅ MongoDB startup command executed"
echo "🔍 Checking connection..."
node scripts/check-mongodb.js
