const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const app = express()
const PORT = process.env.PORT || 5000

// Load environment variables
require("dotenv").config({ path: ".env.local" })

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection with better error handling
const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...")
    console.log("📍 MongoDB URI:", process.env.MONGODB_URI || "mongodb+srv://e-truck:Password12345@e-system.qa9mndw.mongodb.net/e-truck-system")

    const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://e-truck:Password12345@e-system.qa9mndw.mongodb.net/e-truck-system", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      connectTimeoutMS: 10000, // 10 second timeout
    })

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    console.log(`📊 Database: ${conn.connection.name}`)

    // Test the connection
    await mongoose.connection.db.admin().ping()
    console.log("🏓 MongoDB ping successful")
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message)
    console.log("\n🚨 MongoDB Connection Troubleshooting:")
    console.log("1. Make sure MongoDB is installed and running")
    console.log("2. Check if MongoDB service is started:")
    console.log("   - Windows: net start MongoDB")
    console.log("   - macOS: brew services start mongodb-community")
    console.log("   - Linux: sudo systemctl start mongod")
    console.log("3. Verify MongoDB is listening on port 27017")
    console.log("4. Run: node scripts/check-and-start-mongodb.js")
    console.log('\n💡 Quick fix: Run "mongod" in a separate terminal')

    process.exit(1)
  }
}

// Connect to database with retry logic
const connectWithRetry = async () => {
  const maxRetries = 5
  let retries = 0

  while (retries < maxRetries) {
    try {
      await connectDB()
      break
    } catch (error) {
      retries++
      console.log(`🔄 Retry ${retries}/${maxRetries} in 3 seconds...`)

      if (retries === maxRetries) {
        console.log("❌ Max retries reached. Exiting...")
        process.exit(1)
      }

      await new Promise((resolve) => setTimeout(resolve, 3000))
    }
  }
}

// Start connection
connectWithRetry()

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ["driver", "border-agent", "admin"], default: "driver" },
  phone: { type: String, required: true },
  dateOfBirth: Date,
  address: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Driver Schema
const driverSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  licenseNumber: { type: String, required: true, unique: true },
  licenseExpiry: { type: Date, required: true },
  company: String,
  experience: String,
  emergencyContact: String,
  emergencyPhone: String,
  eCardId: String,
  eCardStatus: { type: String, enum: ["active", "expired", "pending"], default: "pending" },
  eCardIssueDate: Date,
  createdAt: { type: Date, default: Date.now },
})

// Truck Schema
const truckSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },
  plateNumber: { type: String, required: true, unique: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true, min: 1990, max: 2025 },
  engineNumber: { type: String, required: true },
  chassisNumber: { type: String, required: true },
  color: String,
  fuelType: String,
  grossWeight: Number,
  netWeight: Number,
  dimensions: String,
  insuranceCompany: String,
  insurancePolicy: String,
  insuranceExpiry: Date,
  registrationExpiry: Date,
  roadTaxExpiry: Date,
  purpose: String,
  notes: String,
  registrationValid: { type: Boolean, default: true },
  insuranceValid: { type: Boolean, default: true },
  roadTaxPaid: { type: Boolean, default: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdAt: { type: Date, default: Date.now },
})

// Payment Schema
const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["road-tax", "insurance", "ecard", "license-renewal"], required: true },
  amount: { type: Number, required: true, min: 0 },
  method: { type: String, enum: ["mtn", "airtel", "zamtel", "visa"], required: true },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  transactionId: String,
  phoneNumber: String,
  flutterwaveRef: String,
  paymentData: Object,
  createdAt: { type: Date, default: Date.now },
})

// Border Crossing Schema
const borderCrossingSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  truckPlate: String,
  goods: [
    {
      item: String,
      quantity: String,
      weight: String,
    },
  ],
  status: { type: String, enum: ["approved", "rejected", "pending"], default: "pending" },
  crossingTime: { type: Date, default: Date.now },
})

// Border Agent Schema
const borderAgentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  employeeId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  borderPost: { type: String, required: true },
  supervisor: String,
  supervisorPhone: String,
  securityClearance: String,
  startDate: Date,
  createdAt: { type: Date, default: Date.now },
})

// System Admin Schema
const systemAdminSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  employeeId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  ministry: { type: String, required: true },
  position: String,
  supervisor: String,
  supervisorPhone: String,
  accessLevel: String,
  startDate: Date,
  createdAt: { type: Date, default: Date.now },
})

// Create Models
const User = mongoose.model("User", userSchema)
const Driver = mongoose.model("Driver", driverSchema)
const Truck = mongoose.model("Truck", truckSchema)
const Payment = mongoose.model("Payment", paymentSchema)
const BorderCrossing = mongoose.model("BorderCrossing", borderCrossingSchema)
const BorderAgent = mongoose.model("BorderAgent", borderAgentSchema)
const SystemAdmin = mongoose.model("SystemAdmin", systemAdminSchema)

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Access token required" })
  }

  jwt.verify(token, process.env.JWT_SECRET || "your-secret-key", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" })
    }
    req.user = user
    next()
  })
}

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    console.log("📝 Registration request received:", req.body)
    const { fullName, email, password, role, phone, dateOfBirth, address, ...roleSpecificData } = req.body

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = new User({
      name: fullName,
      email,
      password: hashedPassword,
      role,
      phone,
      dateOfBirth,
      address,
    })

    await user.save()
    console.log("✅ User created successfully:", user._id)

    // Create role-specific profile
    if (role === "driver") {
      const driver = new Driver({
        userId: user._id,
        licenseNumber: roleSpecificData.licenseNumber || "PENDING",
        licenseExpiry: roleSpecificData.licenseExpiry ? new Date(roleSpecificData.licenseExpiry) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default to 1 year from now
        company: roleSpecificData.company || "",
        experience: roleSpecificData.experience || "",
        emergencyContact: roleSpecificData.emergencyContact || "",
        emergencyPhone: roleSpecificData.emergencyPhone || "",
      })
      await driver.save()
      console.log("✅ Driver profile created successfully")
    } else if (role === "border-agent") {
      const agent = new BorderAgent({
        userId: user._id,
        employeeId: roleSpecificData.employeeId,
        department: roleSpecificData.department,
        borderPost: roleSpecificData.borderPost,
        supervisor: roleSpecificData.supervisor,
        supervisorPhone: roleSpecificData.supervisorPhone,
        securityClearance: roleSpecificData.securityClearance,
        startDate: new Date(roleSpecificData.startDate),
      })
      await agent.save()
    } else if (role === "admin") {
      const admin = new SystemAdmin({
        userId: user._id,
        employeeId: roleSpecificData.employeeId,
        department: roleSpecificData.department,
        ministry: roleSpecificData.ministry,
        position: roleSpecificData.position,
        supervisor: roleSpecificData.supervisor,
        supervisorPhone: roleSpecificData.supervisorPhone,
        accessLevel: roleSpecificData.accessLevel,
        startDate: new Date(roleSpecificData.startDate),
      })
      await admin.save()
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "7d",
    })

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    })
  } catch (error) {
    console.error("❌ Registration error:", error)
    console.error("❌ Error details:", error.message)
    console.error("❌ Error stack:", error.stack)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "7d",
    })

    // Get role-specific data
    let roleData = {}
    if (user.role === "driver") {
      roleData = await Driver.findOne({ userId: user._id })
    } else if (user.role === "border-agent") {
      roleData = await BorderAgent.findOne({ userId: user._id })
    } else if (user.role === "admin") {
      roleData = await SystemAdmin.findOne({ userId: user._id })
    }

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        ...roleData?._doc,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Driver Routes
app.post("/api/trucks", authenticateToken, async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.userId })
    if (!driver) {
      return res.status(404).json({ message: "Driver profile not found" })
    }

    const truck = new Truck({
      driverId: driver._id,
      ...req.body,
      registrationValid: new Date(req.body.registrationExpiry) > new Date(),
      insuranceValid: new Date(req.body.insuranceExpiry) > new Date(),
      roadTaxPaid: new Date(req.body.roadTaxExpiry) > new Date(),
    })

    await truck.save()

    res.status(201).json({ message: "Truck registered successfully", truck })
  } catch (error) {
    console.error("Truck registration error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

app.get("/api/driver/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    const driver = await Driver.findOne({ userId: req.user.userId })
    const trucks = await Truck.find({ driverId: driver._id })
    const payments = await Payment.find({ userId: req.user.userId }).sort({ createdAt: -1 })

    res.json({
      ...user._doc,
      ...driver._doc,
      trucks,
      payments,
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Payment Routes
app.post("/api/payments", authenticateToken, async (req, res) => {
  try {
    const { type, amount, method, phoneNumber } = req.body

    const payment = new Payment({
      userId: req.user.userId,
      type,
      amount,
      method,
      phoneNumber,
      transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
    })

    await payment.save()

    // Simulate payment processing
    setTimeout(async () => {
      const success = Math.random() > 0.2 // 80% success rate
      payment.status = success ? "completed" : "failed"
      await payment.save()

      // If E-Card payment is successful, update driver status
      if (success && type === "ecard") {
        await Driver.findOneAndUpdate(
          { userId: req.user.userId },
          {
            eCardStatus: "active",
            eCardIssueDate: new Date(),
          },
        )
      }
    }, 2000)

    res.status(201).json({ message: "Payment initiated", payment })
  } catch (error) {
    console.error("Payment error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

app.get("/api/payments", authenticateToken, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.userId }).sort({ createdAt: -1 })
    res.json(payments)
  } catch (error) {
    console.error("Payments fetch error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Payment Analytics Routes
app.get("/api/admin/payment-analytics", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" })
    }

    const { startDate, endDate, status, method, type } = req.query

    // Build filter
    const filter = {}
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }
    if (status) filter.status = status
    if (method) filter.method = method
    if (type) filter.type = type

    // Get analytics data
    const totalRevenue = await Payment.aggregate([
      { $match: { ...filter, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])

    const totalTransactions = await Payment.countDocuments(filter)
    const successfulTransactions = await Payment.countDocuments({ ...filter, status: "completed" })
    const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0

    // Revenue by method
    const revenueByMethod = await Payment.aggregate([
      { $match: { ...filter, status: "completed" } },
      { $group: { _id: "$method", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ])

    // Revenue by type
    const revenueByType = await Payment.aggregate([
      { $match: { ...filter, status: "completed" } },
      { $group: { _id: "$type", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ])

    // Daily revenue trend (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dailyRevenue = await Payment.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$amount" },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    // Top customers
    const topCustomers = await Payment.aggregate([
      { $match: { ...filter, status: "completed" } },
      { $group: { _id: "$userId", totalSpent: { $sum: "$amount" }, transactions: { $sum: 1 } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
    ])

    res.json({
      summary: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalTransactions,
        successfulTransactions,
        successRate: Math.round(successRate * 100) / 100,
      },
      revenueByMethod,
      revenueByType,
      dailyRevenue,
      topCustomers,
    })
  } catch (error) {
    console.error("Payment analytics error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Real-time payment monitoring
app.get("/api/admin/recent-payments", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" })
    }

    const recentPayments = await Payment.find().populate("userId", "name email").sort({ createdAt: -1 }).limit(20)

    res.json(recentPayments)
  } catch (error) {
    console.error("Recent payments error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Border Crossing Routes
app.post("/api/border-crossings", authenticateToken, async (req, res) => {
  try {
    const { driverId, truckPlate, goods } = req.body

    const crossing = new BorderCrossing({
      driverId,
      agentId: req.user.userId,
      truckPlate,
      goods,
    })

    await crossing.save()

    res.status(201).json({ message: "Border crossing recorded", crossing })
  } catch (error) {
    console.error("Border crossing error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

app.get("/api/border-crossings", authenticateToken, async (req, res) => {
  try {
    const crossings = await BorderCrossing.find().populate("driverId").populate("agentId").sort({ crossingTime: -1 })

    res.json(crossings)
  } catch (error) {
    console.error("Border crossings fetch error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Admin Routes
app.get("/api/admin/stats", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" })
    }

    const totalDrivers = await Driver.countDocuments()
    const totalPayments = await Payment.countDocuments()
    const pendingPayments = await Payment.countDocuments({ status: "pending" })
    const totalRevenue = await Payment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])

    res.json({
      totalDrivers,
      totalPayments,
      pendingPayments,
      totalRevenue: totalRevenue[0]?.total || 0,
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Health check endpoint with detailed MongoDB status
app.get("/api/health", async (req, res) => {
  try {
    // Test database connection
    await mongoose.connection.db.admin().ping()

    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      database: {
        status: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name,
      },
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
      },
    })
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      database: {
        status: "Error",
        error: error.message,
      },
    })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error)
  res.status(500).json({ message: "Internal server error" })
})

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...")
  await mongoose.connection.close()
  console.log("📴 MongoDB connection closed")
  process.exit(0)
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`)
})
