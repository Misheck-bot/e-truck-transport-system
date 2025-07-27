"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react"

export default function PaymentCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-red-600">Payment Cancelled</CardTitle>
          <CardDescription>Your payment was cancelled or could not be completed</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ No charges have been made to your account. You can try again or choose a different payment method.
            </p>
          </div>

          <div className="space-y-2">
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Dashboard
            </Button>

            <Button variant="outline" className="w-full bg-transparent" onClick={() => router.back()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Payment Again
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500 mt-4">Need help? Contact our support team</div>
        </CardContent>
      </Card>
    </div>
  )
}
