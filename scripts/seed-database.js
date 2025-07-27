// Database Seeding Script
// Run this to add sample data for testing

const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

const MONGODB_URL = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DATABASE_NAME = "etrucktransport"

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URL)

  try {
    await client.connect()
    console.log("✅ Connected to MongoDB for seeding")

    const db = client.db(DATABASE_NAME)

    // Clear existing data (optional - remove in production)
    // await db.collection('users').deleteMany({});
    // await db.collection('drivers').deleteMany({});
    // await db.collection('trucks').deleteMany({});
    // console.log('🗑️ Cleared existing data');

    // Hash passwords
    const hashedDriverPassword = await bcrypt.hash("driver123", 10)
    const hashedAgentPassword = await bcrypt.hash("agent123", 10)
    const hashedAdminPassword = await bcrypt.hash("admin123", 10)

    // Sample Users
    const users = [
      {
        name: "John Mwanza",
        email: "john.driver@example.com",
        password: hashedDriverPassword,
        role: "driver",
        phone: "+260977123456",
        dateOfBirth: new Date("1985-05-15"),
        address: "Plot 123, Lusaka, Zambia",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Sarah Banda",
        email: "sarah.agent@border.gov.zm",
        password: hashedAgentPassword,
        role: "border-agent",
        phone: "+260977234567",
        dateOfBirth: new Date("1990-08-20"),
        address: "Chirundu Border Post, Zambia",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Michael Phiri",
        email: "michael.admin@transport.gov.zm",
        password: hashedAdminPassword,
        role: "admin",
        phone: "+260977345678",
        dateOfBirth: new Date("1980-12-10"),
        address: "Ministry of Transport, Lusaka",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const userResults = await db.collection("users").insertMany(users)
    console.log("✅ Sample users created")

    // Sample Driver Profile
    const driverProfile = {
      userId: userResults.insertedIds[0],
      licenseNumber: "DL12345678",
      licenseExpiry: new Date("2025-12-31"),
      company: "Swift Transport Ltd",
      experience: "5-10",
      emergencyContact: "Mary Mwanza",
      emergencyPhone: "+260977111222",
      eCardStatus: "active",
      eCardIssueDate: new Date(),
      createdAt: new Date(),
    }

    const driverResult = await db.collection("drivers").insertOne(driverProfile)
    console.log("✅ Sample driver profile created")

    // Sample Truck
    const truck = {
      driverId: driverResult.insertedId,
      plateNumber: "ABC123ZM",
      make: "Volvo",
      model: "FH16",
      year: 2020,
      engineNumber: "VLV123456789",
      chassisNumber: "1HGBH41JXMN109186",
      color: "White",
      fuelType: "diesel",
      grossWeight: 40000,
      netWeight: 15000,
      dimensions: "12m x 2.5m x 4m",
      insuranceCompany: "ZSIC",
      insurancePolicy: "POL123456",
      insuranceExpiry: new Date("2025-06-30"),
      registrationExpiry: new Date("2025-03-31"),
      roadTaxExpiry: new Date("2025-12-31"),
      purpose: "freight",
      notes: "Regular cross-border freight transport",
      registrationValid: true,
      insuranceValid: true,
      roadTaxPaid: true,
      status: "active",
      createdAt: new Date(),
    }

    await db.collection("trucks").insertOne(truck)
    console.log("✅ Sample truck created")

    // Sample Border Agent Profile
    const agentProfile = {
      userId: userResults.insertedIds[1],
      employeeId: "EMP123456",
      department: "Border Control",
      borderPost: "Chirundu Border",
      supervisor: "James Tembo",
      supervisorPhone: "+260977555666",
      securityClearance: "level-2",
      startDate: new Date("2020-01-15"),
      createdAt: new Date(),
    }

    await db.collection("borderagents").insertOne(agentProfile)
    console.log("✅ Sample border agent profile created")

    // Sample System Admin Profile
    const adminProfile = {
      userId: userResults.insertedIds[2],
      employeeId: "MOT123456",
      department: "IT Department",
      ministry: "Ministry of Transport & Safety",
      position: "Senior System Administrator",
      supervisor: "Director IT",
      supervisorPhone: "+260977777888",
      accessLevel: "full",
      startDate: new Date("2018-03-01"),
      createdAt: new Date(),
    }

    await db.collection("systemadmins").insertOne(adminProfile)
    console.log("✅ Sample system admin profile created")

    // Sample Payments
    const payments = [
      {
        userId: userResults.insertedIds[0],
        type: "ecard",
        amount: 500,
        method: "mtn",
        status: "completed",
        transactionId: "TXN1234567890",
        phoneNumber: "+260977123456",
        createdAt: new Date(),
      },
      {
        userId: userResults.insertedIds[0],
        type: "road-tax",
        amount: 1200,
        method: "airtel",
        status: "completed",
        transactionId: "TXN0987654321",
        phoneNumber: "+260977123456",
        createdAt: new Date(),
      },
    ]

    await db.collection("payments").insertMany(payments)
    console.log("✅ Sample payments created")

    console.log("🎉 Database seeding completed successfully!")
    console.log("\n📋 Sample Login Credentials:")
    console.log("Driver: john.driver@example.com / driver123")
    console.log("Border Agent: sarah.agent@border.gov.zm / agent123")
    console.log("Admin: michael.admin@transport.gov.zm / admin123")
  } catch (error) {
    console.error("❌ Database seeding failed:", error)
  } finally {
    await client.close()
  }
}

seedDatabase()
