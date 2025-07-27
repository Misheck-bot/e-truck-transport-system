"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Truck,
  CreditCard,
  FileText,
  Shield,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  Plus,
  AlertCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ProfileModal } from "@/components/profile-modal"
import PaymentModal from "@/components/payment-modal"

interface DriverProfile {
  fullName: string
  email: string
  phone: string
  eCardStatus: string
  trucks: any[]
  licenseNumber: string
  licenseExpiry: string
  company?: string
  role: string
  registrationDate: string
  payments?: any[]
  eCardIssueDate?: string
}

export default function DriverDashboard() {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [paymentType, setPaymentType] = useState("")
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      const userData = localStorage.getItem("currentUser")
      if (userData) {
        const user = JSON.parse(userData)
        if (!user.trucks) {
          user.trucks = []
        }
        if (!user.payments) {
          user.payments = []
        }
        setDriverProfile(user)
      } else {
        router.push("/dashboard/driver/register")
        return
      }
      setLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [router])

  const refreshProfile = () => {
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      const user = JSON.parse(userData)
      if (!user.trucks) user.trucks = []
      if (!user.payments) user.payments = []
      setDriverProfile(user)
    }
  }

  useEffect(() => {
    const handleFocus = () => {
      refreshProfile()
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!driverProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p>Redirecting to registration...</p>
        </div>
      </div>
    )
  }

  const handlePayment = (type: string) => {
    setPaymentType(type)
    setShowPaymentModal(true)
  }

  const getPaymentAmount = (type: string) => {
    switch (type) {
      case "ecard":
        return "K500"
      case "road-tax":
        return "K1,200"
      case "insurance":
        return "K2,500"
      case "license-renewal":
        return "K800"
      default:
        return "K0"
    }
  }

  const handlePaymentSuccess = () => {
    refreshProfile()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
            <p className="text-gray-600">Welcome back, {driverProfile.fullName}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={driverProfile.eCardStatus === "active" ? "default" : "destructive"}>
              E-Card: {driverProfile.eCardStatus}
            </Badge>
            <Button variant="outline" onClick={() => setShowProfileModal(true)}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>

        {/* E-Card Alert */}
        {driverProfile.eCardStatus === "pending" && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="font-semibold text-yellow-800">E-Card Required</p>
                  <p className="text-sm text-yellow-700">
                    You need an active E-Card for border crossings. Get yours now for K500.
                  </p>
                </div>
                <Button className="ml-auto" size="sm" onClick={() => handlePayment("ecard")}>
                  Get E-Card
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Trucks Registered</p>
                  <p className="text-2xl font-bold">{driverProfile.trucks?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">License Status</p>
                  <p className="text-2xl font-bold text-green-600">Valid</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold">{driverProfile.payments?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">E-Card</p>
                  <p
                    className={`text-2xl font-bold ${driverProfile.eCardStatus === "active" ? "text-green-600" : "text-red-600"}`}
                  >
                    {driverProfile.eCardStatus === "active" ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="trucks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="trucks">My Trucks</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="license">License</TabsTrigger>
            <TabsTrigger value="ecard">E-Card</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
          </TabsList>

          <TabsContent value="trucks" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Trucks</h2>
              <Link href="/dashboard/driver/truck-registration">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Register New Truck
                </Button>
              </Link>
            </div>

            {driverProfile.trucks && driverProfile.trucks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {driverProfile.trucks.map((truck: any, index: number) => (
                  <Card key={truck.id || index}>
                    <CardHeader>
                      <CardTitle>
                        {truck.plateNumber} - {truck.make} {truck.model}
                      </CardTitle>
                      <CardDescription>
                        {truck.year} - {truck.purpose}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Registration:</span>
                          <Badge variant={truck.registrationValid ? "default" : "destructive"}>
                            {truck.registrationValid ? "Valid" : "Expired"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Insurance:</span>
                          <Badge variant={truck.insuranceValid ? "default" : "destructive"}>
                            {truck.insuranceValid ? "Active" : "Expired"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Road Tax:</span>
                          <Badge variant={truck.roadTaxPaid ? "default" : "destructive"}>
                            {truck.roadTaxPaid ? "Paid" : "Unpaid"}
                          </Badge>
                        </div>
                      </div>
                      <Button className="w-full mt-4 bg-transparent" variant="outline">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Trucks Registered</h3>
                  <p className="text-gray-600 mb-4">
                    You haven't registered any trucks yet. Click the button above to register your first truck.
                  </p>
                  <Link href="/dashboard/driver/truck-registration">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Register Your First Truck
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <h2 className="text-2xl font-bold">Payments & Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Road Tax
                  </CardTitle>
                  <CardDescription>Pay annual road tax for your trucks</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold mb-4">K1,200</p>
                  <Button className="w-full" onClick={() => handlePayment("road-tax")}>
                    Pay Road Tax
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Insurance
                  </CardTitle>
                  <CardDescription>Renew your truck insurance</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold mb-4">K2,500</p>
                  <Button className="w-full" onClick={() => handlePayment("insurance")}>
                    Pay Insurance
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    E-Card
                  </CardTitle>
                  <CardDescription>Get or renew your digital E-Card</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold mb-4">K500</p>
                  <Button
                    className="w-full"
                    onClick={() => handlePayment("ecard")}
                    disabled={driverProfile.eCardStatus === "active"}
                  >
                    {driverProfile.eCardStatus === "active" ? "E-Card Active" : "Get E-Card"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="license" className="space-y-6">
            <h2 className="text-2xl font-bold">License Management</h2>
            <Card>
              <CardHeader>
                <CardTitle>Driving License</CardTitle>
                <CardDescription>Manage your driving license and renewals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>License Number</Label>
                    <Input value={driverProfile.licenseNumber || ""} readOnly />
                  </div>
                  <div>
                    <Label>Expiry Date</Label>
                    <Input value={driverProfile.licenseExpiry || ""} readOnly />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-600">License is valid</span>
                </div>
                <Button onClick={() => handlePayment("license-renewal")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Renew License
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ecard" className="space-y-6">
            <h2 className="text-2xl font-bold">E-Card Management</h2>
            <Card>
              <CardHeader>
                <CardTitle>Digital E-Card</CardTitle>
                <CardDescription>Your digital identification for border crossings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {driverProfile.eCardStatus === "active" ? (
                  <>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{driverProfile.fullName}</h3>
                          <p className="opacity-90">Professional Driver</p>
                        </div>
                        <CreditCard className="h-8 w-8" />
                      </div>
                      <div className="space-y-2">
                        <p>
                          <span className="opacity-75">License:</span> {driverProfile.licenseNumber}
                        </p>
                        <p>
                          <span className="opacity-75">Card ID:</span> EC{Math.random().toString().substr(2, 8)}
                        </p>
                        <p>
                          <span className="opacity-75">Issued:</span>{" "}
                          {driverProfile.eCardIssueDate ? formatDate(driverProfile.eCardIssueDate) : "N/A"}
                        </p>
                        <p>
                          <span className="opacity-75">Valid Until:</span> Dec 2025
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-600">E-Card is active and valid</span>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800 font-semibold">📍 Collect Physical Card</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Visit the nearest RTSA office to collect your physical E-Card using your digital confirmation.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active E-Card</h3>
                    <p className="text-gray-600 mb-4">
                      You need an E-Card for border crossings. Get yours now for K500.
                    </p>
                    <Button onClick={() => handlePayment("ecard")}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Get E-Card Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <h2 className="text-2xl font-bold">Payment History</h2>
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your payment history and transaction records</CardDescription>
              </CardHeader>
              <CardContent>
                {driverProfile.payments && driverProfile.payments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {driverProfile.payments.map((payment: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(payment.date)}</TableCell>
                          <TableCell className="capitalize">{payment.type.replace("-", " ")}</TableCell>
                          <TableCell className="font-semibold">{payment.amount}</TableCell>
                          <TableCell className="capitalize">{payment.method}</TableCell>
                          <TableCell>
                            <Badge variant="default">{payment.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Payment History</h3>
                    <p className="text-gray-600">Your payment transactions will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentType={paymentType}
        amount={getPaymentAmount(paymentType)}
        onSuccess={handlePaymentSuccess}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userRole="driver"
      />
    </div>
  )
}
