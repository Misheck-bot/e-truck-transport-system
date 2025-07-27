const { exec, spawn } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🚀 Starting MongoDB on Windows")
console.log("==============================")

// Create data directory
function createDataDirectory() {
  const dataDir = path.join(process.cwd(), "data", "db")
  if (!fs.existsSync(dataDir)) {
    console.log("📁 Creating data directory...")
    fs.mkdirSync(dataDir, { recursive: true })
    console.log("✅ Data directory created:", dataDir)
  } else {
    console.log("✅ Data directory exists:", dataDir)
  }
  return dataDir
}

// Check if MongoDB is already running
async function checkMongoDB() {
  return new Promise((resolve) => {
    exec('tasklist /FI "IMAGENAME eq mongod.exe"', (error, stdout, stderr) => {
      if (stdout.includes("mongod.exe")) {
        console.log("✅ MongoDB is already running")
        resolve(true)
      } else {
        console.log("❌ MongoDB is not running")
        resolve(false)
      }
    })
  })
}

// Start MongoDB service
function startMongoService() {
  return new Promise((resolve, reject) => {
    console.log("🔄 Attempting to start MongoDB service...")
    exec("net start MongoDB", (error, stdout, stderr) => {
      if (error) {
        console.log("❌ Service start failed:", error.message)
        reject(error)
      } else {
        console.log("✅ MongoDB service started successfully")
        console.log(stdout)
        resolve(true)
      }
    })
  })
}

// Start MongoDB manually
function startMongoManually(dataDir) {
  return new Promise((resolve, reject) => {
    console.log("🔄 Starting MongoDB manually...")
    console.log(`📁 Using data directory: ${dataDir}`)

    // Try to find mongod.exe in common locations
    const possiblePaths = [
      "C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe",
      "C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe",
      "C:\\Program Files\\MongoDB\\Server\\5.0\\bin\\mongod.exe",
      "mongod", // If it's in PATH
    ]

    let pathIndex = 0

    function tryNextPath() {
      if (pathIndex >= possiblePaths.length) {
        reject(new Error("Could not find mongod.exe"))
        return
      }

      const mongodPath = possiblePaths[pathIndex]
      console.log(`🔍 Trying: ${mongodPath}`)

      const mongodProcess = spawn(mongodPath, ["--dbpath", dataDir], {
        stdio: ["ignore", "pipe", "pipe"],
        detached: true,
      })

      mongodProcess.stdout.on("data", (data) => {
        const output = data.toString()
        console.log("📊 MongoDB:", output.trim())

        if (output.includes("Waiting for connections")) {
          console.log("✅ MongoDB started successfully!")
          mongodProcess.unref() // Allow the process to run independently
          resolve(true)
        }
      })

      mongodProcess.stderr.on("data", (data) => {
        const error = data.toString()
        if (error.includes("Address already in use")) {
          console.log("✅ MongoDB is already running on port 27017")
          resolve(true)
        } else {
          console.log("⚠️ MongoDB error:", error.trim())
        }
      })

      mongodProcess.on("error", (error) => {
        console.log(`❌ Failed to start with ${mongodPath}:`, error.message)
        pathIndex++
        setTimeout(tryNextPath, 1000)
      })

      mongodProcess.on("exit", (code) => {
        if (code !== 0) {
          console.log(`❌ MongoDB exited with code ${code}`)
          pathIndex++
          setTimeout(tryNextPath, 1000)
        }
      })

      // Give it 5 seconds to start
      setTimeout(() => {
        if (!mongodProcess.killed) {
          console.log("⏳ MongoDB is starting...")
          resolve(true)
        }
      }, 5000)
    }

    tryNextPath()
  })
}

// Test MongoDB connection
async function testConnection() {
  const { MongoClient } = require("mongodb")

  try {
    console.log("🧪 Testing MongoDB connection...")
    const client = new MongoClient("mongodb://localhost:27017", {
      serverSelectionTimeoutMS: 5000,
    })

    await client.connect()
    console.log("✅ Connection successful!")

    const db = client.db("etrucktransport")
    await db.admin().ping()
    console.log("🏓 Database ping successful!")

    await client.close()
    return true
  } catch (error) {
    console.log("❌ Connection test failed:", error.message)
    return false
  }
}

// Main function
async function main() {
  try {
    // Create data directory
    const dataDir = createDataDirectory()

    // Check if MongoDB is already running
    const isRunning = await checkMongoDB()
    if (isRunning) {
      const connected = await testConnection()
      if (connected) {
        console.log("🎉 MongoDB is ready!")
        return
      }
    }

    // Try to start MongoDB service first
    try {
      await startMongoService()
      await new Promise((resolve) => setTimeout(resolve, 3000)) // Wait 3 seconds
      const connected = await testConnection()
      if (connected) {
        console.log("🎉 MongoDB service is ready!")
        return
      }
    } catch (error) {
      console.log("⚠️ Service start failed, trying manual start...")
    }

    // Try manual start
    try {
      await startMongoManually(dataDir)
      await new Promise((resolve) => setTimeout(resolve, 5000)) // Wait 5 seconds
      const connected = await testConnection()
      if (connected) {
        console.log("🎉 MongoDB manual start successful!")
        return
      }
    } catch (error) {
      console.log("❌ Manual start failed:", error.message)
    }

    // If all fails, show instructions
    console.log("\n🔧 Manual Setup Required:")
    console.log("========================")
    console.log("1. Download MongoDB from: https://www.mongodb.com/try/download/community")
    console.log("2. Install with 'Complete' setup")
    console.log("3. Make sure 'Install as Windows Service' is checked")
    console.log("4. After installation, run: net start MongoDB")
    console.log("5. Or manually run: mongod --dbpath ./data/db")
  } catch (error) {
    console.error("❌ Startup failed:", error.message)
  }
}

main()
