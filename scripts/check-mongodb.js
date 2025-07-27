// MongoDB Connection Checker with detailed diagnostics
const { MongoClient } = require("mongodb")

async function checkMongoDB() {
  console.log("🔍 Checking MongoDB connection...")
  console.log("=".repeat(50))

  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"

  try {
    console.log(`📡 Attempting to connect to: ${MONGODB_URI}`)
    console.log("⏳ Connecting...")

    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      connectTimeoutMS: 5000,
    })

    await client.connect()
    console.log("✅ MongoDB connection successful!")

    // Test ping
    const admin = client.db().admin()
    const pingResult = await admin.ping()
    console.log("🏓 Database ping successful:", pingResult)

    // List databases
    const dbs = await admin.listDatabases()
    console.log("\n📋 Available databases:")
    dbs.databases.forEach((db) => {
      console.log(`  - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`)
    })

    // Check if our database exists
    const ourDb = dbs.databases.find((db) => db.name === "etrucktransport")
    if (ourDb) {
      console.log("\n✅ etrucktransport database found!")

      // List collections
      const db = client.db("etrucktransport")
      const collections = await db.listCollections().toArray()

      if (collections.length > 0) {
        console.log("📁 Collections in etrucktransport:")
        for (const col of collections) {
          const count = await db.collection(col.name).countDocuments()
          console.log(`  - ${col.name} (${count} documents)`)
        }
      } else {
        console.log("⚠️ No collections found. Database exists but is empty.")
        console.log("💡 Run 'npm run setup-db' to create collections")
      }
    } else {
      console.log("\n⚠️ etrucktransport database not found.")
      console.log("💡 Run 'npm run setup-db' to create the database")
    }

    await client.close()
    console.log("\n🔌 Connection closed successfully")
    console.log("=".repeat(50))
    console.log("✅ MongoDB is working correctly!")
  } catch (error) {
    console.log("\n" + "=".repeat(50))
    console.error("❌ MongoDB connection failed:")
    console.error(`   Error: ${error.message}`)
    console.error(`   Code: ${error.code || "Unknown"}`)

    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n🚨 MongoDB service is not running!")
      console.log("\n💡 Start MongoDB with one of these commands:")
      console.log("   Windows: net start MongoDB")
      console.log("   macOS:   brew services start mongodb-community")
      console.log("   Linux:   sudo systemctl start mongod")
    } else if (error.message.includes("MongoServerSelectionTimeoutError")) {
      console.log("\n🚨 Cannot connect to MongoDB server!")
      console.log("\n💡 Possible solutions:")
      console.log("1. Make sure MongoDB is installed")
      console.log("2. Check if MongoDB is running on port 27017")
      console.log("3. Verify firewall settings")
    } else if (error.message.includes("authentication")) {
      console.log("\n🚨 Authentication failed!")
      console.log("💡 Check your MongoDB credentials")
    } else {
      console.log("\n🚨 Unknown MongoDB error!")
      console.log("💡 Check MongoDB logs for more details")
    }

    console.log("\n🔧 Quick diagnostic commands:")
    console.log("   Check if MongoDB is running: ps aux | grep mongod")
    console.log("   Check port 27017: netstat -tulpn | grep :27017")
    console.log("   MongoDB logs: tail -f /var/log/mongodb/mongod.log")
    console.log("=".repeat(50))
  }
}

// Also check if MongoDB is installed
function checkMongoDBInstallation() {
  const { exec } = require("child_process")

  console.log("🔍 Checking if MongoDB is installed...")

  exec("mongod --version", (error, stdout, stderr) => {
    if (error) {
      console.log("❌ MongoDB is not installed or not in PATH")
      console.log("\n📥 Install MongoDB:")
      console.log("   Windows: https://www.mongodb.com/try/download/community")
      console.log("   macOS:   brew install mongodb-community")
      console.log("   Linux:   sudo apt-get install mongodb-org")
    } else {
      console.log("✅ MongoDB is installed:")
      console.log(stdout.split("\n")[0])
    }

    // Now check connection
    checkMongoDB()
  })
}

checkMongoDBInstallation()
