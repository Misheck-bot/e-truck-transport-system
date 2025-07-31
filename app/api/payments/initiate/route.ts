// app/api/payments/initiate/route.ts
export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import Flutterwave from "flutterwave-node-v3"

const flw = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY!,
  process.env.FLUTTERWAVE_SECRET_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency = "ZMW", email, phone, name, type, method } = body

    // Generate unique transaction reference
    const tx_ref = `etruck_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

    const payload = {
      tx_ref,
      amount: Number(amount),
      currency,
      redirect_url: process.env.PAYMENT_SUCCESS_URL || "http://localhost:3000/payment/success",
      customer: {
        email,
        phonenumber: phone,
        name,
      },
      customizations: {
        title: "E-Truck Transport Payment",
        description: `Payment for ${type}`,
        logo: "https://your-logo-url.com/logo.png", // Replace with your logo URL
      },
      meta: {
        payment_type: type,
        payment_method: method,
      },
    }

    console.log("Initiating Flutterwave payment with payload:", payload)

    const response = await flw.Payment.initialize(payload)

    if (response.status === "success") {
      return NextResponse.json({
        success: true,
        payment_link: response.data.link,
        tx_ref,
      })
    } else {
      console.error("Flutterwave payment initiation failed:", response)
      return NextResponse.json(
        { success: false, message: "Payment initiation failed", error: response.message },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Payment initiation error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
