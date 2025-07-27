"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, ArrowLeft, CheckCircle, LogIn, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AdminRegistration() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("register")

  // Registration form data
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    employeeId: "",
    department: "",
    position: "",
    dateOfBirth: "",
    address: "",
    supervisor: "",
    supervisorPhone: "",
    accessLevel: "",
    startDate: "",
    ministry: "",
  })

  // Login form data
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLoginInputChange = (field: string, value: string) => {
    setLoginData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const adminData = {
        ...formData,
        role: "admin",
        registrationDate: new Date().toISOString(),
        status: "active",
        totalDrivers: 0,
        pendingRequests: 0,
        revenueToday: 0,
        eCardsIssued: 0,
      }

      localStorage.setItem("currentUser", JSON.stringify(adminData))
      localStorage.setItem("userRole", "admin")

      // Save to registered users registry
      const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
      existingUsers.push(adminData)
      localStorage.setItem("registeredUsers", JSON.stringify(existingUsers))

      await new Promise((resolve) => setTimeout(resolve, 2000))
      router.push("/dashboard/admin")
    } catch (error) {
      console.error("Registration failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Check if user exists in registered users
      const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
      const user = existingUsers.find(
        (u: any) =>
          u.email.toLowerCase() === loginData.email.toLowerCase() &&
          u.role === "admin" &&
          u.password === loginData.password,
      )

      if (user) {
        // Set current user
        localStorage.setItem("currentUser", JSON.stringify(user))
        localStorage.setItem("userRole", "admin")

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Redirect to admin dashboard
        router.push("/dashboard/admin")
      } else {
        alert("Invalid credentials. Please check your email and password.")
      }
    } catch (error) {
      console.error("Login failed:", error)
      alert("Login failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">System Admin Access</CardTitle>
              <CardDescription>
                Register as a new system administrator or login to your existing account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="register">New Registration</TabsTrigger>
                  <TabsTrigger value="login">Already Registered</TabsTrigger>
                </TabsList>

                <TabsContent value="register">
                  <form onSubmit={handleRegistration} className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name *</Label>
                          <Input
                            id="fullName"
                            value={formData.fullName}
                            onChange={(e) => handleInputChange("fullName", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Official Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            placeholder="name@transport.gov.zm"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password *</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={(e) => handleInputChange("password", e.target.value)}
                              placeholder="Enter your password (min 6 characters)"
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            placeholder="+260 XXX XXX XXX"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address *</Label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          placeholder="Enter your full address"
                          required
                        />
                      </div>
                    </div>

                    {/* Official Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Official Information</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="employeeId">Employee ID *</Label>
                          <Input
                            id="employeeId"
                            value={formData.employeeId}
                            onChange={(e) => handleInputChange("employeeId", e.target.value)}
                            placeholder="MOT123456"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ministry">Ministry/Department *</Label>
                          <Select onValueChange={(value) => handleInputChange("ministry", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ministry" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="transport">Ministry of Transport</SelectItem>
                              <SelectItem value="safety">Ministry of Safety</SelectItem>
                              <SelectItem value="transport-safety">Ministry of Transport & Safety</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Department *</Label>
                          <Select onValueChange={(value) => handleInputChange("department", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="licensing">Licensing Department</SelectItem>
                              <SelectItem value="registration">Vehicle Registration</SelectItem>
                              <SelectItem value="enforcement">Traffic Enforcement</SelectItem>
                              <SelectItem value="it">IT Department</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="position">Position/Title *</Label>
                          <Input
                            id="position"
                            value={formData.position}
                            onChange={(e) => handleInputChange("position", e.target.value)}
                            placeholder="Senior Administrator"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Start Date *</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => handleInputChange("startDate", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="accessLevel">System Access Level *</Label>
                          <Select onValueChange={(value) => handleInputChange("accessLevel", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select access level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full">Full Administrator</SelectItem>
                              <SelectItem value="limited">Limited Administrator</SelectItem>
                              <SelectItem value="supervisor">Supervisor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Supervision */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Supervision</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="supervisor">Direct Supervisor *</Label>
                          <Input
                            id="supervisor"
                            value={formData.supervisor}
                            onChange={(e) => handleInputChange("supervisor", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="supervisorPhone">Supervisor Phone *</Label>
                          <Input
                            id="supervisorPhone"
                            value={formData.supervisorPhone}
                            onChange={(e) => handleInputChange("supervisorPhone", e.target.value)}
                            placeholder="+260 XXX XXX XXX"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Registering...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete Registration
                        </>
                      )}
                    </Button>

                    <div className="text-center text-sm text-gray-600">
                      <p>Please remember your email and password for future login</p>
                      <p>You can change your password after logging in to your dashboard</p>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="login">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">Welcome Back, Administrator!</h3>
                      <p className="text-gray-600">Enter your credentials to access your dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="loginEmail">Email Address *</Label>
                        <Input
                          id="loginEmail"
                          type="email"
                          value={loginData.email}
                          onChange={(e) => handleLoginInputChange("email", e.target.value)}
                          placeholder="Enter your email address"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="loginPassword">Password *</Label>
                        <div className="relative">
                          <Input
                            id="loginPassword"
                            type={showPassword ? "text" : "password"}
                            value={loginData.password}
                            onChange={(e) => handleLoginInputChange("password", e.target.value)}
                            placeholder="Enter your password"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Signing In...
                          </>
                        ) : (
                          <>
                            <LogIn className="h-4 w-4 mr-2" />
                            Access Admin Dashboard
                          </>
                        )}
                      </Button>
                    </form>

                    <div className="text-center text-sm text-gray-500">
                      <p>Use the email and password you set during registration</p>
                      <p>Don't have an account? Switch to "New Registration" tab above</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
