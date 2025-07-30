"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Settings, Calendar, Filter, FileText } from "lucide-react"

const reportTypes = [
  { id: "financial", label: "Financial Analysis", description: "Revenue, payments, and cost analysis" },
  { id: "operational", label: "Operational Metrics", description: "Task status, turnaround times, efficiency" },
  { id: "performance", label: "Performance Review", description: "Technician productivity and quality metrics" },
  { id: "customer", label: "Customer Analytics", description: "Customer satisfaction and retention data" },
]

const dataFields = [
  { id: "task_id", label: "Task ID", category: "basic" },
  { id: "customer_name", label: "Customer Name", category: "basic" },
  { id: "laptop_model", label: "Laptop Model", category: "basic" },
  { id: "technician", label: "Assigned Technician", category: "basic" },
  { id: "status", label: "Current Status", category: "basic" },
  { id: "date_in", label: "Date In", category: "dates" },
  { id: "date_completed", label: "Date Completed", category: "dates" },
  { id: "turnaround_time", label: "Turnaround Time", category: "performance" },
  { id: "total_cost", label: "Total Cost", category: "financial" },
  { id: "parts_cost", label: "Parts Cost", category: "financial" },
  { id: "labor_cost", label: "Labor Cost", category: "financial" },
  { id: "payment_status", label: "Payment Status", category: "financial" },
  { id: "urgency", label: "Urgency Level", category: "basic" },
  { id: "location", label: "Current Location", category: "basic" },
]

const dateRanges = [
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "last_3_months", label: "Last 3 Months" },
  { value: "last_6_months", label: "Last 6 Months" },
  { value: "last_year", label: "Last Year" },
  { value: "custom", label: "Custom Range" },
]

export function CustomReportBuilder() {
  const [reportName, setReportName] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [dateRange, setDateRange] = useState("")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields((prev) => (prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId]))
  }

  const handleGenerateReport = async () => {
    setIsGenerating(true)

    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Here you would typically send the configuration to your backend
    console.log({
      reportName,
      selectedType,
      selectedFields,
      dateRange,
      customStartDate,
      customEndDate,
    })

    setIsGenerating(false)

    // Redirect back to reports page or show success message
    alert("Custom report generated successfully!")
  }

  const isFormValid = reportName && selectedType && selectedFields.length > 0 && dateRange

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Custom Report Builder</h1>
        <p className="text-gray-600 mt-2">Create tailored reports with specific data points and filters</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Report Configuration */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="h-5 w-5 text-red-600" />
              Report Configuration
            </CardTitle>
            <CardDescription>Define the basic parameters for your custom report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reportName">Report Name</Label>
                <Input
                  id="reportName"
                  placeholder="Enter a name for your report"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-gray-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Fields Selection */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="h-5 w-5 text-red-600" />
              Data Fields
            </CardTitle>
            <CardDescription>Select the data fields to include in your report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dataFields.map((field) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.id}
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={() => handleFieldToggle(field.id)}
                  />
                  <Label
                    htmlFor={field.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Selected: {selectedFields.length} field{selectedFields.length !== 1 ? "s" : ""}
            </div>
          </CardContent>
        </Card>

        {/* Date Range Selection */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-red-600" />
              Date Range
            </CardTitle>
            <CardDescription>Specify the time period for your report data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dateRange">Time Period</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  {dateRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {dateRange === "custom" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generate Report */}
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Generate Report</h3>
                <p className="text-gray-600 text-sm">Review your selections and generate the custom report</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 bg-transparent"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateReport}
                  disabled={!isFormValid || isGenerating}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating...
                    </div>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
