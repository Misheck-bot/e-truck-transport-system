export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"
import Flutterwave from "flutterwave-node-v3"

const flw = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY!,
  process.env.FLUTTERWAVE_SECRET_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { tx_ref } = await request.json()
    if (!tx_ref) {
      return NextResponse.json({ success: false, message: "tx_ref is required" }, { status: 400 })
    }

    const response = await flw.Transaction.verify({ id: tx_ref })

    if (response.status === "success" && response.data.status === "successful") {
      return NextResponse.json({ success: true, data: response.data })
    } else {
      return NextResponse.json(
        { success: false, message: "Payment not successful", data: response.data },
        { status: 400 }
      )
    }
  } catch (error) {
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
