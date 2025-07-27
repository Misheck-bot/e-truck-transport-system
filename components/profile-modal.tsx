"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Edit, Save } from "lucide-react"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userRole: string
}

export function ProfileModal({ isOpen, onClose, userRole }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [editedProfile, setEditedProfile] = useState<any>({})

  useEffect(() => {
    if (isOpen) {
      const userData = localStorage.getItem("currentUser")
      if (userData) {
        const user = JSON.parse(userData)
        setUserProfile(user)
        setEditedProfile(user)
      }
    }
  }, [isOpen])

  const handleSave = () => {
    localStorage.setItem("currentUser", JSON.stringify(editedProfile))
    setUserProfile(editedProfile)
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setEditedProfile((prev: any) => ({ ...prev, [field]: value }))
  }

  if (!userProfile) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Profile Management
          </DialogTitle>
          <DialogDescription>View and manage your account information</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <Button variant="outline" size="sm" onClick={() => (isEditing ? handleSave() : setIsEditing(true))}>
                {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                {isEditing ? "Save" : "Edit"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={isEditing ? editedProfile.fullName : userProfile.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  readOnly={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={isEditing ? editedProfile.email : userProfile.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  readOnly={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={isEditing ? editedProfile.phone : userProfile.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  readOnly={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={isEditing ? editedProfile.dateOfBirth : userProfile.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  readOnly={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={isEditing ? editedProfile.address : userProfile.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                readOnly={!isEditing}
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="professional" className="space-y-4">
            <h3 className="text-lg font-semibold">Professional Information</h3>

            {userRole === "driver" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>License Number</Label>
                  <Input value={userProfile.licenseNumber || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>License Expiry</Label>
                  <Input value={userProfile.licenseExpiry || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={isEditing ? editedProfile.company : userProfile.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Experience</Label>
                  <Input value={userProfile.experience || ""} readOnly />
                </div>
              </div>
            )}

            {userRole === "border-agent" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Employee ID</Label>
                  <Input value={userProfile.employeeId || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input value={userProfile.department || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Border Post</Label>
                  <Input value={userProfile.borderPost || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Security Clearance</Label>
                  <Input value={userProfile.securityClearance || ""} readOnly />
                </div>
              </div>
            )}

            {userRole === "admin" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Employee ID</Label>
                  <Input value={userProfile.employeeId || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input value={userProfile.department || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Ministry</Label>
                  <Input value={userProfile.ministry || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Access Level</Label>
                  <Input value={userProfile.accessLevel || ""} readOnly />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            <h3 className="text-lg font-semibold">Account Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Account Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="default">Active</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Registration Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{formatDate(userProfile.registrationDate)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">{userProfile.role}</Badge>
                </CardContent>
              </Card>

              {userRole === "driver" && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">E-Card Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={userProfile.eCardStatus === "active" ? "default" : "destructive"}>
                      {userProfile.eCardStatus}
                    </Badge>
                  </CardContent>
                </Card>
              )}
            </div>

            {userRole === "driver" && userProfile.payments && userProfile.payments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {userProfile.payments.slice(-3).map((payment: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>{payment.type}</span>
                        <span className="font-semibold">{payment.amount}</span>
                        <Badge variant="default" className="text-xs">
                          {payment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
