const { exec } = require("child_process")
const fs = require("fs")
const path = require("path")
const https = require("https")

console.log("🚀 MongoDB Windows Installation Helper")
console.log("=====================================")

// Check if chocolatey is installed
function checkChocolatey() {
  return new Promise((resolve) => {
    exec("choco --version", (error, stdout, stderr) => {
      if (error) {
        console.log("❌ Chocolatey not found")
        resolve(false)
      } else {
        console.log("✅ Chocolatey found:", stdout.trim())
        resolve(true)
      }
    })
  })
}

// Install chocolatey
function installChocolatey() {
  return new Promise((resolve, reject) => {
    console.log("📥 Installing Chocolatey...")
    const command = `powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"`

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log("❌ Chocolatey installation failed:", error.message)
        reject(error)
      } else {
        console.log("✅ Chocolatey installed successfully")
        resolve()
      }
    })
  })
}

// Install MongoDB via chocolatey
function installMongoDBChoco() {
  return new Promise((resolve, reject) => {
    console.log("📥 Installing MongoDB via Chocolatey...")
    exec("choco install mongodb -y", (error, stdout, stderr) => {
      if (error) {
        console.log("❌ MongoDB installation failed:", error.message)
        reject(error)
      } else {
        console.log("✅ MongoDB installed successfully")
        console.log(stdout)
        resolve()
      }
    })
  })
}

// Start MongoDB service
function startMongoDBService() {
  return new Promise((resolve) => {
    console.log("🚀 Starting MongoDB service...")
    exec("net start MongoDB", (error, stdout, stderr) => {
      if (error) {
        console.log("⚠️ Service start failed, trying manual start...")
        // Try to start mongod manually
        exec("mongod --dbpath ./data/db", (error2, stdout2, stderr2) => {
          if (error2) {
            console.log("❌ Manual start also failed")
            console.log("💡 You may need to start MongoDB manually:")
            console.log("   1. Open Command Prompt as Administrator")
            console.log("   2. Run: mongod --dbpath ./data/db")
          } else {
            console.log("✅ MongoDB started manually")
          }
          resolve()
        })
      } else {
        console.log("✅ MongoDB service started")
        console.log(stdout)
        resolve()
      }
    })
  })
}

// Create MongoDB data directory
function createDataDirectory() {
  const dataDir = path.join(process.cwd(), "data", "db")

  if (!fs.existsSync(dataDir)) {
    console.log("📁 Creating MongoDB data directory...")
    fs.mkdirSync(dataDir, { recursive: true })
    console.log("✅ Data directory created:", dataDir)
  } else {
    console.log("✅ Data directory already exists")
  }
}

// Manual installation instructions
function showManualInstructions() {
  console.log("\n📋 Manual Installation Instructions:")
  console.log("=====================================")
  console.log("1. Go to: https://www.mongodb.com/try/download/community")
  console.log("2. Select:")
  console.log("   - Version: 7.0.x (Current)")
  console.log("   - Platform: Windows")
  console.log("   - Package: msi")
  console.log("3. Download and run the .msi installer")
  console.log("4. Choose 'Complete' installation")
  console.log("5. Install MongoDB as a Windows Service")
  console.log("6. After installation, run: node scripts/check-and-start-mongodb.js")
  console.log("\n🔗 Direct download link:")
  console.log("https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.4-signed.msi")
}

// Main installation process
async function main() {
  try {
    // Create data directory first
    createDataDirectory()

    // Check if chocolatey is available
    const hasChoco = await checkChocolatey()

    if (hasChoco) {
      // Install MongoDB via chocolatey
      try {
        await installMongoDBChoco()
        await startMongoDBService()

        console.log("\n🎉 MongoDB installation completed!")
        console.log("🔍 Testing connection...")

        // Test the installation
        setTimeout(() => {
          require("./check-and-start-mongodb.js")
        }, 3000)
      } catch (error) {
        console.log("❌ Chocolatey installation failed")
        showManualInstructions()
      }
    } else {
      console.log("\n🤔 Chocolatey not found. You have two options:")
      console.log("1. Install Chocolatey first (recommended)")
      console.log("2. Manual MongoDB installation")

      console.log("\n📥 Option 1: Install Chocolatey")
      console.log("Run this command as Administrator:")
      console.log(
        "powershell -Command \"Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))\"",
      )
      console.log("Then run: choco install mongodb -y")

      console.log("\n📥 Option 2: Manual Installation")
      showManualInstructions()
    }
  } catch (error) {
    console.error("❌ Installation failed:", error.message)
    showManualInstructions()
  }
}

main()
