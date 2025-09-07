"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { Button } from "@/components/ui/core/button"
import { Input } from "@/components/ui/core/input"
import { Label } from "@/components/ui/core/label"
import { Textarea } from "@/components/ui/core/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/core/select"
import { ArrowLeft, User, Laptop, ClipboardList, AlertTriangle, CheckCircle } from "lucide-react"

interface FormData {
  customerName: string
  phoneNumber: string
  email: string
  laptopMake: string
  laptopModel: string
  serialNumber: string
  issueDescription: string
  urgencyLevel: string
  currentLocation: string
}

interface FormErrors {
  customerName?: string
  phoneNumber?: string
  email?: string
  laptopMake?: string
  laptopModel?: string
  serialNumber?: string
  issueDescription?: string
  urgencyLevel?: string
  currentLocation?: string
}

const urgencyOptions = [
  { value: "low", label: "Low - Non-urgent repair" },
  { value: "medium", label: "Medium - Standard priority" },
  { value: "high", label: "High - Urgent repair needed" },
]

const locationOptions = [
  { value: "front-desk-intake", label: "Front Desk Intake" },
  { value: "diagnostic-station", label: "Diagnostic Station" },
  { value: "repair-bay-1", label: "Repair Bay 1" },
  { value: "repair-bay-2", label: "Repair Bay 2" },
  { value: "parts-storage", label: "Parts Storage" },
  { value: "quality-control", label: "Quality Control" },
]

export function NewTaskForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    customerName: "",
    phoneNumber: "",
    email: "",
    laptopMake: "",
    laptopModel: "",
    serialNumber: "",
    issueDescription: "",
    urgencyLevel: "",
    currentLocation: "front-desk-intake", // Default value
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Customer Name validation
    if (!formData.customerName.trim()) {
      newErrors.customerName = "Customer name is required"
    }

    // Phone Number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required"
    } else {
      const phoneRegex = /^$$\d{3}$$\s\d{3}-\d{4}$/
      if (!phoneRegex.test(formData.phoneNumber)) {
        newErrors.phoneNumber = "Phone number must be in format (555) 123-4567"
      }
    }

    // Email validation (optional but must be valid if provided)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address"
      }
    }

    // Serial Number validation
    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = "Laptop serial number is required"
    }

    // Issue Description validation
    if (!formData.issueDescription.trim()) {
      newErrors.issueDescription = "Issue description is required"
    } else if (formData.issueDescription.trim().length < 10) {
      newErrors.issueDescription = "Issue description must be at least 10 characters"
    }

    // Urgency Level validation
    if (!formData.urgencyLevel) {
      newErrors.urgencyLevel = "Please select an urgency level"
    }

    // Current Location validation
    if (!formData.currentLocation) {
      newErrors.currentLocation = "Please select a current location"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "")

    // Format as (XXX) XXX-XXXX
    if (digits.length >= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    } else if (digits.length >= 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    } else {
      return digits
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === "phoneNumber") {
      value = formatPhoneNumber(value)
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate a mock task ID
      const taskId = `T-${Math.floor(Math.random() * 9000) + 1000}`

      setSubmitSuccess(true)

      // Redirect to task list after a short delay
      setTimeout(() => {
        router.push("/dashboard/tasks")
      }, 2000)
    } catch (error) {
      console.error("Error creating task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/tasks")
  }

  if (submitSuccess) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-800 mb-2">Task Created Successfully!</h2>
              <p className="text-green-700 mb-4">
                The new repair task has been created and added to the system. You will be redirected to the tasks list
                shortly.
              </p>
              <Button onClick={() => router.push("/dashboard/tasks")} className="bg-green-600 hover:bg-green-700">
                Go to Tasks List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create New Task</h1>
        <p className="text-gray-600 mt-2">Enter all required information to create a new repair task</p>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Information Section */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-red-600" />
                Customer Information
              </CardTitle>
              <CardDescription>Enter the customer's contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="text-gray-700 font-medium">
                  Customer Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerName"
                  type="text"
                  placeholder="Enter customer's full name"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange("customerName", e.target.value)}
                  className={`h-11 border-gray-300 focus:border-red-500 focus:ring-red-500 ${
                    errors.customerName ? "border-red-300 bg-red-50" : ""
                  }`}
                />
                {errors.customerName && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.customerName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  className={`h-11 border-gray-300 focus:border-red-500 focus:ring-red-500 ${
                    errors.phoneNumber ? "border-red-300 bg-red-50" : ""
                  }`}
                  maxLength={14}
                />
                <p className="text-xs text-gray-500">Format: (555) 123-4567</p>
                {errors.phoneNumber && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address <span className="text-gray-400">(Optional)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="customer@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`h-11 border-gray-300 focus:border-red-500 focus:ring-red-500 ${
                    errors.email ? "border-red-300 bg-red-50" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Laptop Details Section */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Laptop className="h-5 w-5 text-red-600" />
                Laptop Details
              </CardTitle>
              <CardDescription>Provide information about the laptop being repaired</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="laptopMake" className="text-gray-700 font-medium">
                    Make
                  </Label>
                  <Input
                    id="laptopMake"
                    type="text"
                    placeholder="e.g., Apple, Dell, HP, Lenovo"
                    value={formData.laptopMake}
                    onChange={(e) => handleInputChange("laptopMake", e.target.value)}
                    className="h-11 border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="laptopModel" className="text-gray-700 font-medium">
                    Model
                  </Label>
                  <Input
                    id="laptopModel"
                    type="text"
                    placeholder='e.g., MacBook Pro 13", XPS 15'
                    value={formData.laptopModel}
                    onChange={(e) => handleInputChange("laptopModel", e.target.value)}
                    className="h-11 border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serialNumber" className="text-gray-700 font-medium">
                  Laptop Serial Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="serialNumber"
                  type="text"
                  placeholder="Enter the laptop's serial number"
                  value={formData.serialNumber}
                  onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                  className={`h-11 border-gray-300 focus:border-red-500 focus:ring-red-500 ${
                    errors.serialNumber ? "border-red-300 bg-red-50" : ""
                  }`}
                />
                <p className="text-xs text-gray-500">Usually found on the bottom of the laptop or in system settings</p>
                {errors.serialNumber && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.serialNumber}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Issue & Initial Assessment Section */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-red-600" />
                Issue & Initial Assessment
              </CardTitle>
              <CardDescription>Describe the problem and set initial task parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="issueDescription" className="text-gray-700 font-medium">
                  Initial Issue Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="issueDescription"
                  placeholder="Describe the problem in detail. Include any error messages, symptoms, or customer observations..."
                  value={formData.issueDescription}
                  onChange={(e) => handleInputChange("issueDescription", e.target.value)}
                  className={`min-h-[120px] border-gray-300 focus:border-red-500 focus:ring-red-500 resize-none ${
                    errors.issueDescription ? "border-red-300 bg-red-50" : ""
                  }`}
                  rows={5}
                />
                <p className="text-xs text-gray-500">
                  Minimum 10 characters. Be as detailed as possible to help technicians understand the issue.
                </p>
                {errors.issueDescription && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.issueDescription}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgencyLevel" className="text-gray-700 font-medium">
                  Urgency Level <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.urgencyLevel}
                  onValueChange={(value) => handleInputChange("urgencyLevel", value)}
                >
                  <SelectTrigger
                    className={`h-11 border-gray-300 focus:border-red-500 focus:ring-red-500 ${
                      errors.urgencyLevel ? "border-red-300 bg-red-50" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select urgency level" />
                  </SelectTrigger>
                  <SelectContent>
                    {urgencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.urgencyLevel && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.urgencyLevel}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentLocation" className="text-gray-700 font-medium">
                  Current Physical Location <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.currentLocation}
                  onValueChange={(value) => handleInputChange("currentLocation", value)}
                >
                  <SelectTrigger
                    className={`h-11 border-gray-300 focus:border-red-500 focus:ring-red-500 ${
                      errors.currentLocation ? "border-red-300 bg-red-50" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select current location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Where is the laptop currently located in the shop?</p>
                {errors.currentLocation && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.currentLocation}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-8 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2 bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Task...
                </div>
              ) : (
                "Create Task"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
