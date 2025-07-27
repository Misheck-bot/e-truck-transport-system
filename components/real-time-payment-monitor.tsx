"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, XCircle, Clock, RefreshCw, Bell, DollarSign } from "lucide-react"
import type { PaymentRecord } from "@/lib/payment-analytics"
import { format } from "date-fns"

interface RealtimePayment extends PaymentRecord {
  isNew?: boolean
}

export function RealTimePaymentMonitor() {
  const [recentPayments, setRecentPayments] = useState<RealtimePayment[]>([])
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [totalToday, setTotalToday] = useState(0)
  const [countToday, setCountToday] = useState(0)

  useEffect(() => {
    loadRealPayments()
    updateTodayStats()
    
    if (isMonitoring) {
      const interval = setInterval(() => {
        loadRealPayments()
        updateTodayStats()
      }, 10000) // Check every 10 seconds for real data updates

      return () => clearInterval(interval)
    }
  }, [isMonitoring])

  const loadRealPayments = () => {
    // Load real payment data from localStorage
    const allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
    const allPayments = allUsers.flatMap((user: any) => 
      (user.payments || []).map((payment: any) => ({
        ...payment,
        customerName: user.fullName,
        customerEmail: user.email,
        phoneNumber: user.phone,
        transactionId: payment.id || `TXN${Date.now()}`,
        reference: payment.reference || `REF${Date.now()}`,
        userId: user.email
      }))
    )

    // Sort by date (most recent first) and take the last 20
    const sortedPayments = allPayments
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20)
      .map((payment: any, index: number) => ({
        ...payment,
        isNew: index === 0 && new Date(payment.date).getTime() > Date.now() - 60000 // Mark as new if within last minute
      }))

    setRecentPayments(sortedPayments)
  }

  const updateTodayStats = () => {
    // Load real payment data for today's stats
    const allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
    const allPayments = allUsers.flatMap((user: any) => user.payments || [])
    
    const today = new Date().toDateString()
    const todayPayments = allPayments.filter(
      (p: any) => new Date(p.date).toDateString() === today && p.status === "completed",
    )

    setCountToday(todayPayments.length)
    setTotalToday(todayPayments.reduce((sum: number, p: any) => {
      const amount = parseInt(p.amount.replace(/[^0-9]/g, ""))
      return sum + amount
    }, 0))
  }

  const showNotification = (payment: RealtimePayment) => {
    // Show notification for new payments (only for real payments that are marked as new)
    if (payment.isNew && "Notification" in window && Notification.permission === "granted") {
      new Notification("New Payment Received", {
        body: `${payment.customerName} paid ${formatCurrency(payment.amount)} via ${payment.method.toUpperCase()}`,
        icon: "/favicon.ico",
      })
    }
  }

  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZM", {
      style: "currency",
      currency: "ZMW",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real-Time Payment Monitor</h2>
          <p className="text-gray-600">Live payment activity and notifications</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={requestNotificationPermission}
            className="flex items-center space-x-2 bg-transparent"
          >
            <Bell className="h-4 w-4" />
            <span>Enable Notifications</span>
          </Button>
          <Button
            variant={isMonitoring ? "default" : "outline"}
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isMonitoring ? "animate-spin" : ""}`} />
            <span>{isMonitoring ? "Monitoring" : "Paused"}</span>
          </Button>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Today's Revenue</p>
                <p className="text-xl font-bold">{formatCurrency(totalToday)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Transactions Today</p>
                <p className="text-xl font-bold">{countToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-xl font-bold">{isMonitoring ? "Live" : "Paused"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className={`h-5 w-5 ${isMonitoring ? "animate-spin" : ""}`} />
            <span>Recent Payments</span>
          </CardTitle>
          <CardDescription>Live feed of payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {recentPayments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2" />
                  <p>No recent payments</p>
                  <p className="text-sm">Real payment data will appear here when drivers make payments</p>
                </div>
              ) : (
                recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className={`flex items-center justify-between p-4 border rounded-lg transition-all duration-300 ${
                      payment.isNew ? "bg-blue-50 border-blue-200 animate-pulse" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <p className="font-semibold">{payment.customerName}</p>
                        <p className="text-sm text-gray-600">{payment.customerEmail}</p>
                        <p className="text-xs text-gray-500">
                          {payment.type.replace("-", " ").toUpperCase()} via {payment.method.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(payment.amount)}</p>
                      <div className="flex items-center space-x-2 mt-1">{getStatusBadge(payment.status)}</div>
                      <p className="text-xs text-gray-500 mt-1">{format(new Date(payment.date), "HH:mm:ss")}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
