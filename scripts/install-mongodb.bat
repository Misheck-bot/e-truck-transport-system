@echo off
echo 🚀 MongoDB Windows Installation Script
echo =====================================

echo 📁 Creating data directory...
if not exist "data\db" mkdir data\db
echo ✅ Data directory created

echo 🔍 Checking if MongoDB is already installed...
mongod --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ MongoDB is already installed
    echo 🚀 Starting MongoDB...
    net start MongoDB
    if %errorlevel% == 0 (
        echo ✅ MongoDB service started
    ) else (
        echo ⚠️ Service start failed, trying manual start...
        start /B mongod --dbpath ./data/db
        echo ✅ MongoDB started manually
    )
    goto :test
)

echo ❌ MongoDB not found. Please install it manually:
echo.
echo 📥 Installation Steps:
echo 1. Go to: https://www.mongodb.com/try/download/community
echo 2. Download MongoDB Community Server for Windows
echo 3. Run the .msi installer
echo 4. Choose 'Complete' installation
echo 5. Install MongoDB as a Windows Service
echo 6. After installation, run this script again
echo.
echo 🔗 Direct download link:
echo https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.4-signed.msi
echo.
pause
goto :end

:test
echo ⏳ Waiting for MongoDB to start...
timeout /t 5 /nobreak >nul
echo 🧪 Testing connection...
node scripts/check-and-start-mongodb.js

:end
echo.
echo 🎉 Setup complete! You can now run:
echo    npm run dev-server
pause
