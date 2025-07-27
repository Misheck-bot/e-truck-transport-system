import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"

export interface PaymentRecord {
  id: string
  type: "road-tax" | "insurance" | "ecard" | "license-renewal"
  amount: number
  method: "mtn" | "airtel" | "zamtel" | "card"
  status: "completed" | "pending" | "failed"
  date: string
  phoneNumber?: string
  transactionId: string
  reference: string
  customerEmail?: string
  customerName?: string
  userId: string
}

export interface PaymentAnalytics {
  totalRevenue: number
  totalTransactions: number
  successfulTransactions: number
  failedTransactions: number
  pendingTransactions: number
  successRate: number
  averageTransactionValue: number
  revenueByMethod: { method: string; amount: number; count: number }[]
  revenueByType: { type: string; amount: number; count: number }[]
  dailyRevenue: { date: string; amount: number; count: number }[]
  monthlyRevenue: { month: string; amount: number; count: number }[]
  topCustomers: { email: string; name: string; totalSpent: number; transactionCount: number }[]
}

export class PaymentAnalyticsService {
  private payments: PaymentRecord[] = []

  constructor() {
    this.loadPayments()
  }

  private loadPayments() {
    // Load payments from localStorage or API
    const storedPayments = localStorage.getItem("allPayments")
    if (storedPayments) {
      this.payments = JSON.parse(storedPayments)
    } else {
      // Generate sample data for demonstration
      this.payments = this.generateSampleData()
      localStorage.setItem("allPayments", JSON.stringify(this.payments))
    }
  }

  private generateSampleData(): PaymentRecord[] {
    const samplePayments: PaymentRecord[] = []
    const methods = ["mtn", "airtel", "zamtel", "card"] as const
    const types = ["road-tax", "insurance", "ecard", "license-renewal"] as const
    const statuses = ["completed", "pending", "failed"] as const

    // Generate 100 sample payments over the last 30 days
    for (let i = 0; i < 100; i++) {
      const randomDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      const type = types[Math.floor(Math.random() * types.length)]
      const method = methods[Math.floor(Math.random() * methods.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]

      // Weight success rate higher
      const finalStatus = Math.random() > 0.15 ? "completed" : status

      const amounts = {
        "road-tax": 1200,
        insurance: 2500,
        ecard: 500,
        "license-renewal": 300,
      }

      samplePayments.push({
        id: `payment_${i}`,
        type,
        amount: amounts[type],
        method,
        status: finalStatus,
        date: randomDate.toISOString(),
        phoneNumber: `097${Math.floor(Math.random() * 10000000)
          .toString()
          .padStart(7, "0")}`,
        transactionId: `TXN${Date.now()}${i}`,
        reference: `REF${Date.now()}${i}`,
        customerEmail: `customer${i}@example.com`,
        customerName: `Customer ${i}`,
        userId: `user_${i}`,
      })
    }

    return samplePayments
  }

  addPayment(payment: PaymentRecord) {
    this.payments.push(payment)
    localStorage.setItem("allPayments", JSON.stringify(this.payments))
  }

  getAnalytics(dateRange: "today" | "week" | "month" | "year" | "all" = "all"): PaymentAnalytics {
    const filteredPayments = this.filterPaymentsByDateRange(dateRange)

    const totalRevenue = filteredPayments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0)

    const totalTransactions = filteredPayments.length
    const successfulTransactions = filteredPayments.filter((p) => p.status === "completed").length
    const failedTransactions = filteredPayments.filter((p) => p.status === "failed").length
    const pendingTransactions = filteredPayments.filter((p) => p.status === "pending").length

    const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0
    const averageTransactionValue = successfulTransactions > 0 ? totalRevenue / successfulTransactions : 0

    // Revenue by method
    const revenueByMethod = this.groupByMethod(filteredPayments)

    // Revenue by type
    const revenueByType = this.groupByType(filteredPayments)

    // Daily revenue (last 30 days)
    const dailyRevenue = this.getDailyRevenue(filteredPayments)

    // Monthly revenue (last 12 months)
    const monthlyRevenue = this.getMonthlyRevenue(filteredPayments)

    // Top customers
    const topCustomers = this.getTopCustomers(filteredPayments)

    return {
      totalRevenue,
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      pendingTransactions,
      successRate,
      averageTransactionValue,
      revenueByMethod,
      revenueByType,
      dailyRevenue,
      monthlyRevenue,
      topCustomers,
    }
  }

  private filterPaymentsByDateRange(dateRange: string): PaymentRecord[] {
    const now = new Date()

    switch (dateRange) {
      case "today":
        return this.payments.filter((p) => {
          const paymentDate = new Date(p.date)
          return paymentDate >= startOfDay(now) && paymentDate <= endOfDay(now)
        })
      case "week":
        return this.payments.filter((p) => {
          const paymentDate = new Date(p.date)
          return paymentDate >= subDays(now, 7)
        })
      case "month":
        return this.payments.filter((p) => {
          const paymentDate = new Date(p.date)
          return paymentDate >= startOfMonth(now) && paymentDate <= endOfMonth(now)
        })
      case "year":
        return this.payments.filter((p) => {
          const paymentDate = new Date(p.date)
          return paymentDate >= startOfYear(now) && paymentDate <= endOfYear(now)
        })
      default:
        return this.payments
    }
  }

  private groupByMethod(payments: PaymentRecord[]) {
    const groups = payments
      .filter((p) => p.status === "completed")
      .reduce(
        (acc, payment) => {
          if (!acc[payment.method]) {
            acc[payment.method] = { amount: 0, count: 0 }
          }
          acc[payment.method].amount += payment.amount
          acc[payment.method].count += 1
          return acc
        },
        {} as Record<string, { amount: number; count: number }>,
      )

    return Object.entries(groups).map(([method, data]) => ({
      method: method.toUpperCase(),
      amount: data.amount,
      count: data.count,
    }))
  }

  private groupByType(payments: PaymentRecord[]) {
    const groups = payments
      .filter((p) => p.status === "completed")
      .reduce(
        (acc, payment) => {
          if (!acc[payment.type]) {
            acc[payment.type] = { amount: 0, count: 0 }
          }
          acc[payment.type].amount += payment.amount
          acc[payment.type].count += 1
          return acc
        },
        {} as Record<string, { amount: number; count: number }>,
      )

    return Object.entries(groups).map(([type, data]) => ({
      type: type.replace("-", " ").toUpperCase(),
      amount: data.amount,
      count: data.count,
    }))
  }

  private getDailyRevenue(payments: PaymentRecord[]) {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), i)
      return format(date, "yyyy-MM-dd")
    }).reverse()

    return last30Days.map((date) => {
      const dayPayments = payments.filter((p) => {
        const paymentDate = format(new Date(p.date), "yyyy-MM-dd")
        return paymentDate === date && p.status === "completed"
      })

      return {
        date: format(new Date(date), "MMM dd"),
        amount: dayPayments.reduce((sum, p) => sum + p.amount, 0),
        count: dayPayments.length,
      }
    })
  }

  private getMonthlyRevenue(payments: PaymentRecord[]) {
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      return format(date, "yyyy-MM")
    }).reverse()

    return last12Months.map((month) => {
      const monthPayments = payments.filter((p) => {
        const paymentMonth = format(new Date(p.date), "yyyy-MM")
        return paymentMonth === month && p.status === "completed"
      })

      return {
        month: format(new Date(month + "-01"), "MMM yyyy"),
        amount: monthPayments.reduce((sum, p) => sum + p.amount, 0),
        count: monthPayments.length,
      }
    })
  }

  private getTopCustomers(payments: PaymentRecord[]) {
    const customerGroups = payments
      .filter((p) => p.status === "completed" && p.customerEmail)
      .reduce(
        (acc, payment) => {
          const email = payment.customerEmail!
          if (!acc[email]) {
            acc[email] = {
              email,
              name: payment.customerName || email,
              totalSpent: 0,
              transactionCount: 0,
            }
          }
          acc[email].totalSpent += payment.amount
          acc[email].transactionCount += 1
          return acc
        },
        {} as Record<string, { email: string; name: string; totalSpent: number; transactionCount: number }>,
      )

    return Object.values(customerGroups)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)
  }

  getPaymentHistory(filters?: {
    status?: string
    method?: string
    type?: string
    dateFrom?: string
    dateTo?: string
    search?: string
  }): PaymentRecord[] {
    let filteredPayments = [...this.payments]

    if (filters) {
      if (filters.status) {
        filteredPayments = filteredPayments.filter((p) => p.status === filters.status)
      }
      if (filters.method) {
        filteredPayments = filteredPayments.filter((p) => p.method === filters.method)
      }
      if (filters.type) {
        filteredPayments = filteredPayments.filter((p) => p.type === filters.type)
      }
      if (filters.dateFrom) {
        filteredPayments = filteredPayments.filter((p) => new Date(p.date) >= new Date(filters.dateFrom!))
      }
      if (filters.dateTo) {
        filteredPayments = filteredPayments.filter((p) => new Date(p.date) <= new Date(filters.dateTo!))
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredPayments = filteredPayments.filter(
          (p) =>
            p.transactionId.toLowerCase().includes(searchLower) ||
            p.reference.toLowerCase().includes(searchLower) ||
            p.customerEmail?.toLowerCase().includes(searchLower) ||
            p.customerName?.toLowerCase().includes(searchLower) ||
            p.phoneNumber?.includes(filters.search!),
        )
      }
    }

    return filteredPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  exportToCSV(payments: PaymentRecord[]): string {
    const headers = [
      "Transaction ID",
      "Reference",
      "Type",
      "Amount",
      "Method",
      "Status",
      "Date",
      "Customer Email",
      "Customer Name",
      "Phone Number",
    ]

    const csvContent = [
      headers.join(","),
      ...payments.map((p) =>
        [
          p.transactionId,
          p.reference,
          p.type,
          p.amount,
          p.method,
          p.status,
          format(new Date(p.date), "yyyy-MM-dd HH:mm:ss"),
          p.customerEmail || "",
          p.customerName || "",
          p.phoneNumber || "",
        ].join(","),
      ),
    ].join("\n")

    return csvContent
  }
}
