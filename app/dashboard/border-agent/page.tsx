"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, Scan, Search, CheckCircle, AlertTriangle, User, Truck, FileText, Camera } from "lucide-react"
import { useRouter } from "next/navigation"
import { ProfileModal } from "@/components/profile-modal"

export default function BorderAgentDashboard() {
  const [scanResult, setScanResult] = useState<any>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [agentProfile, setAgentProfile] = useState<any>(null)
  const [crossings, setCrossings] = useState<any[]>([])
  const [dailyStats, setDailyStats] = useState({
    approvalsToday: 0,
    pendingReviews: 0,
    scannedCards: 0,
    trucksProcessed: 0
  })
  const router = useRouter()
  const [showProfileModal, setShowProfileModal] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("currentUser")
    if (userData) {
      const agent = JSON.parse(userData)
      setAgentProfile(agent)
      
      // Load crossings data from localStorage
      const storedCrossings = JSON.parse(localStorage.getItem("borderCrossings") || "[]")
      setCrossings(storedCrossings)
      
      // Calculate daily stats
      const today = new Date().toDateString()
      const todayCrossings = storedCrossings.filter((crossing: any) => 
        new Date(crossing.timestamp).toDateString() === today
      )
      
      setDailyStats({
        approvalsToday: todayCrossings.filter((c: any) => c.status === "Approved").length,
        pendingReviews: todayCrossings.filter((c: any) => c.status === "Pending").length,
        scannedCards: todayCrossings.length,
        trucksProcessed: todayCrossings.length
      })
    } else {
      router.push("/dashboard/border-agent/register")
    }
  }, [])

  if (!agentProfile) {
    return <div>Loading...</div>
  }

  const mockDriverData = {
    name: "John Doe",
    licenseNumber: "DL123456789",
    eCardId: "EC12345678",
    company: "Swift Transport Ltd",
    truckPlate: "ABC123ZM",
    licenseValid: true,
    insuranceValid: true,
    roadTaxPaid: true,
    lastCrossing: "2024-01-15",
    goods: [
      { item: "Electronics", quantity: "50 boxes", weight: "2000kg" },
      { item: "Textiles", quantity: "100 bales", weight: "1500kg" },
    ],
  }

  const handleScanECard = async () => {
    setIsScanning(true)
    setScanResult(null)
    
    // Simulate scanning process
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Simulate successful scan
    setScanResult(mockDriverData)
    setIsScanning(false)
  }

  const handleApproveCrossing = (driverData: any) => {
    const crossing = {
      id: Date.now(),
      driver: driverData.name,
      truck: driverData.truckPlate,
      time: new Date().toLocaleTimeString(),
      status: "Approved",
      timestamp: new Date().toISOString(),
      agentId: agentProfile.employeeId,
      agentName: agentProfile.fullName,
      licenseNumber: driverData.licenseNumber,
      eCardId: driverData.eCardId,
      company: driverData.company
    }
    
    const updatedCrossings = [crossing, ...crossings]
    setCrossings(updatedCrossings)
    localStorage.setItem("borderCrossings", JSON.stringify(updatedCrossings))
    
    // Update daily stats
    setDailyStats(prev => ({
      ...prev,
      approvalsToday: prev.approvalsToday + 1,
      scannedCards: prev.scannedCards + 1,
      trucksProcessed: prev.trucksProcessed + 1
    }))
    
    setScanResult(null)
  }

  const handleRejectCrossing = (driverData: any) => {
    const crossing = {
      id: Date.now(),
      driver: driverData.name,
      truck: driverData.truckPlate,
      time: new Date().toLocaleTimeString(),
      status: "Rejected",
      timestamp: new Date().toISOString(),
      agentId: agentProfile.employeeId,
      agentName: agentProfile.fullName,
      licenseNumber: driverData.licenseNumber,
      eCardId: driverData.eCardId,
      company: driverData.company
    }
    
    const updatedCrossings = [crossing, ...crossings]
    setCrossings(updatedCrossings)
    localStorage.setItem("borderCrossings", JSON.stringify(updatedCrossings))
    
    // Update daily stats
    setDailyStats(prev => ({
      ...prev,
      scannedCards: prev.scannedCards + 1,
      trucksProcessed: prev.trucksProcessed + 1
    }))
    
    setScanResult(null)
  }

  const generateDailyReport = () => {
    const today = new Date().toDateString()
    const todayCrossings = crossings.filter((crossing: any) => 
      new Date(crossing.timestamp).toDateString() === today
    )
    
    const report = {
      date: new Date().toLocaleDateString(),
      agent: agentProfile.fullName,
      borderPost: agentProfile.borderPost,
      totalCrossings: todayCrossings.length,
      approved: todayCrossings.filter((c: any) => c.status === "Approved").length,
      rejected: todayCrossings.filter((c: any) => c.status === "Rejected").length,
      pending: todayCrossings.filter((c: any) => c.status === "Pending").length,
      crossings: todayCrossings
    }
    
    // Create and download report
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `daily-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generateMonthlyReport = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthCrossings = crossings.filter((crossing: any) => {
      const crossingDate = new Date(crossing.timestamp)
      return crossingDate.getMonth() === currentMonth && crossingDate.getFullYear() === currentYear
    })
    
    const report = {
      month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      agent: agentProfile.fullName,
      borderPost: agentProfile.borderPost,
      totalCrossings: monthCrossings.length,
      approved: monthCrossings.filter((c: any) => c.status === "Approved").length,
      rejected: monthCrossings.filter((c: any) => c.status === "Rejected").length,
      pending: monthCrossings.filter((c: any) => c.status === "Pending").length,
      crossings: monthCrossings
    }
    
    // Create and download report
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `monthly-report-${new Date().toISOString().slice(0, 7)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Remove the dummy recentCrossings data - we'll use real data from state

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Border Agent Dashboard</h1>
            <p className="text-gray-600">Verify drivers and manage border crossings</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="default">
              <Shield className="h-4 w-4 mr-1" />
              Agent Active
            </Badge>
            <Button variant="outline" onClick={() => setShowProfileModal(true)}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Approvals</p>
                  <p className="text-2xl font-bold">{dailyStats.approvalsToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                  <p className="text-2xl font-bold">{dailyStats.pendingReviews}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Scan className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">E-Cards Scanned</p>
                  <p className="text-2xl font-bold">{dailyStats.scannedCards}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Trucks Processed</p>
                  <p className="text-2xl font-bold">{dailyStats.trucksProcessed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="scan" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scan">E-Card Scanner</TabsTrigger>
            <TabsTrigger value="verify">Driver Verification</TabsTrigger>
            <TabsTrigger value="crossings">Recent Crossings</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Scan className="h-5 w-5 mr-2" />
                    E-Card Scanner
                  </CardTitle>
                  <CardDescription>Scan driver's E-Card to verify credentials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      {isScanning ? "Waiting for scan..." : "Position E-Card in front of scanner"}
                    </p>
                    <Button 
                      onClick={handleScanECard} 
                      size="lg" 
                      disabled={isScanning}
                      className={isScanning ? "bg-blue-600" : ""}
                    >
                      {isScanning ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Scanning...
                        </>
                      ) : (
                        <>
                          <Scan className="h-4 w-4 mr-2" />
                          Scan E-Card
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {scanResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      Scan Result
                    </CardTitle>
                    <CardDescription>Driver information retrieved</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Driver Name</Label>
                        <p className="font-semibold">{scanResult.name}</p>
                      </div>
                      <div>
                        <Label>License Number</Label>
                        <p className="font-semibold">{scanResult.licenseNumber}</p>
                      </div>
                      <div>
                        <Label>Company</Label>
                        <p className="font-semibold">{scanResult.company}</p>
                      </div>
                      <div>
                        <Label>Truck Plate</Label>
                        <p className="font-semibold">{scanResult.truckPlate}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>License Valid:</span>
                        <Badge variant={scanResult.licenseValid ? "default" : "destructive"}>
                          {scanResult.licenseValid ? "Valid" : "Invalid"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Insurance:</span>
                        <Badge variant={scanResult.insuranceValid ? "default" : "destructive"}>
                          {scanResult.insuranceValid ? "Active" : "Expired"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Road Tax:</span>
                        <Badge variant={scanResult.roadTaxPaid ? "default" : "destructive"}>
                          {scanResult.roadTaxPaid ? "Paid" : "Unpaid"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        className="flex-1" 
                        variant="default"
                        onClick={() => handleApproveCrossing(scanResult)}
                      >
                        Approve Crossing
                      </Button>
                      <Button 
                        className="flex-1" 
                        variant="destructive"
                        onClick={() => handleRejectCrossing(scanResult)}
                      >
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {scanResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Cargo Information</CardTitle>
                  <CardDescription>Goods being transported</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Weight</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scanResult.goods.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{item.item}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.weight}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="verify" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Driver Verification</CardTitle>
                <CardDescription>Search and verify driver credentials manually</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter license number or E-Card ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crossings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Border Crossings</CardTitle>
                <CardDescription>Track recent driver crossings and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead>Truck</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {crossings.length > 0 ? (
                      crossings.slice(0, 10).map((crossing) => (
                        <TableRow key={crossing.id}>
                          <TableCell>{crossing.driver}</TableCell>
                          <TableCell>{crossing.truck}</TableCell>
                          <TableCell>{crossing.time}</TableCell>
                          <TableCell>
                            <Badge variant={crossing.status === "Approved" ? "default" : crossing.status === "Rejected" ? "destructive" : "secondary"}>
                              {crossing.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No crossings recorded yet. Scan an E-Card to start tracking crossings.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Report</CardTitle>
                  <CardDescription>Generate daily crossing report</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={generateDailyReport}>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Daily Report
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Summary</CardTitle>
                  <CardDescription>Generate monthly summary report</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={generateMonthlyReport}>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Monthly Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} userRole="border-agent" />
    </div>
  )
}
