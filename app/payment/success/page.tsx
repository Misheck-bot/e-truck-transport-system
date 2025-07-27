"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowLeft, Download } from "lucide-react"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const reference = searchParams.get("ref")
    const sessionId = searchParams.get("session_id")
    const transactionId = searchParams.get("transaction_id")

    if (reference || sessionId || transactionId) {
      // Verify the payment
      verifyPayment(reference || sessionId || transactionId)
    } else {
      setLoading(false)
    }
  }, [searchParams])

  const verifyPayment = async (id: string) => {
    try {
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId: id,
          reference: id,
        }),
      })

      const result = await response.json()
      setPaymentDetails(result)
    } catch (error) {
      console.error("Payment verification error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Verifying your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
          <CardDescription>Your payment has been processed successfully</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {paymentDetails && paymentDetails.success && (
            <div className="space-y-3">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Payment Details</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Amount:</span> {paymentDetails.currency} {paymentDetails.amount}
                  </p>
                  <p>
                    <span className="font-medium">Reference:</span> {paymentDetails.reference}
                  </p>
                  <p>
                    <span className="font-medium">Method:</span> {paymentDetails.paymentMethod}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    <span className="text-green-600 font-semibold">Successful</span>
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  📧 A confirmation email has been sent to your registered email address.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Dashboard
            </Button>

            <Button variant="outline" className="w-full bg-transparent" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500 mt-4">Transaction processed securely by Flutterwave</div>
        </CardContent>
      </Card>
    </div>
  )
}
