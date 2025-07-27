// Enhanced Payment API with Real Providers
import { type NextRequest, NextResponse } from "next/server"
import { PaymentProviderFactory } from "@/lib/payment-providers"

export async function POST(request: NextRequest) {
  try {
    const { type, amount, method, phoneNumber, userId } = await request.json()

    // Get the appropriate payment provider
    const provider = PaymentProviderFactory.getProvider(method)

    // Process payment
    const result = await provider.processPayment({
      amount,
      phoneNumber,
      reference: `ETRUCK_${Date.now()}`,
      description: `E-Truck ${type.replace("-", " ")}`,
    })

    if (result.success) {
      // Save payment record to database
      // Update user status if needed (e.g., E-Card activation)

      return NextResponse.json({
        success: true,
        transactionId: result.transactionId,
        message: result.message,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Payment processing failed",
      },
      { status: 500 },
    )
  }
}
