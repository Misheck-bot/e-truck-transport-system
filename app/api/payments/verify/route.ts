import { type NextRequest, NextResponse } from "next/server"
import Flutterwave from "flutterwave-node-v3"
import { MongoClient } from "mongodb"

const flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY!, process.env.FLUTTERWAVE_SECRET_KEY!)

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/etrucktransport"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transaction_id, tx_ref } = body

    console.log("Verifying payment:", { transaction_id, tx_ref })

    // Verify payment with Flutterwave
    const response = await flw.Transaction.verify({ id: transaction_id })

    if (response.status === "success" && response.data.status === "successful") {
      // Connect to MongoDB
      const client = new MongoClient(MONGODB_URI)
      await client.connect()
      const db = client.db("etrucktransport")

      // Update payment status in database
      const paymentUpdate = await db.collection("payments").updateOne(
        { transactionId: tx_ref },
        {
          $set: {
            status: "completed",
            flutterwaveRef: transaction_id,
            paymentData: response.data,
            updatedAt: new Date(),
          },
        },
      )

      console.log("Payment updated in database:", paymentUpdate)

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
        console.log("Driver E-Card status updated")
      }

      await client.close()

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        data: response.data,
      })
    } else {
      console.error("Payment verification failed:", response)
      return NextResponse.json(
        { success: false, message: "Payment verification failed", data: response.data },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
