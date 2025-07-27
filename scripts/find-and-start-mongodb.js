const { exec, spawn } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🔍 Finding MongoDB installation...")

// Common MongoDB installation paths on Windows
const mongodPaths = [
  "C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe",
  "C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe",
  "C:\\Program Files\\MongoDB\\Server\\5.0\\bin\\mongod.exe",
  "C:\\Program Files\\MongoDB\\Server\\4.4\\bin\\mongod.exe",
  "C:\\Program Files (x86)\\MongoDB\\Server\\7.0\\bin\\mongod.exe",
  "C:\\Program Files (x86)\\MongoDB\\Server\\6.0\\bin\\mongod.exe",
]

function findMongoDB() {
  console.log("📂 Checking common MongoDB installation paths...")

  for (const mongodPath of mongodPaths) {
    if (fs.existsSync(mongodPath)) {
      console.log(`✅ Found MongoDB at: ${mongodPath}`)
      return mongodPath
    }
  }

  console.log("❌ MongoDB not found in common paths")
  return null
}

function createDataDirectory() {
  const dataDirs = ["C:\\data\\db", path.join(process.cwd(), "data", "db")]

  for (const dataDir of dataDirs) {
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
        console.log(`📁 Created data directory: ${dataDir}`)
      } else {
        console.log(`✅ Data directory exists: ${dataDir}`)
      }
      return dataDir
    } catch (error) {
      console.log(`❌ Cannot create ${dataDir}: ${error.message}`)
    }
  }

  return null
}

function startMongoDB(mongodPath, dataDir) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Starting MongoDB...`)
    console.log(`📂 Using data directory: ${dataDir}`)
    console.log(`🔧 MongoDB path: ${mongodPath}`)

    const mongodProcess = spawn(mongodPath, ["--dbpath", dataDir], {
      stdio: ["ignore", "pipe", "pipe"],
    })

    mongodProcess.stdout.on("data", (data) => {
      const output = data.toString()
      console.log(`📊 MongoDB: ${output.trim()}`)

      if (output.includes("Waiting for connections")) {
        console.log("✅ MongoDB is ready for connections!")
        resolve(true)
      }
    })

    mongodProcess.stderr.on("data", (data) => {
      const error = data.toString()
      if (error.includes("Address already in use")) {
        console.log("✅ MongoDB is already running!")
        resolve(true)
      } else {
        console.log(`⚠️ MongoDB: ${error.trim()}`)
      }
    })

    mongodProcess.on("error", (error) => {
      console.log(`❌ Failed to start MongoDB: ${error.message}`)
      reject(error)
    })

    // Keep the process running
    process.on("SIGINT", () => {
      console.log("\n🛑 Shutting down MongoDB...")
      mongodProcess.kill()
      process.exit()
    })
  })
}

async function testConnection() {
  const { MongoClient } = require("mongodb")

  try {
    console.log("🧪 Testing connection to MongoDB...")
    const client = new MongoClient("mongodb://localhost:27017", {
      serverSelectionTimeoutMS: 5000,
    })

    await client.connect()
    console.log("✅ Connected to MongoDB successfully!")

    const db = client.db("etrucktransport")
    await db.admin().ping()
    console.log("🏓 Database ping successful!")

    await client.close()
    return true
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`)
    return false
  }
}

async function main() {
  try {
    // Find MongoDB installation
    const mongodPath = findMongoDB()
    if (!mongodPath) {
      console.log("\n❌ MongoDB not found!")
      console.log("📥 Please install MongoDB from: https://www.mongodb.com/try/download/community")
      return
    }

    // Create data directory
    const dataDir = createDataDirectory()
    if (!dataDir) {
      console.log("❌ Cannot create data directory!")
      return
    }

    // Start MongoDB
    console.log("\n🚀 Starting MongoDB server...")
    await startMongoDB(mongodPath, dataDir)

    // Test connection
    setTimeout(async () => {
      const connected = await testConnection()
      if (connected) {
        console.log("\n🎉 MongoDB is running and ready!")
        console.log("🔗 Connection: mongodb://localhost:27017")
        console.log("📊 Database: etrucktransport")
        console.log("\n✅ You can now start your app:")
        console.log("   Terminal 1: npm run dev-server")
        console.log("   Terminal 2: npm run dev")
        console.log("\n⚠️  Keep this terminal open to keep MongoDB running!")
      }
    }, 3000)
  } catch (error) {
    console.error("❌ Error:", error.message)
  }
}

main()
