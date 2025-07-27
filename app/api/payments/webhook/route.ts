import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import crypto from "crypto"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/etrucktransport"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get("verif-hash")

    // Verify webhook signature
    const secretHash = process.env.FLUTTERWAVE_SECRET_KEY
    const hash = crypto.createHmac("sha256", secretHash!).update(JSON.stringify(body)).digest("hex")

    if (hash !== signature) {
      console.error("Invalid webhook signature")
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 })
    }

    console.log("Flutterwave webhook received:", body)

    // Process webhook data
    if (body.event === "charge.completed" && body.data.status === "successful") {
      const { tx_ref, id, amount, currency, customer } = body.data

      // Connect to MongoDB
      const client = new MongoClient(MONGODB_URI)
      await client.connect()
      const db = client.db("etrucktransport")

      // Update payment status
      const paymentUpdate = await db.collection("payments").updateOne(
        { transactionId: tx_ref },
        {
          $set: {
            status: "completed",
            flutterwaveRef: id,
            paymentData: body.data,
            updatedAt: new Date(),
          },
        },
      )

      console.log("Payment updated via webhook:", paymentUpdate)

      // If E-Card payment, update driver status
      const payment = await db.collection("payments").findOne({ transactionId: tx_ref })
      if (payment && payment.type === "ecard") {
        await db.collection("drivers").updateOne(
          { userId: payment.userId },
          {
            $set: {
              eCardStatus: "active",
              eCardIssueDate: new Date(),
            },
          },
        )
        console.log("Driver E-Card status updated via webhook")
      }

      await client.close()

      return NextResponse.json({ success: true, message: "Webhook processed successfully" })
    }

    return NextResponse.json({ success: true, message: "Webhook received" })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Webhook processing failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
