const { exec } = require("child_process")
const { MongoClient } = require("mongodb")

async function checkMongoDBStatus() {
  console.log("🔍 Checking MongoDB status...")

  try {
    // Try to connect to MongoDB
    const client = new MongoClient("mongodb://localhost:27017", {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    })

    await client.connect()
    console.log("✅ MongoDB is running and accessible")

    // Test database operations
    const db = client.db("etrucktransport")
    await db.admin().ping()
    console.log("🏓 Database ping successful")

    await client.close()
    return true
  } catch (error) {
    console.log("❌ MongoDB is not running or not accessible")
    console.log("Error:", error.message)
    return false
  }
}

async function testConnection() {
  console.log("🧪 Testing MongoDB connection...")

  try {
    const client = new MongoClient("mongodb://localhost:27017")
    await client.connect()

    const db = client.db("etrucktransport")

    // Test basic operations
    const testCollection = db.collection("test")
    await testCollection.insertOne({ test: true, timestamp: new Date() })
    const testDoc = await testCollection.findOne({ test: true })
    await testCollection.deleteOne({ test: true })

    console.log("✅ Database operations test passed")
    console.log("📊 Test document:", testDoc)

    await client.close()
    return true
  } catch (error) {
    console.log("❌ Connection test failed:", error.message)
    return false
  }
}

async function setupDataDirectory() {
  const fs = require("fs")
  const path = require("path")

  const dataDir = path.join(process.cwd(), "data", "db")

  if (!fs.existsSync(dataDir)) {
    console.log("📁 Creating MongoDB data directory...")
    fs.mkdirSync(dataDir, { recursive: true })
    console.log("✅ Data directory created:", dataDir)
  } else {
    console.log("✅ Data directory exists:", dataDir)
  }
}

async function main() {
  try {
    console.log("🚀 MongoDB Connection Checker")
    console.log("=============================")

    // Setup data directory
    await setupDataDirectory()

    // Check if MongoDB is already running
    const isRunning = await checkMongoDBStatus()

    if (isRunning) {
      console.log("🎉 MongoDB is running successfully!")

      // Test connection
      const testPassed = await testConnection()

      if (testPassed) {
        console.log("\n✅ MongoDB Setup Complete!")
        console.log("🔗 Connection URL: mongodb://localhost:27017")
        console.log("📊 Database: etrucktransport")
        console.log("🚀 You can now start your server: npm run dev-server")
      }
    } else {
      console.log("❌ MongoDB is not accessible")
      console.log("\n🔧 Quick Fix Options:")
      console.log("=====================")
      console.log("1. Run: node scripts/start-mongodb-windows.js")
      console.log("2. Or manually: mongod --dbpath ./data/db")
      console.log("3. Or start service: net start MongoDB (as Administrator)")
      console.log("4. Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas")
    }
  } catch (error) {
    console.error("❌ Error:", error.message)
  }
}

main()
