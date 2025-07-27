"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Truck, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  validateZambianPlate,
  validateEngineNumber,
  validateChassisNumber,
  validateWeight,
  type ValidationResult,
} from "@/utils/validation"

export default function TruckRegistration() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState({
    plateNumber: "",
    make: "",
    model: "",
    year: "",
    engineNumber: "",
    chassisNumber: "",
    color: "",
    fuelType: "",
    grossWeight: "",
    netWeight: "",
    dimensions: "",
    insuranceCompany: "",
    insurancePolicy: "",
    insuranceExpiry: "",
    registrationExpiry: "",
    roadTaxExpiry: "",
    purpose: "",
    notes: "",
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

  const validateField = (field: string, value: string): ValidationResult => {
    switch (field) {
      case "plateNumber":
        return validateZambianPlate(value)
      case "engineNumber":
        return validateEngineNumber(value)
      case "chassisNumber":
        return validateChassisNumber(value)
      case "grossWeight":
        return validateWeight(value, "gross")
      case "netWeight":
        return validateWeight(value, "net")
      case "year":
        const currentYear = new Date().getFullYear()
        const year = Number.parseInt(value)
        if (isNaN(year) || year < 1990 || year > currentYear + 1) {
          return {
            isValid: false,
            message: `Year must be between 1990 and ${currentYear + 1}`,
          }
        }
        return { isValid: true, message: "Valid year" }
      case "insurancePolicy":
        if (value.length < 5) {
          return {
            isValid: false,
            message: "Insurance policy number must be at least 5 characters",
          }
        }
        return { isValid: true, message: "Valid policy number" }
      default:
        return { isValid: true, message: "" }
    }
  }

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {}

    // Required fields validation
    const requiredFields = [
      "plateNumber",
      "make",
      "model",
      "year",
      "engineNumber",
      "chassisNumber",
      "color",
      "fuelType",
      "grossWeight",
      "netWeight",
      "dimensions",
      "insuranceCompany",
      "insurancePolicy",
      "insuranceExpiry",
      "registrationExpiry",
      "roadTaxExpiry",
      "purpose",
    ]

    requiredFields.forEach((field) => {
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

    // Cross-validation: net weight should be less than gross weight
    if (formData.grossWeight && formData.netWeight) {
      const gross = Number.parseFloat(formData.grossWeight)
      const net = Number.parseFloat(formData.netWeight)
      if (!isNaN(gross) && !isNaN(net) && net >= gross) {
        errors.netWeight = "Net weight must be less than gross weight"
      }
    }

    // Date validations
    const today = new Date()
    const insuranceExpiry = new Date(formData.insuranceExpiry)
    const registrationExpiry = new Date(formData.registrationExpiry)
    const roadTaxExpiry = new Date(formData.roadTaxExpiry)

    if (formData.insuranceExpiry && insuranceExpiry <= today) {
      errors.insuranceExpiry = "Insurance expiry must be in the future"
    }

    if (formData.registrationExpiry && registrationExpiry <= today) {
      errors.registrationExpiry = "Registration expiry must be in the future"
    }

    if (formData.roadTaxExpiry && roadTaxExpiry <= today) {
      errors.roadTaxExpiry = "Road tax expiry must be in the future"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Get current user data
      const userData = localStorage.getItem("currentUser")
      if (!userData) {
        router.push("/dashboard/driver/register")
        return
      }

      const user = JSON.parse(userData)

      // Create new truck object
      const newTruck = {
        id: Date.now().toString(),
        ...formData,
        registrationDate: new Date().toISOString(),
        registrationValid: new Date(formData.registrationExpiry) > new Date(),
        insuranceValid: new Date(formData.insuranceExpiry) > new Date(),
        roadTaxPaid: new Date(formData.roadTaxExpiry) > new Date(),
        status: "active",
      }

      // Add truck to user's trucks array
      if (!user.trucks) {
        user.trucks = []
      }
      user.trucks.push(newTruck)

      // Update localStorage
      localStorage.setItem("currentUser", JSON.stringify(user))

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirect back to driver dashboard
      router.push("/dashboard/driver")
    } catch (error) {
      console.error("Truck registration failed:", error)
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
          <Link href="/dashboard/driver">
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
              <CardTitle className="text-2xl">Register New Truck</CardTitle>
              <CardDescription>Add a new truck to your fleet and manage its documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="plateNumber">Plate Number *</Label>
                      <Input
                        id="plateNumber"
                        value={formData.plateNumber}
                        onChange={(e) => handleInputChange("plateNumber", e.target.value)}
                        className={validationErrors.plateNumber ? "border-red-500" : ""}
                        placeholder="ABC123ZM or ABC1234ZM"
                        required
                      />
                      {renderFieldError("plateNumber")}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="make">Make *</Label>
                      <Select onValueChange={(value) => handleInputChange("make", value)} required>
                        <SelectTrigger className={validationErrors.make ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select make" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="volvo">Volvo</SelectItem>
                          <SelectItem value="mercedes">Mercedes-Benz</SelectItem>
                          <SelectItem value="scania">Scania</SelectItem>
                          <SelectItem value="man">MAN</SelectItem>
                          <SelectItem value="daf">DAF</SelectItem>
                          <SelectItem value="iveco">Iveco</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {renderFieldError("make")}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model *</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => handleInputChange("model", e.target.value)}
                        className={validationErrors.model ? "border-red-500" : ""}
                        placeholder="FH16, Actros, etc."
                        required
                      />
                      {renderFieldError("model")}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year *</Label>
                      <Input
                        id="year"
                        type="number"
                        value={formData.year}
                        onChange={(e) => handleInputChange("year", e.target.value)}
                        className={validationErrors.year ? "border-red-500" : ""}
                        placeholder="2020"
                        min="1990"
                        max="2025"
                        required
                      />
                      {renderFieldError("year")}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Color *</Label>
                      <Input
                        id="color"
                        value={formData.color}
                        onChange={(e) => handleInputChange("color", e.target.value)}
                        className={validationErrors.color ? "border-red-500" : ""}
                        placeholder="White, Blue, etc."
                        required
                      />
                      {renderFieldError("color")}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fuelType">Fuel Type *</Label>
                      <Select onValueChange={(value) => handleInputChange("fuelType", value)} required>
                        <SelectTrigger className={validationErrors.fuelType ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select fuel type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="petrol">Petrol</SelectItem>
                          <SelectItem value="electric">Electric</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                      {renderFieldError("fuelType")}
                    </div>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Technical Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="engineNumber">Engine Number *</Label>
                      <Input
                        id="engineNumber"
                        value={formData.engineNumber}
                        onChange={(e) => handleInputChange("engineNumber", e.target.value)}
                        className={validationErrors.engineNumber ? "border-red-500" : ""}
                        placeholder="8-17 alphanumeric characters"
                        required
                      />
                      {renderFieldError("engineNumber")}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chassisNumber">Chassis Number *</Label>
                      <Input
                        id="chassisNumber"
                        value={formData.chassisNumber}
                        onChange={(e) => handleInputChange("chassisNumber", e.target.value)}
                        className={validationErrors.chassisNumber ? "border-red-500" : ""}
                        placeholder="17 character VIN/Chassis number"
                        required
                      />
                      {renderFieldError("chassisNumber")}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grossWeight">Gross Weight (kg) *</Label>
                      <Input
                        id="grossWeight"
                        type="number"
                        value={formData.grossWeight}
                        onChange={(e) => handleInputChange("grossWeight", e.target.value)}
                        className={validationErrors.grossWeight ? "border-red-500" : ""}
                        placeholder="40000"
                        required
                      />
                      {renderFieldError("grossWeight")}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="netWeight">Net Weight (kg) *</Label>
                      <Input
                        id="netWeight"
                        type="number"
                        value={formData.netWeight}
                        onChange={(e) => handleInputChange("netWeight", e.target.value)}
                        className={validationErrors.netWeight ? "border-red-500" : ""}
                        placeholder="15000"
                        required
                      />
                      {renderFieldError("netWeight")}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dimensions">Dimensions (L x W x H) *</Label>
                    <Input
                      id="dimensions"
                      value={formData.dimensions}
                      onChange={(e) => handleInputChange("dimensions", e.target.value)}
                      className={validationErrors.dimensions ? "border-red-500" : ""}
                      placeholder="12m x 2.5m x 4m"
                      required
                    />
                    {renderFieldError("dimensions")}
                  </div>
                </div>

                {/* Insurance & Registration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Insurance & Registration</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="insuranceCompany">Insurance Company *</Label>
                      <Input
                        id="insuranceCompany"
                        value={formData.insuranceCompany}
                        onChange={(e) => handleInputChange("insuranceCompany", e.target.value)}
                        className={validationErrors.insuranceCompany ? "border-red-500" : ""}
                        placeholder="ZSIC, Madison, etc."
                        required
                      />
                      {renderFieldError("insuranceCompany")}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="insurancePolicy">Insurance Policy Number *</Label>
                      <Input
                        id="insurancePolicy"
                        value={formData.insurancePolicy}
                        onChange={(e) => handleInputChange("insurancePolicy", e.target.value)}
                        className={validationErrors.insurancePolicy ? "border-red-500" : ""}
                        placeholder="Policy number (min 5 characters)"
                        required
                      />
                      {renderFieldError("insurancePolicy")}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="insuranceExpiry">Insurance Expiry Date *</Label>
                      <Input
                        id="insuranceExpiry"
                        type="date"
                        value={formData.insuranceExpiry}
                        onChange={(e) => handleInputChange("insuranceExpiry", e.target.value)}
                        className={validationErrors.insuranceExpiry ? "border-red-500" : ""}
                        required
                      />
                      {renderFieldError("insuranceExpiry")}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registrationExpiry">Registration Expiry Date *</Label>
                      <Input
                        id="registrationExpiry"
                        type="date"
                        value={formData.registrationExpiry}
                        onChange={(e) => handleInputChange("registrationExpiry", e.target.value)}
                        className={validationErrors.registrationExpiry ? "border-red-500" : ""}
                        required
                      />
                      {renderFieldError("registrationExpiry")}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roadTaxExpiry">Road Tax Expiry Date *</Label>
                      <Input
                        id="roadTaxExpiry"
                        type="date"
                        value={formData.roadTaxExpiry}
                        onChange={(e) => handleInputChange("roadTaxExpiry", e.target.value)}
                        className={validationErrors.roadTaxExpiry ? "border-red-500" : ""}
                        required
                      />
                      {renderFieldError("roadTaxExpiry")}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purpose">Primary Purpose *</Label>
                      <Select onValueChange={(value) => handleInputChange("purpose", value)} required>
                        <SelectTrigger className={validationErrors.purpose ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="freight">Freight Transport</SelectItem>
                          <SelectItem value="construction">Construction</SelectItem>
                          <SelectItem value="mining">Mining</SelectItem>
                          <SelectItem value="agriculture">Agriculture</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {renderFieldError("purpose")}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="Any additional information about the truck"
                      rows={3}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Registering Truck...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Register Truck
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
