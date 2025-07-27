// Simple test server to verify everything is working
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "E-Truck Transport API is running!",
    timestamp: new Date().toISOString(),
    status: "OK",
  })
})

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    server: "Running",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    port: PORT,
  })
})

// MongoDB connection test
app.get("/api/test-db", async (req, res) => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/etrucktransport"

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI)
      console.log("✅ Connected to MongoDB")
    }

    // Test database connection
    const admin = mongoose.connection.db.admin()
    const result = await admin.ping()

    res.json({
      status: "Database Connected",
      connection: "Success",
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      ping: result,
    })
  } catch (error) {
    res.status(500).json({
      status: "Database Error",
      error: error.message,
      suggestion: "Make sure MongoDB is running on your system",
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🗄️ Database test: http://localhost:${PORT}/api/test-db`)
  console.log(`🏠 Home: http://localhost:${PORT}`)
})
