import jsPDF from "jspdf"
import "jspdf-autotable"
;("use client")

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { Button } from "@/components/ui/core/button"
import { Badge } from "@/components/ui/core/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/layout/table"
import {
  DollarSign,
  CreditCard,
  PieChart,
  ClipboardList,
  Clock,
  MapPin,
  Users,
  TrendingUp,
  FileText,
  Settings,
  Download,
  Eye,
  Calendar,
  BarChart3,
} from "lucide-react"

// Enhanced interfaces for better type safety
interface ReportCard {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: string
  category: string
  lastGenerated?: string
  canGeneratePDF: boolean
}

interface RecentReport {
  id: string
  name: string
  type: string
  generatedBy: string
  generatedAt: string
  downloadCount: number
  size: string
}

// Mock data for recent reports
const recentReports: RecentReport[] = [
  {
    id: "RPT-001",
    name: "Monthly Revenue Summary - January 2024",
    type: "Financial",
    generatedBy: "Admin User",
    generatedAt: "2024-01-15 10:30 AM",
    downloadCount: 5,
    size: "245 KB",
  },
  {
    id: "RPT-002",
    name: "Technician Performance Report",
    type: "Performance",
    generatedBy: "Shop Manager",
    generatedAt: "2024-01-14 2:15 PM",
    downloadCount: 3,
    size: "189 KB",
  },
  {
    id: "RPT-003",
    name: "Outstanding Payments Report",
    type: "Financial",
    generatedBy: "Admin User",
    generatedAt: "2024-01-13 9:45 AM",
    downloadCount: 8,
    size: "156 KB",
  },
  {
    id: "RPT-004",
    name: "Tasks by Status Overview",
    type: "Operational",
    generatedBy: "Shop Manager",
    generatedAt: "2024-01-12 4:20 PM",
    downloadCount: 12,
    size: "203 KB",
  },
]

const financialReports: ReportCard[] = [
  {
    id: "revenue-summary",
    title: "Revenue Summary",
    description: "View daily, weekly, monthly income trends and patterns",
    icon: DollarSign,
    href: "/dashboard/reports/revenue",
    badge: "Popular",
    category: "Financial",
    lastGenerated: "2 hours ago",
    canGeneratePDF: true,
  },
  {
    id: "outstanding-payments",
    title: "Outstanding Payments",
    description: "List of unpaid or partially paid tasks requiring follow-up",
    icon: CreditCard,
    href: "/dashboard/reports/payments",
    category: "Financial",
    lastGenerated: "1 day ago",
    canGeneratePDF: true,
  },
  {
    id: "payment-methods",
    title: "Payment Method Breakdown",
    description: "Analyze payments by cash, card, and digital methods",
    icon: PieChart,
    href: "/dashboard/reports/payment-methods",
    category: "Financial",
    lastGenerated: "3 days ago",
    canGeneratePDF: true,
  },
]

const operationalReports: ReportCard[] = [
  {
    id: "task-status",
    title: "Tasks by Status Overview",
    description: "Current number of tasks in each status category",
    icon: ClipboardList,
    href: "/dashboard/reports/task-status",
    badge: "Live Data",
    category: "Operational",
    lastGenerated: "30 minutes ago",
    canGeneratePDF: true,
  },
  {
    id: "turnaround-time",
    title: "Average Turnaround Time",
    description: "Measure repair efficiency and identify bottlenecks",
    icon: Clock,
    href: "/dashboard/reports/turnaround",
    category: "Operational",
    lastGenerated: "2 hours ago",
    canGeneratePDF: true,
  },
  {
    id: "inventory-location",
    title: "Laptops in Shop by Location",
    description: "Physical inventory breakdown by storage location",
    icon: MapPin,
    href: "/dashboard/reports/inventory",
    category: "Operational",
    lastGenerated: "1 day ago",
    canGeneratePDF: true,
  },
]

const technicianReports: ReportCard[] = [
  {
    id: "workload",
    title: "Technician Workload",
    description: "Current assigned tasks per technician with capacity analysis",
    icon: Users,
    href: "/dashboard/reports/workload",
    category: "Performance",
    lastGenerated: "1 hour ago",
    canGeneratePDF: true,
  },
  {
    id: "performance",
    title: "Completed Tasks by Technician",
    description: "Performance metrics per technician over time periods",
    icon: TrendingUp,
    href: "/dashboard/reports/performance",
    badge: "Trending",
    category: "Performance",
    lastGenerated: "4 hours ago",
    canGeneratePDF: true,
  },
]

function ReportSection({
  title,
  description,
  reports,
  onGeneratePDF,
  onViewReport,
}: {
  title: string
  description: string
  reports: ReportCard[]
  onGeneratePDF: (reportId: string) => void
  onViewReport: (reportId: string) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card
            key={report.id}
            className="border-gray-200 hover:border-red-300 hover:shadow-md transition-all duration-200 group"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                    <report.icon className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base font-medium text-gray-900 group-hover:text-red-700 transition-colors">
                      {report.title}
                    </CardTitle>
                    {report.lastGenerated && <p className="text-xs text-gray-500 mt-1">Last: {report.lastGenerated}</p>}
                  </div>
                </div>
                {report.badge && (
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                    {report.badge}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 text-sm leading-relaxed mb-4">
                {report.description}
              </CardDescription>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewReport(report.id)}
                  className="p-0 h-auto text-red-600 hover:text-red-700 font-medium"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View Report
                </Button>
                {report.canGeneratePDF && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onGeneratePDF(report.id)}
                    className="p-0 h-auto text-gray-600 hover:text-gray-700 font-medium"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function ReportsOverview() {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<string | null>(null)

  const generatePDF = async (reportId: string) => {
    setIsGeneratingPDF(reportId)

    try {
      // Find the report details
      const allReports = [...financialReports, ...operationalReports, ...technicianReports]
      const report = allReports.find((r) => r.id === reportId)

      if (!report) return

      // Create new PDF document
      const pdf = new jsPDF()

      // Add header
      pdf.setFontSize(20)
      pdf.setTextColor(220, 38, 38) // Red color
      pdf.text("A+ express", 20, 20)

      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      pdf.text(report.title, 20, 35)

      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, 45)
      pdf.text(`Report Category: ${report.category}`, 20, 52)

      // Add content based on report type
      let yPosition = 70

      if (reportId === "revenue-summary") {
        // Revenue Summary Report
        pdf.setFontSize(14)
        pdf.setTextColor(0, 0, 0)
        pdf.text("Revenue Summary - January 2024", 20, yPosition)
        yPosition += 15

        // Sample revenue data
        const revenueData = [
          ["Week 1", "$3,250.00", "15 tasks"],
          ["Week 2", "$4,180.00", "19 tasks"],
          ["Week 3", "$2,890.00", "12 tasks"],
          ["Week 4", "$3,680.00", "16 tasks"],
          ["Total", "$14,000.00", "62 tasks"],
        ]

        pdf.autoTable({
          head: [["Period", "Revenue", "Tasks Completed"]],
          body: revenueData,
          startY: yPosition,
          theme: "grid",
          headStyles: { fillColor: [220, 38, 38] },
          margin: { left: 20, right: 20 },
        })
      } else if (reportId === "outstanding-payments") {
        // Outstanding Payments Report
        pdf.setFontSize(14)
        pdf.setTextColor(0, 0, 0)
        pdf.text("Outstanding Payments Report", 20, yPosition)
        yPosition += 15

        const paymentsData = [
          ["T-1025", "David Wilson", "$450.00", "5 days", "(555) 123-4567"],
          ["T-1018", "Emma Davis", "$320.00", "12 days", "(555) 987-6543"],
          ["T-1022", "Tom Anderson", "$180.00", "3 days", "(555) 456-7890"],
          ["", "", "$950.00", "Total Outstanding", ""],
        ]

        pdf.autoTable({
          head: [["Task ID", "Customer", "Amount", "Days Overdue", "Phone"]],
          body: paymentsData,
          startY: yPosition,
          theme: "grid",
          headStyles: { fillColor: [220, 38, 38] },
          margin: { left: 20, right: 20 },
        })
      } else if (reportId === "task-status") {
        // Task Status Report
        pdf.setFontSize(14)
        pdf.setTextColor(0, 0, 0)
        pdf.text("Tasks by Status Overview", 20, yPosition)
        yPosition += 15

        const statusData = [
          ["In Progress", "23", "48.9%"],
          ["Awaiting Parts", "12", "25.5%"],
          ["Ready for Pickup", "8", "17.0%"],
          ["Diagnostic", "4", "8.5%"],
          ["Total Active Tasks", "47", "100%"],
        ]

        pdf.autoTable({
          head: [["Status", "Count", "Percentage"]],
          body: statusData,
          startY: yPosition,
          theme: "grid",
          headStyles: { fillColor: [220, 38, 38] },
          margin: { left: 20, right: 20 },
        })
      } else if (reportId === "performance") {
        // Technician Performance Report
        pdf.setFontSize(14)
        pdf.setTextColor(0, 0, 0)
        pdf.text("Technician Performance Report", 20, yPosition)
        yPosition += 15

        const performanceData = [
          ["Sarah Johnson", "32", "98%", "1.8 hours", "4.9/5"],
          ["John Smith", "28", "95%", "2.1 hours", "4.7/5"],
          ["Lisa Brown", "26", "92%", "2.2 hours", "4.8/5"],
          ["Mike Chen", "24", "88%", "2.5 hours", "4.6/5"],
          ["David Wilson", "22", "85%", "2.8 hours", "4.5/5"],
        ]

        pdf.autoTable({
          head: [["Technician", "Tasks Completed", "Efficiency", "Avg Time", "Rating"]],
          body: performanceData,
          startY: yPosition,
          theme: "grid",
          headStyles: { fillColor: [220, 38, 38] },
          margin: { left: 20, right: 20 },
        })
      }

      // Add footer
      const pageCount = pdf.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setTextColor(100, 100, 100)
        pdf.text(`Page ${i} of ${pageCount}`, pdf.internal.pageSize.width - 30, pdf.internal.pageSize.height - 10)
        pdf.text("A+ express - Confidential Report", 20, pdf.internal.pageSize.height - 10)
      }

      // Save the PDF
      pdf.save(`${report.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGeneratingPDF(null)
    }
  }

  const handleViewReport = (reportId: string) => {
    // Navigate to specific report page
    window.location.href = `/dashboard/reports/${reportId}`
  }

  const handleGenerateCustomReport = () => {
    // Navigate to custom report builder
    window.location.href = "/dashboard/reports/custom"
  }

  return (
    <div className="flex-1 space-y-8 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive insights and analytics for your repair shop operations</p>
        </div>
        <Button
          onClick={handleGenerateCustomReport}
          variant="outline"
          className="border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50"
        >
          <Settings className="h-4 w-4 mr-2" />
          Generate Custom Report
        </Button>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <FileText className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Available Reports</p>
                <p className="text-xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Most Popular</p>
                <p className="text-sm font-bold text-gray-900">Revenue Summary</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-sm font-bold text-gray-900">30 min ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Generated This Month</p>
                <p className="text-sm font-bold text-gray-900">24 reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recently Generated Reports */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-red-600" />
            Recently Generated Reports
          </CardTitle>
          <CardDescription>Latest reports generated by your team</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Generated By</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentReports.map((report) => (
                <TableRow key={report.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{report.name}</p>
                      <p className="text-sm text-gray-500">{report.size}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                      {report.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">{report.generatedBy}</TableCell>
                  <TableCell className="text-gray-600">{report.generatedAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-600">{report.downloadCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-700 hover:bg-gray-50">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Report Categories */}
      <div className="space-y-8">
        <ReportSection
          title="Financial Reports"
          description="Revenue tracking, payment analysis, and financial performance metrics"
          reports={financialReports}
          onGeneratePDF={generatePDF}
          onViewReport={handleViewReport}
        />

        <ReportSection
          title="Operational Reports"
          description="Task management, efficiency metrics, and inventory tracking"
          reports={operationalReports}
          onGeneratePDF={generatePDF}
          onViewReport={handleViewReport}
        />

        <ReportSection
          title="Technician Performance"
          description="Workload distribution, performance analysis, and productivity metrics"
          reports={technicianReports}
          onGeneratePDF={generatePDF}
          onViewReport={handleViewReport}
        />
      </div>

      {/* Custom Report Section */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Settings className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Need a Custom Report?</h3>
                <p className="text-gray-600 text-sm">
                  Create tailored reports with specific date ranges, filters, and data points
                </p>
              </div>
            </div>
            <Button
              onClick={handleGenerateCustomReport}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
            >
              <FileText className="h-4 w-4 mr-2" />
              Build Custom Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
