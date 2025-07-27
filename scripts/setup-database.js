// MongoDB Database Setup Script
// Run this script to create the database and collections

const { MongoClient } = require("mongodb")
require("dotenv").config({ path: ".env.local" })

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/etrucktransport"

async function setupDatabase() {
  console.log("🚀 Setting up E-Truck Transport Database")
  console.log("=======================================")

  try {
    // Connect to MongoDB
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db("etrucktransport")

    // Create collections with validation
    console.log("📋 Creating collections...")

    // Users collection
    try {
      await db.createCollection("users", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["name", "email", "password", "role", "phone"],
            properties: {
              name: { bsonType: "string" },
              email: { bsonType: "string" },
              password: { bsonType: "string" },
              role: { enum: ["driver", "border-agent", "admin"] },
              phone: { bsonType: "string" },
              address: { bsonType: "string" },
              createdAt: { bsonType: "date" },
              updatedAt: { bsonType: "date" },
            },
          },
        },
      })
      console.log("✅ Users collection created")
    } catch (error) {
      if (error.code === 48) {
        console.log("ℹ️ Users collection already exists")
      } else {
        throw error
      }
    }

    // Drivers collection
    try {
      await db.createCollection("drivers", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["userId", "licenseNumber", "licenseExpiry"],
            properties: {
              userId: { bsonType: "objectId" },
              licenseNumber: { bsonType: "string", pattern: "^DL\\d{8,9}$" },
              licenseExpiry: { bsonType: "date" },
              company: { bsonType: "string" },
              phone: { bsonType: "string" },
              eCardId: { bsonType: "string" },
              eCardStatus: { enum: ["active", "expired", "pending"] },
              trucks: { bsonType: "array" },
              createdAt: { bsonType: "date" },
            },
          },
        },
      })
      console.log("✅ Drivers collection created")
    } catch (error) {
      if (error.code === 48) {
        console.log("ℹ️ Drivers collection already exists")
      }
    }

    // Trucks collection
    try {
      await db.createCollection("trucks", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["driverId", "plateNumber", "make", "model", "year"],
            properties: {
              driverId: { bsonType: "objectId" },
              plateNumber: { bsonType: "string" },
              make: { bsonType: "string" },
              model: { bsonType: "string" },
              year: { bsonType: "int", minimum: 1990, maximum: 2025 },
              engineNumber: { bsonType: "string" },
              chassisNumber: { bsonType: "string" },
              registrationValid: { bsonType: "bool" },
              insuranceValid: { bsonType: "bool" },
              roadTaxPaid: { bsonType: "bool" },
              createdAt: { bsonType: "date" },
            },
          },
        },
      })
      console.log("✅ Trucks collection created")
    } catch (error) {
      if (error.code === 48) {
        console.log("ℹ️ Trucks collection already exists")
      }
    }

    // Payments collection
    try {
      await db.createCollection("payments", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["userId", "type", "amount", "method"],
            properties: {
              userId: { bsonType: "objectId" },
              type: { enum: ["road-tax", "insurance", "ecard", "license-renewal"] },
              amount: { bsonType: "double", minimum: 0 },
              method: { enum: ["mtn", "airtel", "zamtel", "visa"] },
              status: { enum: ["pending", "completed", "failed"] },
              transactionId: { bsonType: "string" },
              createdAt: { bsonType: "date" },
            },
          },
        },
      })
      console.log("✅ Payments collection created")
    } catch (error) {
      if (error.code === 48) {
        console.log("ℹ️ Payments collection already exists")
      }
    }

    // Border crossings collection
    try {
      await db.createCollection("bordercrossings", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["driverId", "agentId", "truckPlate"],
            properties: {
              driverId: { bsonType: "objectId" },
              agentId: { bsonType: "objectId" },
              truckPlate: { bsonType: "string" },
              goods: { bsonType: "array" },
              status: { enum: ["approved", "rejected", "pending"] },
              crossingTime: { bsonType: "date" },
            },
          },
        },
      })
      console.log("✅ Border Crossings collection created")
    } catch (error) {
      if (error.code === 48) {
        console.log("ℹ️ Border Crossings collection already exists")
      }
    }

    // Border agents collection
    try {
      await db.createCollection("borderagents", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["userId", "employeeId", "department", "borderPost"],
            properties: {
              userId: { bsonType: "objectId" },
              employeeId: { bsonType: "string", pattern: "^EMP\\d{6}$" },
              department: { bsonType: "string" },
              borderPost: { bsonType: "string" },
              securityClearance: { bsonType: "string" },
              createdAt: { bsonType: "date" },
            },
          },
        },
      })
      console.log("✅ Border Agents collection created")
    } catch (error) {
      if (error.code === 48) {
        console.log("ℹ️ Border Agents collection already exists")
      }
    }

    // System admins collection
    try {
      await db.createCollection("systemadmins", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["userId", "employeeId", "department", "ministry"],
            properties: {
              userId: { bsonType: "objectId" },
              employeeId: { bsonType: "string", pattern: "^MOT\\d{6}$" },
              department: { bsonType: "string" },
              ministry: { bsonType: "string" },
              accessLevel: { bsonType: "string" },
              position: { bsonType: "string" },
              startDate: { bsonType: "date" },
              createdAt: { bsonType: "date" },
            },
          },
        },
      })
      console.log("✅ System Admins collection created")
    } catch (error) {
      if (error.code === 48) {
        console.log("ℹ️ System Admins collection already exists")
      }
    }

    // Create indexes for better performance
    console.log("🔍 Creating indexes...")

    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("drivers").createIndex({ licenseNumber: 1 }, { unique: true })
    await db.collection("trucks").createIndex({ plateNumber: 1 }, { unique: true })
    await db.collection("payments").createIndex({ userId: 1 })
    await db.collection("payments").createIndex({ status: 1 })
    await db.collection("payments").createIndex({ createdAt: -1 })
    await db.collection("bordercrossings").createIndex({ driverId: 1 })
    await db.collection("bordercrossings").createIndex({ crossingTime: -1 })
    await db.collection("borderagents").createIndex({ employeeId: 1 }, { unique: true })
    await db.collection("systemadmins").createIndex({ employeeId: 1 }, { unique: true })

    console.log("✅ Indexes created")

    // Insert sample admin user if none exists
    const adminExists = await db.collection("users").findOne({ role: "admin" })
    if (!adminExists) {
      console.log("👤 Creating default admin user...")

      const bcrypt = require("bcryptjs")
      const hashedPassword = await bcrypt.hash("admin123", 10)

      const adminUser = {
        name: "System Administrator",
        email: "admin@etrucktransport.com",
        password: hashedPassword,
        role: "admin",
        phone: "+260123456789",
        address: "Lusaka, Zambia",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await db.collection("users").insertOne(adminUser)
      console.log("✅ Default admin user created:", result.insertedId)

      // Create admin profile
      const adminProfile = {
        userId: result.insertedId,
        employeeId: "ADMIN001",
        department: "Information Technology",
        ministry: "Ministry of Transport",
        position: "System Administrator",
        accessLevel: "full",
        startDate: new Date(),
        createdAt: new Date(),
      }

      await db.collection("systemadmins").insertOne(adminProfile)
      console.log("✅ Admin profile created")

      console.log("\n🔑 Default Admin Credentials:")
      console.log("Email: admin@etrucktransport.com")
      console.log("Password: admin123")
      console.log("⚠️ Please change this password after first login!")
    }

    // Show database statistics
    const stats = await db.stats()
    console.log("\n📊 Database Statistics:")
    console.log(`Database: ${stats.db}`)
    console.log(`Collections: ${stats.collections}`)
    console.log(`Data Size: ${(stats.dataSize / 1024).toFixed(2)} KB`)

    await client.close()
    console.log("\n🎉 Database setup completed successfully!")
    console.log("🚀 You can now start your server: npm run dev-server")
  } catch (error) {
    console.error("❌ Database setup failed:", error.message)
    process.exit(1)
  }
}

setupDatabase()
