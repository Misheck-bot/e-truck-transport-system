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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Truck, ArrowLeft, CheckCircle, LogIn, Eye, EyeOff, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  validateZambianPhone,
  validateZambianLicense,
  validateEmail,
  validateName,
  validateDate,
  validateLicenseExpiry,
  type ValidationResult,
} from "@/utils/validation"

export default function DriverRegistration() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("register")
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})

  // Registration form data
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    licenseNumber: "",
    licenseExpiry: "",
    dateOfBirth: "",
    address: "",
    company: "",
    experience: "",
    emergencyContact: "",
    emergencyPhone: "",
  })

  // Login form data
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleLoginInputChange = (field: string, value: string) => {
    setLoginData((prev) => ({ ...prev, [field]: value }))
  }

  const validateField = (field: string, value: string): ValidationResult => {
    switch (field) {
      case "fullName":
      case "emergencyContact":
        return validateName(value)
      case "email":
        return validateEmail(value)
      case "password":
        return value.length >= 6 ? { isValid: true, message: "" } : { isValid: false, message: "Password must be at least 6 characters long" }
      case "phone":
      case "emergencyPhone":
        return validateZambianPhone(value)
      case "licenseNumber":
        return validateZambianLicense(value)
      case "dateOfBirth":
        return validateDate(value, "date of birth")
      case "licenseExpiry":
        return validateLicenseExpiry(value)
      default:
        return { isValid: true, message: "" }
    }
  }

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {}

    // Validate all required fields
    const fieldsToValidate = [
      "fullName",
      "email",
      "password",
      "phone",
      "licenseNumber",
      "licenseExpiry",
      "dateOfBirth",
      "emergencyContact",
      "emergencyPhone",
    ]

    fieldsToValidate.forEach((field) => {
      const value = formData[field as keyof typeof formData]
      if (!value.trim()) {
        errors[field] = `${field.replace(/([A-Z])/g, " $1").toLowerCase()} is required`
        return
      }

      const validation = validateField(field, value)
      if (!validation.isValid) {
        errors[field] = validation.message
      }
    })

    // Additional validations
    if (!formData.address.trim()) {
      errors.address = "Address is required"
    }

    if (!formData.experience) {
      errors.experience = "Experience level is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Store driver data in localStorage
      const driverData = {
        ...formData,
        role: "driver",
        registrationDate: new Date().toISOString(),
        eCardStatus: "pending",
        trucks: [],
        payments: [],
      }

      // Save to current user
      localStorage.setItem("currentUser", JSON.stringify(driverData))
      localStorage.setItem("userRole", "driver")

      // Save to registered users registry
      const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
      existingUsers.push(driverData)
      localStorage.setItem("registeredUsers", JSON.stringify(existingUsers))

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirect to driver dashboard
      router.push("/dashboard/driver")
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
          u.role === "driver" &&
          u.password === loginData.password,
      )

      if (user) {
        // Set current user
        localStorage.setItem("currentUser", JSON.stringify(user))
        localStorage.setItem("userRole", "driver")

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Redirect to driver dashboard
        router.push("/dashboard/driver")
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

  const renderFieldError = (fieldName: string) => {
    if (validationErrors[fieldName]) {
      return (
        <Alert className="mt-2 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700 text-sm">{validationErrors[fieldName]}</AlertDescription>
        </Alert>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
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
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Driver Access</CardTitle>
              <CardDescription>Register as a new driver or login to your existing account</CardDescription>
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
                            className={validationErrors.fullName ? "border-red-500" : ""}
                            placeholder="Enter your full legal name"
                            required
                          />
                          {renderFieldError("fullName")}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className={validationErrors.email ? "border-red-500" : ""}
                            placeholder="your.email@example.com"
                            required
                          />
                          {renderFieldError("email")}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password *</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={(e) => handleInputChange("password", e.target.value)}
                              className={validationErrors.password ? "border-red-500" : ""}
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
                          {renderFieldError("password")}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            className={validationErrors.phone ? "border-red-500" : ""}
                            placeholder="0977123456 or +260977123456"
                            required
                          />
                          {renderFieldError("phone")}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                            className={validationErrors.dateOfBirth ? "border-red-500" : ""}
                            required
                          />
                          {renderFieldError("dateOfBirth")}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address *</Label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          className={validationErrors.address ? "border-red-500" : ""}
                          placeholder="Enter your full residential address"
                          required
                        />
                        {renderFieldError("address")}
                      </div>
                    </div>

                    {/* License Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">License Information</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="licenseNumber">License Number *</Label>
                          <Input
                            id="licenseNumber"
                            value={formData.licenseNumber}
                            onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                            className={validationErrors.licenseNumber ? "border-red-500" : ""}
                            placeholder="DL12345678"
                            required
                          />
                          {renderFieldError("licenseNumber")}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="licenseExpiry">License Expiry Date *</Label>
                          <Input
                            id="licenseExpiry"
                            type="date"
                            value={formData.licenseExpiry}
                            onChange={(e) => handleInputChange("licenseExpiry", e.target.value)}
                            className={validationErrors.licenseExpiry ? "border-red-500" : ""}
                            required
                          />
                          {renderFieldError("licenseExpiry")}
                        </div>
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Professional Information</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company">Company/Employer</Label>
                          <Input
                            id="company"
                            value={formData.company}
                            onChange={(e) => handleInputChange("company", e.target.value)}
                            placeholder="Transport Company Ltd."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="experience">Years of Experience *</Label>
                          <Select onValueChange={(value) => handleInputChange("experience", value)}>
                            <SelectTrigger className={validationErrors.experience ? "border-red-500" : ""}>
                              <SelectValue placeholder="Select experience" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-2">1-2 years</SelectItem>
                              <SelectItem value="3-5">3-5 years</SelectItem>
                              <SelectItem value="6-10">6-10 years</SelectItem>
                              <SelectItem value="10+">10+ years</SelectItem>
                            </SelectContent>
                          </Select>
                          {renderFieldError("experience")}
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Emergency Contact</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContact">Emergency Contact Name *</Label>
                          <Input
                            id="emergencyContact"
                            value={formData.emergencyContact}
                            onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                            className={validationErrors.emergencyContact ? "border-red-500" : ""}
                            placeholder="Full name of emergency contact"
                            required
                          />
                          {renderFieldError("emergencyContact")}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergencyPhone">Emergency Contact Phone *</Label>
                          <Input
                            id="emergencyPhone"
                            value={formData.emergencyPhone}
                            onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                            className={validationErrors.emergencyPhone ? "border-red-500" : ""}
                            placeholder="0977123456 or +260977123456"
                            required
                          />
                          {renderFieldError("emergencyPhone")}
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
                      <h3 className="text-lg font-semibold mb-2">Welcome Back, Driver!</h3>
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
                            Access Driver Dashboard
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
