"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Settings, Users, CreditCard, FileText, DollarSign, Clock, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
// Add import for ProfileModal
import { ProfileModal } from "@/components/profile-modal"
import { PaymentAnalyticsDashboard } from "@/components/payment-analytics-dashboard"
import { RealTimePaymentMonitor } from "@/components/real-time-payment-monitor"

export default function AdminDashboard() {
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [allPayments, setAllPayments] = useState<any[]>([])
  const [eCardIssuances, setECardIssuances] = useState<any[]>([])
  const [registeredDrivers, setRegisteredDrivers] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState({
    today: 0,
    eCardSales: 0,
    roadTax: 0,
    licenseRenewals: 0
  })
  const [eCardStats, setECardStats] = useState({
    totalIssued: 0,
    activeCards: 0,
    expiredCards: 0,
    pendingIssuance: 0
  })
  const [adminProfile, setAdminProfile] = useState<any>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [manualIssueData, setManualIssueData] = useState({
    driverLicense: "",
    paymentRef: ""
  })
  const [showUserManagement, setShowUserManagement] = useState(false)
  const [showRolePermissions, setShowRolePermissions] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      const admin = JSON.parse(userData)
      setAdminProfile(admin)
      loadRealData()
    } else {
      router.push("/dashboard/admin/register")
    }
  }, [])

  const loadRealData = () => {
    // Load registered drivers
    const drivers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
      .filter((user: any) => user.role === "driver")
    setRegisteredDrivers(drivers)

    // Load all payments from all users
    const allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
    const allUserPayments = allUsers.flatMap((user: any) => 
      (user.payments || []).map((payment: any) => ({
        ...payment,
        driverName: user.fullName,
        driverEmail: user.email,
        driverLicense: user.licenseNumber
      }))
    )
    setAllPayments(allUserPayments)

    // Load pending requests (payments with pending status)
    const pending = allUserPayments.filter((payment: any) => payment.status === "pending")
    setPendingRequests(pending)

    // Load E-card issuances
    const eCardPayments = allUserPayments.filter((payment: any) => 
      payment.type === "ecard" && payment.status === "completed"
    )
    setECardIssuances(eCardPayments)

    // Calculate revenue data
    const today = new Date().toDateString()
    const todayPayments = allUserPayments.filter((payment: any) => 
      payment.status === "completed" && 
      new Date(payment.date).toDateString() === today
    )

    const todayRevenue = todayPayments.reduce((sum: number, payment: any) => {
      const amount = parseInt(payment.amount.replace(/[^0-9]/g, ""))
      return sum + amount
    }, 0)

    const eCardSales = todayPayments
      .filter((p: any) => p.type === "ecard")
      .reduce((sum: number, payment: any) => {
        const amount = parseInt(payment.amount.replace(/[^0-9]/g, ""))
        return sum + amount
      }, 0)

    const roadTax = todayPayments
      .filter((p: any) => p.type === "road-tax")
      .reduce((sum: number, payment: any) => {
        const amount = parseInt(payment.amount.replace(/[^0-9]/g, ""))
        return sum + amount
      }, 0)

    const licenseRenewals = todayPayments
      .filter((p: any) => p.type === "license-renewal")
      .reduce((sum: number, payment: any) => {
        const amount = parseInt(payment.amount.replace(/[^0-9]/g, ""))
        return sum + amount
      }, 0)

    setRevenueData({
      today: todayRevenue,
      eCardSales,
      roadTax,
      licenseRenewals
    })

    // Calculate E-card statistics
    const totalIssued = eCardPayments.length
    const activeCards = drivers.filter((driver: any) => driver.eCardStatus === "active").length
    const expiredCards = drivers.filter((driver: any) => driver.eCardStatus === "expired").length
    const pendingIssuance = pending.filter((req: any) => req.type === "ecard").length

    setECardStats({
      totalIssued,
      activeCards,
      expiredCards,
      pendingIssuance
    })
  }

  const handleApproveRequest = (requestId: string) => {
    // Update the payment status in all users
    const allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
    const updatedUsers = allUsers.map((user: any) => {
      if (user.payments) {
        const updatedPayments = user.payments.map((payment: any) => {
          if (payment.id === requestId) {
            return { ...payment, status: "completed" }
          }
          return payment
        })
        return { ...user, payments: updatedPayments }
      }
      return user
    })
    
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers))
    
    // Update driver's E-card status if it's an E-card request
    const request = pendingRequests.find(req => req.id === requestId)
    if (request && request.type === "ecard") {
      const driverUsers = updatedUsers.filter((user: any) => user.role === "driver")
      const driverToUpdate = driverUsers.find((driver: any) => 
        driver.fullName === request.driverName || driver.email === request.driverEmail
      )
      if (driverToUpdate) {
        const updatedDriverUsers = driverUsers.map((driver: any) => {
          if (driver.email === driverToUpdate.email) {
            return { ...driver, eCardStatus: "active", eCardIssueDate: new Date().toISOString() }
          }
          return driver
        })
        const finalUpdatedUsers = allUsers.map((user: any) => {
          if (user.role === "driver") {
            const updatedDriver = updatedDriverUsers.find((d: any) => d.email === user.email)
            return updatedDriver || user
          }
          return user
        })
        localStorage.setItem("registeredUsers", JSON.stringify(finalUpdatedUsers))
      }
    }
    
    loadRealData() // Reload data
  }

  const handleRejectRequest = (requestId: string) => {
    // Update the payment status in all users
    const allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
    const updatedUsers = allUsers.map((user: any) => {
      if (user.payments) {
        const updatedPayments = user.payments.map((payment: any) => {
          if (payment.id === requestId) {
            return { ...payment, status: "rejected" }
          }
          return payment
        })
        return { ...user, payments: updatedPayments }
      }
      return user
    })
    
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers))
    loadRealData() // Reload data
  }

  const handleManualIssueECard = () => {
    if (!manualIssueData.driverLicense || !manualIssueData.paymentRef) {
      alert("Please fill in all fields")
      return
    }

    // Find the driver by license number
    const allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
    const driver = allUsers.find((user: any) => 
      user.role === "driver" && user.licenseNumber === manualIssueData.driverLicense
    )

    if (!driver) {
      alert("Driver not found with this license number")
      return
    }

    // Update driver's E-card status
    const updatedUsers = allUsers.map((user: any) => {
      if (user.email === driver.email) {
        return { 
          ...user, 
          eCardStatus: "active", 
          eCardIssueDate: new Date().toISOString(),
          payments: [
            ...(user.payments || []),
            {
              id: Date.now().toString(),
              type: "ecard",
              amount: "K500",
              status: "completed",
              date: new Date().toISOString(),
              method: "manual",
              reference: manualIssueData.paymentRef
            }
          ]
        }
      }
      return user
    })

    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers))
    setManualIssueData({ driverLicense: "", paymentRef: "" })
    loadRealData() // Reload data
    alert("E-Card issued successfully")
  }

  const generateRevenueReport = () => {
    const report = {
      date: new Date().toLocaleDateString(),
      admin: adminProfile.fullName,
      revenueData,
      allPayments: allPayments.filter((p: any) => p.status === "completed"),
      summary: {
        totalRevenue: allPayments
          .filter((p: any) => p.status === "completed")
          .reduce((sum: number, payment: any) => {
            const amount = parseInt(payment.amount.replace(/[^0-9]/g, ""))
            return sum + amount
          }, 0),
        totalPayments: allPayments.filter((p: any) => p.status === "completed").length,
        pendingPayments: allPayments.filter((p: any) => p.status === "pending").length
      }
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generateDriverReport = () => {
    const report = {
      date: new Date().toLocaleDateString(),
      admin: adminProfile.fullName,
      totalDrivers: registeredDrivers.length,
      drivers: registeredDrivers.map((driver: any) => ({
        name: driver.fullName,
        email: driver.email,
        licenseNumber: driver.licenseNumber,
        eCardStatus: driver.eCardStatus,
        registrationDate: driver.registrationDate,
        trucks: driver.trucks || []
      })),
      summary: {
        activeECards: registeredDrivers.filter((d: any) => d.eCardStatus === "active").length,
        pendingECards: registeredDrivers.filter((d: any) => d.eCardStatus === "pending").length,
        totalTrucks: registeredDrivers.reduce((sum: number, driver: any) => 
          sum + (driver.trucks ? driver.trucks.length : 0), 0
        )
      }
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `driver-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generateECardReport = () => {
    const report = {
      date: new Date().toLocaleDateString(),
      admin: adminProfile.fullName,
      eCardStats,
      issuances: eCardIssuances,
      summary: {
        totalIssued: eCardIssuances.length,
        totalRevenue: eCardIssuances.reduce((sum: number, payment: any) => {
          const amount = parseInt(payment.amount.replace(/[^0-9]/g, ""))
          return sum + amount
        }, 0)
      }
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ecard-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleUserManagement = () => {
    const allUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
    const userReport = {
      date: new Date().toLocaleDateString(),
      admin: adminProfile.fullName,
      totalUsers: allUsers.length,
      users: allUsers.map((user: any) => ({
        name: user.fullName,
        email: user.email,
        role: user.role,
        registrationDate: user.registrationDate,
        status: user.status || "active"
      })),
      summary: {
        drivers: allUsers.filter((u: any) => u.role === "driver").length,
        borderAgents: allUsers.filter((u: any) => u.role === "border-agent").length,
        admins: allUsers.filter((u: any) => u.role === "admin").length
      }
    }
    
    const blob = new Blob([JSON.stringify(userReport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `user-management-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleRolePermissions = () => {
    const permissionsReport = {
      date: new Date().toLocaleDateString(),
      admin: adminProfile.fullName,
      roles: {
        driver: {
          permissions: [
            "Register trucks",
            "Make payments",
            "View E-card status",
            "Access driver dashboard"
          ],
          restrictions: [
            "Cannot access admin functions",
            "Cannot view other drivers' data"
          ]
        },
        "border-agent": {
          permissions: [
            "Scan E-cards",
            "Approve/reject crossings",
            "Generate daily reports",
            "Access border agent dashboard"
          ],
          restrictions: [
            "Cannot access admin functions",
            "Cannot modify system settings"
          ]
        },
        admin: {
          permissions: [
            "Full system access",
            "Manage users",
            "Generate reports",
            "Configure system settings",
            "Issue E-cards manually"
          ],
          restrictions: [
            "No restrictions"
          ]
        }
      }
    }
    
    const blob = new Blob([JSON.stringify(permissionsReport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `role-permissions-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!adminProfile) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Admin Dashboard</h1>
            <p className="text-gray-600">Ministry of Transport & Safety Administration</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="default">
              <Settings className="h-4 w-4 mr-1" />
              Admin Access
            </Badge>
            {/* Update the Profile button click handler */}
            <Button variant="outline" onClick={() => setShowProfileModal(true)}>
              <Users className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Registered Drivers</p>
                  <p className="text-2xl font-bold">{registeredDrivers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold">{pendingRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue Today</p>
                  <p className="text-2xl font-bold">K{revenueData.today.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">E-Cards Issued</p>
                  <p className="text-2xl font-bold">{eCardStats.totalIssued}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="ecards">E-Cards</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="monitor">Live Monitor</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Driver Requests</CardTitle>
                <CardDescription>Review and process driver service requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead>Request Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.length > 0 ? (
                      pendingRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.driverName}</TableCell>
                          <TableCell className="capitalize">{request.type.replace("-", " ")}</TableCell>
                          <TableCell>{request.amount}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                request.status === "completed"
                                  ? "default"
                                  : request.status === "rejected"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {request.status === "pending" && (
                              <div className="flex space-x-2">
                                <Button size="sm" onClick={() => handleApproveRequest(request.id)}>
                                  Approve
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleRejectRequest(request.id)}>
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No pending requests at the moment.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Configure payment options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>MTN Mobile Money</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Airtel Money</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Zamtel Kwacha</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Visa/Mastercard</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Fees</CardTitle>
                  <CardDescription>Current service pricing (read-only)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>E-Card Fee</Label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <span className="font-semibold">K500</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Road Tax</Label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <span className="font-semibold">K1,200</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Insurance</Label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <span className="font-semibold">K2,500</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>License Renewal</Label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <span className="font-semibold">K800</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-4">
                    <p>Service fees are fixed and cannot be modified through this interface.</p>
                    <p>Contact system administrator for fee updates.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Summary</CardTitle>
                  <CardDescription>Today's revenue breakdown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>E-Card Sales:</span>
                    <span className="font-semibold">K{revenueData.eCardSales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Road Tax:</span>
                    <span className="font-semibold">K{revenueData.roadTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>License Renewals:</span>
                    <span className="font-semibold">K{revenueData.licenseRenewals.toLocaleString()}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>K{revenueData.today.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ecards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>E-Card Statistics</CardTitle>
                  <CardDescription>Overview of issued E-Cards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Issued:</span>
                    <span className="font-semibold">{eCardStats.totalIssued}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Cards:</span>
                    <span className="font-semibold text-green-600">{eCardStats.activeCards}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expired Cards:</span>
                    <span className="font-semibold text-red-600">{eCardStats.expiredCards}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Issuance:</span>
                    <span className="font-semibold text-yellow-600">{eCardStats.pendingIssuance}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Issue New E-Card</CardTitle>
                  <CardDescription>Manually issue E-Card to driver</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="driver-license">Driver License Number</Label>
                    <Input 
                      id="driver-license" 
                      placeholder="Enter license number"
                      value={manualIssueData.driverLicense}
                      onChange={(e) => setManualIssueData(prev => ({ ...prev, driverLicense: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment-ref">Payment Reference</Label>
                    <Input 
                      id="payment-ref" 
                      placeholder="Payment confirmation"
                      value={manualIssueData.paymentRef}
                      onChange={(e) => setManualIssueData(prev => ({ ...prev, paymentRef: e.target.value }))}
                    />
                  </div>
                  <Button className="w-full" onClick={handleManualIssueECard}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Issue E-Card
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <PaymentAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="monitor" className="space-y-6">
            <RealTimePaymentMonitor />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Revenue Report
                  </CardTitle>
                  <CardDescription>Generate revenue analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={generateRevenueReport}>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Driver Report
                  </CardTitle>
                  <CardDescription>Driver registration analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={generateDriverReport}>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    E-Card Report
                  </CardTitle>
                  <CardDescription>E-Card issuance analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={generateECardReport}>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                  <CardDescription>Configure system-wide settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="system-name">System Name</Label>
                    <Input id="system-name" value="E-Truck Transport System" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <Input id="admin-email" value="admin@transport.gov.zm" />
                  </div>
                  <Button>Save Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage system users and permissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full bg-transparent" variant="outline" onClick={handleUserManagement}>
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button className="w-full bg-transparent" variant="outline" onClick={handleRolePermissions}>
                    <Settings className="h-4 w-4 mr-2" />
                    Role Permissions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {/* Add ProfileModal component before the closing div */}
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} userRole="admin" />
    </div>
  )
}
