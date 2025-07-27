"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, Shield, Settings, Users, FileText, CreditCard } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  const roles = [
    {
      id: "driver",
      title: "Register as Driver",
      description: "Manage your trucks, licenses, and transportation activities",
      icon: Truck,
      color: "bg-blue-500",
      href: "/dashboard/driver/register",
    },
    {
      id: "border-agent",
      title: "Register as Border Agent",
      description: "Verify driver credentials and manage border crossings",
      icon: Shield,
      color: "bg-green-500",
      href: "/dashboard/border-agent/register",
    },
    {
      id: "system-admin",
      title: "Register as System Admin",
      description: "Process requests, issue e-cards, and manage the system",
      icon: Settings,
      color: "bg-purple-500",
      href: "/dashboard/admin/register",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Truck className="h-16 w-16 text-blue-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">E-Truck Transport System</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your role to access specialized features and manage your transportation activities
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {roles.map((role) => {
            const IconComponent = role.icon
            return (
              <Card
                key={role.id}
                className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 hover:border-blue-300"
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-20 h-20 ${role.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold">{role.title}</CardTitle>
                  <CardDescription className="text-gray-600">{role.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link href={role.href}>
                    <Button className="w-full" size="lg">
                      Register Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Features Overview */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">System Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Multi-Role Access</h3>
              <p className="text-sm text-gray-600">Separate dashboards for drivers, agents, and admins</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <FileText className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Digital Documentation</h3>
              <p className="text-sm text-gray-600">Paperless verification and document management</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <CreditCard className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">E-Card System</h3>
              <p className="text-sm text-gray-600">Digital cards for quick verification at borders</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Secure Payments</h3>
              <p className="text-sm text-gray-600">Mobile money and card payment integration</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
