const { MongoClient } = require("mongodb")

class MongoDBConnection {
  constructor() {
    this.client = null
    this.db = null
    this.isConnected = false
  }

  async connect(retries = 5) {
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/etrucktransport"

    for (let i = 0; i < retries; i++) {
      try {
        console.log(`🔄 Attempting to connect to MongoDB (attempt ${i + 1}/${retries})...`)

        this.client = new MongoClient(MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000, // 5 second timeout
          connectTimeoutMS: 10000, // 10 second timeout
        })

        await this.client.connect()

        // Test the connection
        await this.client.db().admin().ping()

        this.db = this.client.db()
        this.isConnected = true

        console.log("✅ MongoDB connected successfully")
        return this.db
      } catch (error) {
        console.log(`❌ Connection attempt ${i + 1} failed:`, error.message)

        if (i === retries - 1) {
          console.log("\n🚨 All connection attempts failed!")
          console.log("📋 Troubleshooting steps:")
          console.log("1. Make sure MongoDB is installed and running")
          console.log("2. Check if port 27017 is available")
          console.log("3. Run: node scripts/check-and-start-mongodb.js")
          throw error
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close()
      this.isConnected = false
      console.log("📴 MongoDB disconnected")
    }
  }

  getDb() {
    if (!this.isConnected || !this.db) {
      throw new Error("MongoDB not connected. Call connect() first.")
    }
    return this.db
  }

  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { status: "disconnected", message: "Not connected to MongoDB" }
      }

      await this.client.db().admin().ping()
      return { status: "connected", message: "MongoDB is healthy" }
    } catch (error) {
      return { status: "error", message: error.message }
    }
  }
}

// Create singleton instance
const mongoConnection = new MongoDBConnection()

module.exports = mongoConnection
