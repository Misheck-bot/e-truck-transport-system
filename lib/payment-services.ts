// Real Payment Services Integration
import Flutterwave from "flutterwave-node-v3"
import Stripe from "stripe"

// Initialize payment providers
const flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY!, process.env.FLUTTERWAVE_SECRET_KEY!)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export interface PaymentRequest {
  amount: number
  currency: string
  email: string
  phoneNumber: string
  fullName: string
  paymentType: "road-tax" | "insurance" | "ecard" | "license-renewal"
  method: "mtn" | "airtel" | "zamtel" | "card" | "bank"
  userId: string
}

export interface PaymentResponse {
  success: boolean
  paymentUrl?: string
  transactionId: string
  message: string
  reference: string
}

export interface PaymentVerification {
  success: boolean
  status: "successful" | "failed" | "pending"
  amount: number
  currency: string
  transactionId: string
  reference: string
  customerEmail: string
  paymentMethod: string
}

// Flutterwave Payment Service (Supports MTN, Airtel, Zamtel, Cards)
export class FlutterwavePaymentService {
  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const reference = `ETRUCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const payload = {
        tx_ref: reference,
        amount: request.amount,
        currency: request.currency,
        redirect_url: process.env.PAYMENT_SUCCESS_URL!,
        customer: {
          email: request.email,
          phonenumber: request.phoneNumber,
          name: request.fullName,
        },
        customizations: {
          title: "E-Truck Transport Payment",
          description: `Payment for ${request.paymentType.replace("-", " ")}`,
          logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
        },
        meta: {
          userId: request.userId,
          paymentType: request.paymentType,
        },
      }

      // Add payment method specific configurations
      if (request.method === "mtn") {
        payload.payment_options = "mobilemoneyzm"
      } else if (request.method === "airtel") {
        payload.payment_options = "mobilemoneyzm"
      } else if (request.method === "card") {
        payload.payment_options = "card"
      }

      const response = await flw.StandardSubaccount.create(payload)

      if (response.status === "success") {
        return {
          success: true,
          paymentUrl: response.data.link,
          transactionId: response.data.tx_ref,
          message: "Payment link generated successfully",
          reference,
        }
      } else {
        throw new Error(response.message || "Payment initiation failed")
      }
    } catch (error: any) {
      return {
        success: false,
        transactionId: "",
        message: `Payment failed: ${error.message}`,
        reference: "",
      }
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerification> {
    try {
      const response = await flw.Transaction.verify({ id: transactionId })

      if (response.status === "success" && response.data.status === "successful") {
        return {
          success: true,
          status: "successful",
          amount: response.data.amount,
          currency: response.data.currency,
          transactionId: response.data.id.toString(),
          reference: response.data.tx_ref,
          customerEmail: response.data.customer.email,
          paymentMethod: response.data.payment_type,
        }
      } else {
        return {
          success: false,
          status: response.data.status === "failed" ? "failed" : "pending",
          amount: response.data.amount || 0,
          currency: response.data.currency || "ZMW",
          transactionId: response.data.id?.toString() || "",
          reference: response.data.tx_ref || "",
          customerEmail: response.data.customer?.email || "",
          paymentMethod: response.data.payment_type || "",
        }
      }
    } catch (error: any) {
      return {
        success: false,
        status: "failed",
        amount: 0,
        currency: "ZMW",
        transactionId: "",
        reference: "",
        customerEmail: "",
        paymentMethod: "",
      }
    }
  }
}

// MTN Mobile Money Direct Integration
export class MTNMobileMoneyService {
  private baseUrl = process.env.MTN_API_URL || "https://sandbox.momodeveloper.mtn.com"
  private apiKey = process.env.MTN_API_KEY!
  private apiUserId = process.env.MTN_API_USER_ID!
  private apiSecret = process.env.MTN_API_SECRET!

  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const reference = `MTN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Get access token
      const token = await this.getAccessToken()

      const payload = {
        amount: request.amount.toString(),
        currency: request.currency,
        externalId: reference,
        payer: {
          partyIdType: "MSISDN",
          partyId: request.phoneNumber.replace("+260", "260"),
        },
        payerMessage: `E-Truck Transport: ${request.paymentType}`,
        payeeNote: `Payment for ${request.paymentType.replace("-", " ")}`,
      }

      const response = await fetch(`${this.baseUrl}/collection/v1_0/requesttopay`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Reference-Id": reference,
          "X-Target-Environment": "sandbox", // Change to 'live' for production
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": this.apiKey,
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        return {
          success: true,
          transactionId: reference,
          message: "MTN Mobile Money payment request sent to your phone",
          reference,
        }
      } else {
        const error = await response.text()
        throw new Error(`MTN API Error: ${error}`)
      }
    } catch (error: any) {
      return {
        success: false,
        transactionId: "",
        message: `MTN payment failed: ${error.message}`,
        reference: "",
      }
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerification> {
    try {
      const token = await this.getAccessToken()

      const response = await fetch(`${this.baseUrl}/collection/v1_0/requesttopay/${transactionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Target-Environment": "sandbox",
          "Ocp-Apim-Subscription-Key": this.apiKey,
        },
      })

      const result = await response.json()

      return {
        success: result.status === "SUCCESSFUL",
        status: result.status === "SUCCESSFUL" ? "successful" : result.status === "FAILED" ? "failed" : "pending",
        amount: Number.parseFloat(result.amount),
        currency: result.currency,
        transactionId,
        reference: result.externalId,
        customerEmail: "",
        paymentMethod: "MTN Mobile Money",
      }
    } catch (error: any) {
      return {
        success: false,
        status: "failed",
        amount: 0,
        currency: "ZMW",
        transactionId,
        reference: "",
        customerEmail: "",
        paymentMethod: "MTN Mobile Money",
      }
    }
  }

  private async getAccessToken(): Promise<string> {
    // Implement OAuth token retrieval and caching
    // This is a simplified version - in production, cache tokens
    const auth = Buffer.from(`${this.apiUserId}:${this.apiSecret}`).toString("base64")

    const response = await fetch(`${this.baseUrl}/collection/token/`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Ocp-Apim-Subscription-Key": this.apiKey,
      },
    })

    const result = await response.json()
    return result.access_token
  }
}

// Stripe Payment Service (For International Cards)
export class StripePaymentService {
  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const reference = `STRIPE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: request.currency.toLowerCase(),
              product_data: {
                name: `E-Truck Transport - ${request.paymentType.replace("-", " ")}`,
                description: `Payment for ${request.paymentType.replace("-", " ")}`,
              },
              unit_amount: request.amount * 100, // Stripe uses cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.PAYMENT_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: process.env.PAYMENT_CANCEL_URL!,
        customer_email: request.email,
        metadata: {
          userId: request.userId,
          paymentType: request.paymentType,
          reference,
        },
      })

      return {
        success: true,
        paymentUrl: session.url!,
        transactionId: session.id,
        message: "Stripe payment session created",
        reference,
      }
    } catch (error: any) {
      return {
        success: false,
        transactionId: "",
        message: `Stripe payment failed: ${error.message}`,
        reference: "",
      }
    }
  }

  async verifyPayment(sessionId: string): Promise<PaymentVerification> {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId)

      return {
        success: session.payment_status === "paid",
        status:
          session.payment_status === "paid" ? "successful" : session.payment_status === "unpaid" ? "failed" : "pending",
        amount: (session.amount_total || 0) / 100,
        currency: session.currency?.toUpperCase() || "USD",
        transactionId: session.id,
        reference: session.metadata?.reference || "",
        customerEmail: session.customer_email || "",
        paymentMethod: "Card",
      }
    } catch (error: any) {
      return {
        success: false,
        status: "failed",
        amount: 0,
        currency: "USD",
        transactionId: sessionId,
        reference: "",
        customerEmail: "",
        paymentMethod: "Card",
      }
    }
  }
}

// Payment Service Factory
export class PaymentServiceFactory {
  static getService(method: string) {
    switch (method.toLowerCase()) {
      case "mtn":
        return new MTNMobileMoneyService()
      case "airtel":
      case "zamtel":
        return new FlutterwavePaymentService()
      case "card":
        return new StripePaymentService()
      default:
        return new FlutterwavePaymentService() // Default to Flutterwave
    }
  }
}
