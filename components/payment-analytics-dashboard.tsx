"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Users,
  Download,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Smartphone,
} from "lucide-react"
// Removed PaymentAnalyticsService import - now using real data from localStorage
import { format } from "date-fns"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function PaymentAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [paymentHistory, setPaymentHistory] = useState<any[]>([])
  const [selectedDateRange, setSelectedDateRange] = useState<"today" | "week" | "month" | "year" | "all">("month")
  const [filters, setFilters] = useState({
    status: "all",
    method: "all",
    type: "all",
    dateFrom: "",
    dateTo: "",
    search: "",
  })

  useEffect(() => {
    loadRealAnalytics()
    loadRealPaymentHistory()
  }, [selectedDateRange, filters])

  const loadRealAnalytics = () => {
    // Load real payment data from localStorage
    const allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
    const allPayments = allUsers.flatMap((user: any) => 
      (user.payments || []).map((payment: any) => ({
        ...payment,
        customerName: user.fullName,
        customerEmail: user.email,
        phoneNumber: user.phone
      }))
    )

    // Filter payments based on date range
    const now = new Date()
    let filteredPayments = allPayments

    switch (selectedDateRange) {
      case "today":
        const today = new Date().toDateString()
        filteredPayments = allPayments.filter((p: any) => 
          new Date(p.date).toDateString() === today
        )
        break
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        filteredPayments = allPayments.filter((p: any) => 
          new Date(p.date) >= weekAgo
        )
        break
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        filteredPayments = allPayments.filter((p: any) => 
          new Date(p.date) >= monthAgo
        )
        break
      case "year":
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        filteredPayments = allPayments.filter((p: any) => 
          new Date(p.date) >= yearAgo
        )
        break
      // "all" uses all payments
    }

    // Calculate analytics from real data
    const totalRevenue = filteredPayments
      .filter((p: any) => p.status === "completed")
      .reduce((sum: number, p: any) => {
        const amount = parseInt(p.amount.replace(/[^0-9]/g, ""))
        return sum + amount
      }, 0)

    const totalTransactions = filteredPayments.length
    const successfulTransactions = filteredPayments.filter((p: any) => p.status === "completed").length
    const pendingTransactions = filteredPayments.filter((p: any) => p.status === "pending").length
    const failedTransactions = filteredPayments.filter((p: any) => p.status === "failed").length

    const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0
    const averageTransactionValue = successfulTransactions > 0 ? totalRevenue / successfulTransactions : 0

    // Calculate revenue by type
    const revenueByType = [
      { type: "E-Card", amount: filteredPayments
        .filter((p: any) => p.type === "ecard" && p.status === "completed")
        .reduce((sum: number, p: any) => sum + parseInt(p.amount.replace(/[^0-9]/g, "")), 0)
      },
      { type: "Road Tax", amount: filteredPayments
        .filter((p: any) => p.type === "road-tax" && p.status === "completed")
        .reduce((sum: number, p: any) => sum + parseInt(p.amount.replace(/[^0-9]/g, "")), 0)
      },
      { type: "Insurance", amount: filteredPayments
        .filter((p: any) => p.type === "insurance" && p.status === "completed")
        .reduce((sum: number, p: any) => sum + parseInt(p.amount.replace(/[^0-9]/g, "")), 0)
      },
      { type: "License Renewal", amount: filteredPayments
        .filter((p: any) => p.type === "license-renewal" && p.status === "completed")
        .reduce((sum: number, p: any) => sum + parseInt(p.amount.replace(/[^0-9]/g, "")), 0)
      }
    ].filter(item => item.amount > 0)

    // Calculate revenue by method
    const revenueByMethod = [
      { method: "MTN", amount: filteredPayments
        .filter((p: any) => p.method === "mtn" && p.status === "completed")
        .reduce((sum: number, p: any) => sum + parseInt(p.amount.replace(/[^0-9]/g, "")), 0),
        count: filteredPayments.filter((p: any) => p.method === "mtn").length
      },
      { method: "Airtel", amount: filteredPayments
        .filter((p: any) => p.method === "airtel" && p.status === "completed")
        .reduce((sum: number, p: any) => sum + parseInt(p.amount.replace(/[^0-9]/g, "")), 0),
        count: filteredPayments.filter((p: any) => p.method === "airtel").length
      },
      { method: "Zamtel", amount: filteredPayments
        .filter((p: any) => p.method === "zamtel" && p.status === "completed")
        .reduce((sum: number, p: any) => sum + parseInt(p.amount.replace(/[^0-9]/g, "")), 0),
        count: filteredPayments.filter((p: any) => p.method === "zamtel").length
      },
      { method: "Card", amount: filteredPayments
        .filter((p: any) => p.method === "card" && p.status === "completed")
        .reduce((sum: number, p: any) => sum + parseInt(p.amount.replace(/[^0-9]/g, "")), 0),
        count: filteredPayments.filter((p: any) => p.method === "card").length
      }
    ].filter(item => item.amount > 0)

    // Calculate top customers
    const customerSpending = filteredPayments
      .filter((p: any) => p.status === "completed")
      .reduce((acc: any, p: any) => {
        if (!acc[p.customerEmail]) {
          acc[p.customerEmail] = {
            name: p.customerName,
            email: p.customerEmail,
            totalSpent: 0,
            transactionCount: 0
          }
        }
        acc[p.customerEmail].totalSpent += parseInt(p.amount.replace(/[^0-9]/g, ""))
        acc[p.customerEmail].transactionCount += 1
        return acc
      }, {})

    const topCustomers = Object.values(customerSpending)
      .sort((a: any, b: any) => b.totalSpent - a.totalSpent)
      .slice(0, 5)

    // Generate daily revenue data for the last 30 days
    const dailyRevenue = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayPayments = filteredPayments.filter((p: any) => 
        new Date(p.date).toDateString() === date.toDateString() && p.status === "completed"
      )
      const dayRevenue = dayPayments.reduce((sum: number, p: any) => 
        sum + parseInt(p.amount.replace(/[^0-9]/g, "")), 0
      )
      dailyRevenue.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: dayRevenue
      })
    }

    // Generate monthly revenue data for the last 12 months
    const monthlyRevenue = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthPayments = filteredPayments.filter((p: any) => {
        const paymentDate = new Date(p.date)
        return paymentDate.getMonth() === date.getMonth() && 
               paymentDate.getFullYear() === date.getFullYear() && 
               p.status === "completed"
      })
      const monthRevenue = monthPayments.reduce((sum: number, p: any) => 
        sum + parseInt(p.amount.replace(/[^0-9]/g, "")), 0
      )
      monthlyRevenue.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        amount: monthRevenue
      })
    }

    setAnalytics({
      totalRevenue,
      totalTransactions,
      successfulTransactions,
      pendingTransactions,
      failedTransactions,
      successRate,
      averageTransactionValue,
      revenueByType,
      revenueByMethod,
      topCustomers,
      dailyRevenue,
      monthlyRevenue
    })
  }

  const loadRealPaymentHistory = () => {
    // Load real payment data from localStorage
    const allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
    const allPayments = allUsers.flatMap((user: any) => 
      (user.payments || []).map((payment: any) => ({
        ...payment,
        customerName: user.fullName,
        customerEmail: user.email,
        phoneNumber: user.phone,
        transactionId: payment.id || `TXN${Date.now()}`,
        reference: payment.reference || `REF${Date.now()}`
      }))
    )

    // Apply filters
    let filteredPayments = allPayments

    if (filters.status !== "all") {
      filteredPayments = filteredPayments.filter((p: any) => p.status === filters.status)
    }

    if (filters.method !== "all") {
      filteredPayments = filteredPayments.filter((p: any) => p.method === filters.method)
    }

    if (filters.type !== "all") {
      filteredPayments = filteredPayments.filter((p: any) => p.type === filters.type)
    }

    if (filters.dateFrom) {
      filteredPayments = filteredPayments.filter((p: any) => 
        new Date(p.date) >= new Date(filters.dateFrom)
      )
    }

    if (filters.dateTo) {
      filteredPayments = filteredPayments.filter((p: any) => 
        new Date(p.date) <= new Date(filters.dateTo)
      )
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredPayments = filteredPayments.filter((p: any) => 
        p.transactionId?.toLowerCase().includes(searchLower) ||
        p.customerEmail?.toLowerCase().includes(searchLower) ||
        p.customerName?.toLowerCase().includes(searchLower)
      )
    }

    setPaymentHistory(filteredPayments)
  }

  const handleExportCSV = () => {
    // Create CSV content from real payment data
    const headers = ["Transaction ID", "Customer Name", "Customer Email", "Type", "Amount", "Method", "Status", "Date"]
    const csvRows = [headers.join(",")]
    
    paymentHistory.forEach((payment: any) => {
      const row = [
        payment.transactionId || payment.id,
        `"${payment.customerName || ""}"`,
        payment.customerEmail || "",
        payment.type,
        payment.amount,
        payment.method,
        payment.status,
        new Date(payment.date).toLocaleDateString()
      ]
      csvRows.push(row.join(","))
    })
    
    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `payment-report-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZM", {
      style: "currency",
      currency: "ZMW",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "mtn":
      case "airtel":
      case "zamtel":
        return <Smartphone className="h-4 w-4" />
      case "card":
        return <CreditCard className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  if (!analytics) {
    return <div>Loading analytics...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Analytics</h1>
          <p className="text-gray-600">Track and analyze payment performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedDateRange} onValueChange={(value: any) => setSelectedDateRange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold">{analytics.totalTransactions.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">{analytics.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Transaction</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.averageTransactionValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Payment Type */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Service Type</CardTitle>
                <CardDescription>Breakdown of revenue by service category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.revenueByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {analytics.revenueByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue by Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Payment Method</CardTitle>
                <CardDescription>Distribution across payment channels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.revenueByMethod}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="method" />
                    <YAxis tickFormatter={(value) => `K${(value / 1000).toFixed(0)}`} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Bar dataKey="amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Successful</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.successfulTransactions}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{analytics.pendingTransactions}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{analytics.failedTransactions}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Daily Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Revenue Trend</CardTitle>
              <CardDescription>Revenue performance over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analytics.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `K${(value / 1000).toFixed(0)}`} />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="amount" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trend</CardTitle>
              <CardDescription>Revenue performance over the last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `K${(value / 1000).toFixed(0)}`} />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Method Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method Performance</CardTitle>
                <CardDescription>Revenue and transaction count by method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.revenueByMethod.map((method, index) => (
                    <div key={method.method} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getMethodIcon(method.method)}
                        <div>
                          <p className="font-semibold">{method.method}</p>
                          <p className="text-sm text-gray-600">{method.count} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(method.amount)}</p>
                        <p className="text-sm text-gray-600">
                          {((method.amount / analytics.totalRevenue) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Customers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>Highest spending customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topCustomers.slice(0, 5).map((customer, index) => (
                    <div key={customer.email} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{customer.name}</p>
                        <p className="text-sm text-gray-600">{customer.email}</p>
                        <p className="text-xs text-gray-500">{customer.transactionCount} transactions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(customer.totalSpent)}</p>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filter Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Transaction ID, email..."
                      className="pl-8"
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select value={filters.method} onValueChange={(value) => setFilters({ ...filters, method: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All methods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All methods</SelectItem>
                      <SelectItem value="mtn">MTN</SelectItem>
                      <SelectItem value="airtel">Airtel</SelectItem>
                      <SelectItem value="zamtel">Zamtel</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="road-tax">Road Tax</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="ecard">E-Card</SelectItem>
                      <SelectItem value="license-renewal">License Renewal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-from">From Date</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-to">To Date</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Showing {paymentHistory.length} transactions
                {filters.search && ` matching "${filters.search}"`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.slice(0, 50).map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">{payment.transactionId}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payment.customerName || "N/A"}</p>
                            <p className="text-sm text-gray-600">{payment.customerEmail}</p>
                            {payment.phoneNumber && <p className="text-xs text-gray-500">{payment.phoneNumber}</p>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.type.replace("-", " ").toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getMethodIcon(payment.method)}
                            <span>{payment.method.toUpperCase()}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(payment.date), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
