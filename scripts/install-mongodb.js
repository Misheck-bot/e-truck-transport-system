const { exec } = require("child_process")
const fs = require("fs")
const path = require("path")

function detectOS() {
  const platform = process.platform
  if (platform === "win32") return "windows"
  if (platform === "darwin") return "macos"
  if (platform === "linux") return "linux"
  return "unknown"
}

function installMongoDB() {
  const os = detectOS()
  console.log(`🔍 Detected OS: ${os}`)

  switch (os) {
    case "windows":
      console.log("📥 Installing MongoDB on Windows...")
      console.log("Please download MongoDB from: https://www.mongodb.com/try/download/community")
      console.log("Or use chocolatey: choco install mongodb")
      break

    case "macos":
      console.log("📥 Installing MongoDB on macOS...")
      exec("brew tap mongodb/brew && brew install mongodb-community", (error, stdout, stderr) => {
        if (error) {
          console.log("❌ Homebrew installation failed. Please install manually:")
          console.log(
            '1. Install Homebrew: /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
          )
          console.log("2. Run: brew tap mongodb/brew && brew install mongodb-community")
        } else {
          console.log("✅ MongoDB installed successfully")
          startMongoDB()
        }
      })
      break

    case "linux":
      console.log("📥 Installing MongoDB on Linux...")
      exec("sudo apt-get update && sudo apt-get install -y mongodb", (error, stdout, stderr) => {
        if (error) {
          console.log("❌ APT installation failed. Trying with snap...")
          exec("sudo snap install mongodb", (error2, stdout2, stderr2) => {
            if (error2) {
              console.log("❌ Installation failed. Please install manually:")
              console.log("Visit: https://docs.mongodb.com/manual/installation/")
            } else {
              console.log("✅ MongoDB installed successfully")
              startMongoDB()
            }
          })
        } else {
          console.log("✅ MongoDB installed successfully")
          startMongoDB()
        }
      })
      break

    default:
      console.log("❌ Unsupported OS. Please install MongoDB manually:")
      console.log("Visit: https://docs.mongodb.com/manual/installation/")
  }
}

function startMongoDB() {
  const os = detectOS()
  let command

  switch (os) {
    case "windows":
      command = "net start MongoDB"
      break
    case "macos":
      command = "brew services start mongodb-community"
      break
    case "linux":
      command = "sudo systemctl start mongod"
      break
    default:
      command = "mongod"
  }

  console.log(`🚀 Starting MongoDB with: ${command}`)
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log("❌ Failed to start MongoDB service. Trying manual start...")
      exec("mongod", (error2, stdout2, stderr2) => {
        if (error2) {
          console.log("❌ Manual start failed. Please start MongoDB manually:")
          console.log("Run: mongod")
        } else {
          console.log("✅ MongoDB started manually")
        }
      })
    } else {
      console.log("✅ MongoDB service started")
    }
  })
}

function createDataDirectory() {
  const dataDir = path.join(process.cwd(), "data", "db")

  if (!fs.existsSync(dataDir)) {
    console.log("📁 Creating MongoDB data directory...")
    fs.mkdirSync(dataDir, { recursive: true })
    console.log("✅ Data directory created at:", dataDir)
  } else {
    console.log("✅ Data directory already exists")
  }
}

async function main() {
  console.log("🚀 MongoDB Installation and Setup")
  console.log("==================================")

  // Create data directory
  createDataDirectory()

  // Check if MongoDB is already installed
  exec("mongod --version", (error, stdout, stderr) => {
    if (error) {
      console.log("❌ MongoDB not found. Installing...")
      installMongoDB()
    } else {
      console.log("✅ MongoDB is already installed")
      console.log("Version:", stdout.split("\n")[0])
      startMongoDB()
    }
  })
}

main()
