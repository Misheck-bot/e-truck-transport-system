"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CreditCard, CheckCircle, XCircle } from "lucide-react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  paymentType: string
  amount?: number
  onSuccess?: () => void
}

type PaymentType = "ecard" | "road-tax" | "insurance" | "license-renewal"

export default function PaymentModal({ isOpen, onClose, paymentType, amount, onSuccess }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle")
  const [paymentLink, setPaymentLink] = useState("")

  const paymentMethods = [
    { value: "mtn", label: "MTN Mobile Money", icon: "📱" },
    { value: "airtel", label: "Airtel Money", icon: "📱" },
    { value: "zamtel", label: "Zamtel Kwacha", icon: "📱" },
    { value: "visa", label: "Visa/Mastercard", icon: "💳" },
  ]

  const paymentAmounts: Record<PaymentType, number> = {
    ecard: 500,
    "road-tax": 1200,
    insurance: 2500,
    "license-renewal": 300,
  }

  const getPaymentAmount = (type: string): number => {
    return paymentAmounts[type as PaymentType] || amount || 0
  }

  const handlePayment = async () => {
    if (!paymentMethod || !email || !name) {
      alert("Please fill in all required fields")
      return
    }

    if (paymentMethod !== "visa" && !phoneNumber) {
      alert("Phone number is required for mobile money payments")
      return
    }

    setIsProcessing(true)
    setPaymentStatus("processing")

    try {
      // Initiate payment with Flutterwave
      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: getPaymentAmount(paymentType),
          currency: "ZMW",
          email,
          phone: phoneNumber,
          name,
          type: paymentType,
          method: paymentMethod,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPaymentLink(data.payment_link)

        // Open Flutterwave payment page
        window.open(data.payment_link, "_blank", "width=600,height=600")

        // Start polling for payment status
        pollPaymentStatus(data.tx_ref)
      } else {
        throw new Error(data.message || "Payment initiation failed")
      }
    } catch (error) {
      console.error("Payment error:", error)
      setPaymentStatus("failed")
      alert("Payment failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const pollPaymentStatus = async (txRef: string) => {
    const maxAttempts = 30 // Poll for 5 minutes (30 * 10 seconds)
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch("/api/payments/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tx_ref: txRef,
          }),
        })

        const data = await response.json()

        if (data.success) {
          setPaymentStatus("success")
          setTimeout(() => {
            onSuccess?.()
            onClose()
          }, 2000)
          return
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000) // Poll every 10 seconds
        } else {
          setPaymentStatus("failed")
        }
      } catch (error) {
        console.error("Payment verification error:", error)
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000)
        } else {
          setPaymentStatus("failed")
        }
      }
    }

    // Start polling after 5 seconds
    setTimeout(poll, 5000)
  }

  const resetModal = () => {
    setPaymentMethod("")
    setPhoneNumber("")
    setEmail("")
    setName("")
    setPaymentStatus("idle")
    setPaymentLink("")
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment for {paymentType.replace("-", " ").toUpperCase()}
          </DialogTitle>
        </DialogHeader>

        {paymentStatus === "idle" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Details</CardTitle>
                <CardDescription>Amount: ZMW {getPaymentAmount(paymentType)}</CardDescription>
              </CardHeader>
            </Card>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <Label htmlFor="payment-method">Payment Method *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        <span className="flex items-center gap-2">
                          <span>{method.icon}</span>
                          {method.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod && paymentMethod !== "visa" && (
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g., +260123456789"
                    required
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button onClick={handlePayment} disabled={isProcessing} className="flex-1">
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay ZMW ${getPaymentAmount(paymentType)}`
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {paymentStatus === "processing" && (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
            <p className="text-gray-600 mb-4">Please complete your payment in the opened window</p>
            {paymentLink && (
              <Button variant="outline" onClick={() => window.open(paymentLink, "_blank")}>
                Reopen Payment Window
              </Button>
            )}
          </div>
        )}

        {paymentStatus === "success" && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
            <p className="text-gray-600">Your payment has been processed successfully.</p>
          </div>
        )}

        {paymentStatus === "failed" && (
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment Failed</h3>
            <p className="text-gray-600 mb-4">Your payment could not be processed. Please try again.</p>
            <Button onClick={() => setPaymentStatus("idle")}>Try Again</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
