// MongoDB Auto-Fix Script
const { exec } = require("child_process")
const { MongoClient } = require("mongodb")

async function fixMongoDB() {
  console.log("🔧 MongoDB Auto-Fix Starting...")
  console.log("=".repeat(50))

  // Step 1: Check if MongoDB is installed
  console.log("Step 1: Checking MongoDB installation...")

  try {
    await new Promise((resolve, reject) => {
      exec("mongod --version", (error, stdout, stderr) => {
        if (error) {
          console.log("❌ MongoDB not found in PATH")
          console.log("💡 Please install MongoDB first:")
          console.log("   Run: node scripts/install-mongodb.js")
          reject(new Error("MongoDB not installed"))
        } else {
          console.log("✅ MongoDB is installed")
          resolve()
        }
      })
    })
  } catch (error) {
    return
  }

  // Step 2: Try to start MongoDB service
  console.log("\nStep 2: Starting MongoDB service...")

  const os = require("os").platform()
  let startCommand

  switch (os) {
    case "win32":
      startCommand = "net start MongoDB"
      break
    case "darwin":
      startCommand = "brew services start mongodb-community"
      break
    case "linux":
      startCommand = "sudo systemctl start mongod"
      break
    default:
      console.log("❓ Unknown OS, please start MongoDB manually")
      return
  }

  try {
    await new Promise((resolve, reject) => {
      exec(startCommand, (error, stdout, stderr) => {
        if (error) {
          console.log("⚠️ Could not start MongoDB service automatically")
          console.log(`💡 Please run manually: ${startCommand}`)
        } else {
          console.log("✅ MongoDB service started")
        }
        resolve() // Continue even if service start failed
      })
    })
  } catch (error) {
    // Continue anyway
  }

  // Step 3: Wait a moment for service to start
  console.log("\nStep 3: Waiting for MongoDB to start...")
  await new Promise((resolve) => setTimeout(resolve, 3000))

  // Step 4: Test connection
  console.log("\nStep 4: Testing MongoDB connection...")

  try {
    const client = new MongoClient("mongodb://localhost:27017", {
      serverSelectionTimeoutMS: 5000,
    })

    await client.connect()
    console.log("✅ MongoDB connection successful!")

    // Step 5: Check if database exists
    console.log("\nStep 5: Checking database...")
    const admin = client.db().admin()
    const dbs = await admin.listDatabases()
    const ourDb = dbs.databases.find((db) => db.name === "etrucktransport")

    if (!ourDb) {
      console.log("⚠️ Database 'etrucktransport' not found")
      console.log("💡 Creating database...")

      // Create a simple collection to initialize the database
      const db = client.db("etrucktransport")
      await db.createCollection("_init")
      await db.collection("_init").insertOne({ created: new Date() })

      console.log("✅ Database created")
    } else {
      console.log("✅ Database 'etrucktransport' exists")
    }

    await client.close()

    console.log("\n" + "=".repeat(50))
    console.log("🎉 MongoDB is now working!")
    console.log("💡 Next steps:")
    console.log("   1. Run: npm run setup-db")
    console.log("   2. Run: npm run seed-db")
    console.log("   3. Run: npm run dev-server")
    console.log("=".repeat(50))
  } catch (error) {
    console.log("\n❌ Still cannot connect to MongoDB")
    console.log(`Error: ${error.message}`)
    console.log("\n🔧 Manual troubleshooting needed:")
    console.log("1. Check if MongoDB is actually running:")
    console.log("   ps aux | grep mongod")
    console.log("2. Check if port 27017 is open:")
    console.log("   netstat -tulpn | grep :27017")
    console.log("3. Check MongoDB logs for errors")
    console.log("4. Try restarting your computer")
  }
}

fixMongoDB()
