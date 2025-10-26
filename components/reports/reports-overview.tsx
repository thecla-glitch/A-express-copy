"use client"

import jsPDF from "jspdf"
import "jspdf-autotable"

import { ReportViewer } from "@/components/reports/report-preview-modal"
import type React from "react"
import { useState, useEffect } from "react"
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



// Import autoTable like this
import autoTable from 'jspdf-autotable'

// Extend jsPDF types
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

// Add this initialization function
const initializePDF = () => {
  const pdf = new jsPDF();
  // Add autoTable to pdf instance
  (pdf as any).autoTable = autoTable;
  return pdf;
};



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
          <Card key={report.id} className="border-gray-200 hover:border-red-300 hover:shadow-md transition-all duration-200 group">
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
  const [selectedReport, setSelectedReport] = useState<{ id: string, data: any } | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const generatePDF = async (reportId: string) => {
    setIsGeneratingPDF(reportId)

    try {
      // Get the actual report data from the selected report or fetch it
      let reportData = null
      let reportType = ''

      // If we have the report data already from viewing, use it
      if (selectedReport && selectedReport.id === reportId) {
        reportData = selectedReport.data.report
        reportType = selectedReport.data.type
      } else {
        // Otherwise fetch the report data
        const apiEndpoints: { [key: string]: string } = {
          'revenue-summary': '/api/reports/revenue-summary/',
          'outstanding-payments': '/api/reports/outstanding-payments/',
          'payment-methods': '/api/reports/payment-methods/',
          'task-status': '/api/reports/task-status/',
          'turnaround-time': '/api/reports/turnaround-time/',
          'workload': '/api/reports/technician-workload/',
          'performance': '/api/reports/technician-performance/',
          'inventory-location': '/api/reports/inventory-location/'
        }

        const endpoint = apiEndpoints[reportId]
        if (!endpoint) {
          console.warn(`No endpoint mapped for report: ${reportId}`)
          return
        }

        let url = `http://localhost:8000${endpoint}`
        const dateRangeReports = ['revenue-summary', 'technician-performance', 'payment-methods']
        if (dateRangeReports.includes(reportId)) {
          const params = new URLSearchParams({ date_range: 'last_30_days' })
          url += `?${params.toString()}`
        }

        let token: string | null = null
        const authTokens = localStorage.getItem('auth_tokens')
        if (authTokens) {
          try {
            const parsedTokens = JSON.parse(authTokens)
            token = parsedTokens?.access ?? null
          } catch (e) {
            console.warn('Failed to parse auth_tokens from localStorage', e)
          }
        }

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(url, { method: 'GET', headers })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

        const data = await response.json()
        reportData = data.report
        reportType = data.type
      }

      if (!reportData) {
        throw new Error('No report data available')
      }

      // Create new PDF document (initialized with autoTable and typed)
      const pdf = initializePDF()

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // Add header
      pdf.setFontSize(20)
      pdf.setTextColor(220, 38, 38) // Red color
      pdf.text("A+ Express", 20, 20)

      // Find the report details for title and category
      const allReports = [...financialReports, ...operationalReports, ...technicianReports]
      const report = allReports.find((r) => r.id === reportId)

      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      pdf.text(report?.title || reportId.replace(/-/g, ' '), 20, 35)

      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, 45)
      pdf.text(`Report Category: ${report?.category || 'General'}`, 20, 52)
      pdf.text(`Date Range: Last 30 Days`, 20, 59)

      let yPosition = 75

      // Generate PDF content based on report type and actual data
      switch (reportType) {
        case 'task_status':
          generateTaskStatusPDF(pdf, reportData, yPosition)
          break
        case 'technician_performance':
          generateTechnicianPerformancePDF(pdf, reportData, yPosition)
          break
        case 'payment_methods':
          generatePaymentMethodsPDF(pdf, reportData, yPosition)
          break
        case 'technician_workload':
          generateTechnicianWorkloadPDF(pdf, reportData, yPosition)
          break
        case 'outstanding_payments':
          generateOutstandingPaymentsPDF(pdf, reportData, yPosition)
          break
        case 'revenue_summary':
          generateRevenueSummaryPDF(pdf, reportData, yPosition)
          break
        case 'turnaround_time':
          generateTurnaroundTimePDF(pdf, reportData, yPosition)
          break
        case 'inventory_location':
          generateInventoryLocationPDF(pdf, reportData, yPosition)
          break
        default:
          generateGenericPDF(pdf, reportData, reportId, yPosition)
      }

      // Add footer to all pages
      const pageCount = pdf.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setTextColor(100, 100, 100)
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10)
        pdf.text("A+ Express - Confidential Report", 20, pageHeight - 10)
      }

      // Save the PDF
      const fileName = `${(report?.title || reportId).replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`
      pdf.save(fileName)

    } catch (error) {
      console.error("Error generating PDF:", error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPDF(null)
    }
  }
  const handleCloseViewer = () => {
    setIsViewerOpen(false)
    // Small delay to allow animation to complete before clearing data
    setTimeout(() => setSelectedReport(null), 300)
  }


  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isViewerOpen) {
        handleCloseViewer()
      }
    }

    if (isViewerOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = 'unset'
    }
  }, [isViewerOpen])

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleCloseViewer()
    }
  }




  // PDF generation functions for each report type
  // Revenue Summary PDF
  // Revenue Summary PDF - Updated for your API response structure
  const generateRevenueSummaryPDF = (pdf: jsPDF, data: any, startY: number) => {
    let yPosition = startY

    pdf.setFontSize(14)
    pdf.setTextColor(0, 0, 0)
    pdf.text("Revenue Summary Report", 20, yPosition)
    yPosition += 15

    // Summary Statistics - Updated for your data structure
    const monthlyTotals = data.monthly_totals || {}
    const paymentMethods = data.payment_methods || []
    const paymentsByDate = data.payments_by_date || []
    const dateRange = data.date_range || 'last_7_days'

    const summaryData = [
      ["Total Revenue", `TSh ${monthlyTotals.total_revenue?.toLocaleString() || '0'}`],
      ["Total Payments", monthlyTotals.payment_count?.toString() || "0"],
      ["Average Payment", `TSh ${monthlyTotals.average_payment?.toLocaleString() || '0'}`],
      ["Date Range", dateRange.replace(/_/g, ' ')]
    ]

    autoTable(pdf, {
      head: [["Metric", "Value"]],
      body: summaryData,
      startY: yPosition,
      theme: "grid",
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: 20, right: 20 },
    })

    yPosition = (pdf as any).lastAutoTable.finalY + 15

    // Daily Revenue Data
    if (paymentsByDate.length > 0) {
      pdf.setFontSize(12)
      pdf.text("Daily Revenue Breakdown", 20, yPosition)
      yPosition += 10

      const dailyData = paymentsByDate.map((day: any) => [
        new Date(day.date).toLocaleDateString(),
        `TSh ${day.daily_revenue?.toLocaleString() || '0'}`,
        day.payment_count?.toString() || "1" // Assuming 1 payment per day if not specified
      ])

      autoTable(pdf, {
        head: [["Date", "Daily Revenue", "Payments"]],
        body: dailyData,
        startY: yPosition,
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 20, right: 20 },
      })

      yPosition = (pdf as any).lastAutoTable.finalY + 15
    }

    // Payment Methods Breakdown
    if (paymentMethods.length > 0) {
      pdf.setFontSize(12)
      pdf.text("Payment Methods Breakdown", 20, yPosition)
      yPosition += 10

      const paymentMethodData = paymentMethods.map((method: any) => [
        method.method__name?.replace(/-/g, ' ') || 'Unknown',
        `TSh ${method.total?.toLocaleString() || '0'}`,
        method.count?.toString() || "0",
        monthlyTotals.total_revenue ? `${((method.total / monthlyTotals.total_revenue) * 100).toFixed(1)}%` : "0%"
      ])

      autoTable(pdf, {
        head: [["Payment Method", "Total Amount", "Payment Count", "Percentage"]],
        body: paymentMethodData,
        startY: yPosition,
        theme: "grid",
        headStyles: { fillColor: [168, 85, 247] },
        margin: { left: 20, right: 20 },
      })

      yPosition = (pdf as any).lastAutoTable.finalY + 10

      // Revenue Insights
      const topPaymentMethod = paymentMethods[0]
      const totalDays = paymentsByDate.length
      const averageDailyRevenue = monthlyTotals.total_revenue && totalDays > 0
        ? monthlyTotals.total_revenue / totalDays
        : 0

      pdf.setFontSize(11)
      pdf.setTextColor(59, 130, 246)
      pdf.text("Revenue Insights:", 20, yPosition)
      yPosition += 8

      pdf.setFontSize(9)
      pdf.setTextColor(80, 80, 80)

      if (topPaymentMethod) {
        pdf.text(`• Top Payment Method: ${topPaymentMethod.method__name?.replace(/-/g, ' ')} (TSh ${topPaymentMethod.total?.toLocaleString()})`, 20, yPosition)
        yPosition += 5
      }

      pdf.text(`• Period Covered: ${totalDays} day${totalDays !== 1 ? 's' : ''}`, 20, yPosition)
      yPosition += 5

      if (averageDailyRevenue > 0) {
        pdf.text(`• Average Daily Revenue: TSh ${averageDailyRevenue.toLocaleString()}`, 20, yPosition)
        yPosition += 5
      }

      pdf.text(`• Total Payment Methods: ${paymentMethods.length}`, 20, yPosition)
    } else {
      // No payment methods data
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.text("No payment method data available for this period", 20, yPosition)
    }
  }

  // Outstanding Payments PDF (Enhanced)
  // Outstanding Payments PDF (Enhanced)
  const generateOutstandingPaymentsPDF = (pdf: jsPDF, data: any, startY: number) => {
    let yPosition = startY

    pdf.setFontSize(14)
    pdf.setTextColor(0, 0, 0)
    pdf.text("Outstanding Payments Report", 20, yPosition)
    yPosition += 15

    // Summary
    if (data.summary) {
      const summaryData = [
        ["Total Outstanding", `TSh ${data.summary.total_outstanding?.toLocaleString() || '0'}`],
        ["Total Tasks", data.summary.task_count?.toString() || "0"],
        ["Average Balance", `TSh ${data.summary.average_balance?.toLocaleString() || '0'}`],
        ["Overdue Tasks", data.outstanding_tasks?.filter((task: any) => task.days_overdue > 0).length?.toString() || "0"]
      ]

      autoTable(pdf, {
        head: [["Metric", "Value"]],
        body: summaryData,
        startY: yPosition,
        theme: "grid",
        headStyles: { fillColor: [220, 38, 38] },
        margin: { left: 20, right: 20 },
      })

      yPosition = (pdf as any).lastAutoTable.finalY + 15
    }

    // Outstanding Tasks
    if (data.outstanding_tasks && data.outstanding_tasks.length > 0) {
      pdf.setFontSize(12)
      pdf.text("Outstanding Payments Details", 20, yPosition)
      yPosition += 10

      const tasksData = data.outstanding_tasks.map((task: any) => [
        task.task_id,
        task.customer_name,
        task.customer_phone,
        `TSh ${task.total_cost?.toLocaleString() || '0'}`,
        `TSh ${task.paid_amount?.toLocaleString() || '0'}`,
        `TSh ${task.outstanding_balance?.toLocaleString() || '0'}`,
        `${task.days_overdue} days`,
        task.status
      ])

      autoTable(pdf, {
        head: [["Task ID", "Customer", "Phone", "Total Cost", "Paid", "Outstanding", "Days Overdue", "Status"]],
        body: tasksData,
        startY: yPosition,
        theme: "grid",
        headStyles: { fillColor: [239, 68, 68] },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 7 },
        pageBreak: 'auto'
      })

      yPosition = (pdf as any).lastAutoTable.finalY + 10

      // Add overdue analysis
      const overdueTasks = data.outstanding_tasks.filter((task: any) => task.days_overdue > 7)
      if (overdueTasks.length > 0) {
        pdf.setFontSize(12)
        pdf.setTextColor(220, 38, 38)
        pdf.text("Critical Overdue Tasks (>7 days)", 20, yPosition)
        yPosition += 8

        pdf.setFontSize(10)
        pdf.setTextColor(100, 100, 100)
        pdf.text(`${overdueTasks.length} tasks require immediate attention`, 20, yPosition)
        yPosition += 10
      }
    }
  }

  // Payment Methods PDF (Enhanced)
  const generatePaymentMethodsPDF = (pdf: jsPDF, data: any, startY: number) => {
    let yPosition = startY

    pdf.setFontSize(14)
    pdf.setTextColor(0, 0, 0)
    pdf.text("Payment Methods Report", 20, yPosition)
    yPosition += 15

    // Summary
    const summary = data.summary || {}
    const summaryData = [
      ["Total Revenue", `TSh ${summary.total_revenue?.toLocaleString() || '0'}`],
      ["Total Payments", summary.total_payments?.toString() || "0"],
      ["Date Range", summary.date_range ? summary.date_range.replace(/_/g, ' ') : "Last 30 Days"],
      ["Average Payment", `TSh ${summary.total_revenue && summary.total_payments ?
        (summary.total_revenue / summary.total_payments).toLocaleString() : '0'}`]
    ]

    autoTable(pdf, {
      head: [["Metric", "Value"]],
      body: summaryData,
      startY: yPosition,
      theme: "grid",
      headStyles: { fillColor: [168, 85, 247] },
      margin: { left: 20, right: 20 },
    })

    yPosition = (pdf as any).lastAutoTable.finalY + 15

    // Payment Methods Data
    if (data.payment_methods && data.payment_methods.length > 0) {
      pdf.setFontSize(12)
      pdf.text("Payment Methods Breakdown", 20, yPosition)
      yPosition += 10

      const paymentData = data.payment_methods.map((method: any) => [
        method.method_name?.replace(/-/g, ' ') || 'Unknown',
        `TSh ${method.total_amount?.toLocaleString() || '0'}`,
        method.payment_count?.toString() || "0",
        `TSh ${method.average_payment?.toLocaleString() || '0'}`,
        `${method.percentage || '0'}%`
      ])

      autoTable(pdf, {
        head: [["Payment Method", "Total Amount", "Payment Count", "Average Payment", "Percentage"]],
        body: paymentData,
        startY: yPosition,
        theme: "grid",
        headStyles: { fillColor: [34, 197, 94] },
        margin: { left: 20, right: 20 },
      })

      yPosition = (pdf as any).lastAutoTable.finalY + 10

      // Add insights
      const topMethod = data.payment_methods[0]
      if (topMethod) {
        pdf.setFontSize(11)
        pdf.setTextColor(59, 130, 246)
        pdf.text("Key Insights:", 20, yPosition)
        yPosition += 8

        pdf.setFontSize(9)
        pdf.setTextColor(80, 80, 80)
        pdf.text(`• ${topMethod.method_name?.replace(/-/g, ' ')} is the most popular method (${topMethod.percentage}% of revenue)`, 20, yPosition)
        yPosition += 5
        pdf.text(`• ${data.payment_methods.length} payment methods processed TSh ${summary.total_revenue?.toLocaleString() || '0'}`, 20, yPosition)
      }
    }
  }

  // Task Status PDF (Enhanced)
  const generateTaskStatusPDF = (pdf: jsPDF, data: any, startY: number) => {
    let yPosition = startY

    pdf.setFontSize(14)
    pdf.setTextColor(0, 0, 0)
    pdf.text("Task Status Report", 20, yPosition)
    yPosition += 15

    // Summary Statistics
    const statusDistribution = data.status_distribution || []
    const urgencyDistribution = data.urgency_distribution || []
    const totalTasks = data.total_tasks || 0

    const completedTasks = statusDistribution.find((s: any) => s.status === 'Completed')?.count || 0
    const inProgressTasks = statusDistribution.find((s: any) => s.status === 'In Progress')?.count || 0

    const summaryData = [
      ["Total Tasks", totalTasks.toString()],
      ["Completed Tasks", completedTasks.toString()],
      ["In Progress Tasks", inProgressTasks.toString()],
      ["Completion Rate", totalTasks > 0 ? `${((completedTasks / totalTasks) * 100).toFixed(1)}%` : "0%"]
    ]

    autoTable(pdf, {
      head: [["Metric", "Count"]],
      body: summaryData,
      startY: yPosition,
      theme: "grid",
      headStyles: { fillColor: [139, 92, 246] },
      margin: { left: 20, right: 20 },
    })

    yPosition = (pdf as any).lastAutoTable.finalY + 15

    // Status Distribution
    if (statusDistribution.length > 0) {
      pdf.setFontSize(12)
      pdf.text("Status Distribution", 20, yPosition)
      yPosition += 10

      const statusData = statusDistribution.map((status: any) => [
        status.status,
        status.count?.toString() || "0",
        `${status.percentage || '0'}%`
      ])

      autoTable(pdf, {
        head: [["Status", "Count", "Percentage"]],
        body: statusData,
        startY: yPosition,
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 20, right: 20 },
      })

      yPosition = (pdf as any).lastAutoTable.finalY + 15
    }

    // Urgency Distribution
    if (urgencyDistribution.length > 0) {
      pdf.setFontSize(12)
      pdf.text("Urgency Distribution", 20, yPosition)
      yPosition += 10

      const urgencyData = urgencyDistribution.map((urgency: any) => [
        urgency.urgency,
        urgency.count?.toString() || "0",
        totalTasks > 0 ? `${((urgency.count / totalTasks) * 100).toFixed(1)}%` : "0%"
      ])

      autoTable(pdf, {
        head: [["Urgency Level", "Count", "Percentage"]],
        body: urgencyData,
        startY: yPosition,
        theme: "grid",
        headStyles: { fillColor: [245, 158, 11] },
        margin: { left: 20, right: 20 },
      })
    }
  }

  // Turnaround Time PDF
  const generateTurnaroundTimePDF = (pdf: jsPDF, data: any, startY: number) => {
    let yPosition = startY

    pdf.setFontSize(14)
    pdf.setTextColor(0, 0, 0)
    pdf.text("Turnaround Time Report", 20, yPosition)
    yPosition += 15

    // Summary
    const summary = data.summary || {}
    const summaryData = [
      ["Overall Average", summary.overall_average ? `${summary.overall_average} days` : "N/A"],
      ["Best Period", summary.best_period || "N/A"],
      ["Improvement", summary.improvement ? `${summary.improvement}%` : "N/A"],
      ["Most Efficient", data.periods?.reduce((best: any, current: any) =>
        (!best || current.efficiency > best.efficiency) ? current : best, null)?.period || "N/A"]
    ]

    autoTable(pdf, {
      head: [["Metric", "Value"]],
      body: summaryData,
      startY: yPosition,
      theme: "grid",
      headStyles: { fillColor: [14, 165, 233] },
      margin: { left: 20, right: 20 },
    })

    yPosition = (pdf as any).lastAutoTable.finalY + 15

    // Turnaround Time Data
    if (data.periods && data.periods.length > 0) {
      pdf.setFontSize(12)
      pdf.text("Turnaround Time Details", 20, yPosition)
      yPosition += 10

      const turnaroundData = data.periods.map((period: any) => [
        period.period,
        period.average_turnaround ? `${period.average_turnaround} days` : "N/A",
        period.tasks_completed?.toString() || "0",
        period.efficiency ? `${period.efficiency}%` : "N/A"
      ])

      autoTable(pdf, {
        head: [["Period", "Avg Turnaround", "Tasks Completed", "Efficiency"]],
        body: turnaroundData,
        startY: yPosition,
        theme: "grid",
        headStyles: { fillColor: [168, 85, 247] },
        margin: { left: 20, right: 20 },
      })

      yPosition = (pdf as any).lastAutoTable.finalY + 10

      // Efficiency Analysis
      const avgEfficiency = data.periods.reduce((sum: number, period: any) => sum + (period.efficiency || 0), 0) / data.periods.length
      pdf.setFontSize(11)
      pdf.setTextColor(34, 197, 94)
      pdf.text("Efficiency Analysis:", 20, yPosition)
      yPosition += 8

      pdf.setFontSize(9)
      pdf.setTextColor(80, 80, 80)
      pdf.text(`• Average Efficiency: ${avgEfficiency.toFixed(1)}%`, 20, yPosition)
      yPosition += 5
      pdf.text(`• Total Periods Analyzed: ${data.periods.length}`, 20, yPosition)
    }
  }


  // Updated Technician Performance PDF
  const generateTechnicianPerformancePDF = (pdf: jsPDF, data: any, startY: number) => {
    let yPosition = startY

    pdf.setFontSize(14)
    pdf.setTextColor(0, 0, 0)
    pdf.text("Technician Performance Report", 20, yPosition)
    yPosition += 15

    // Summary
    const technicianPerformance = data.technician_performance || []
    const totalTechnicians = data.total_technicians || 0

    const summaryData = [
      ["Total Technicians", totalTechnicians.toString()],
      ["Date Range", data.date_range ? data.date_range.replace(/_/g, ' ') : "Last 30 Days"],
      ["Active Technicians", technicianPerformance.length.toString()],
      ["Total Completed Tasks", technicianPerformance.reduce((sum: number, tech: any) => sum + tech.completed_tasks, 0).toString()]
    ]

    // Use autoTable directly
    autoTable(pdf, {
      head: [["Metric", "Value"]],
      body: summaryData,
      startY: yPosition,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 20, right: 20 },
    })

    yPosition = (pdf as any).lastAutoTable.finalY + 15

    // Rest of your function remains the same...
    if (technicianPerformance.length > 0) {
      pdf.setFontSize(12)
      pdf.text("Technician Performance Details", 20, yPosition)
      yPosition += 10

      const performanceData = technicianPerformance.map((tech: any) => [
        tech.technician_name,
        tech.completed_tasks?.toString() || "0",
        tech.in_progress_tasks?.toString() || "0",
        tech.total_tasks?.toString() || "0",
        `${tech.efficiency || '0'}%`,
        `TSh ${tech.total_revenue?.toLocaleString() || '0'}`,
        tech.avg_completion_hours > 0 ? `${tech.avg_completion_hours}h` : 'N/A',
        `${tech.rating || '0'}/5`
      ])

      autoTable(pdf, {
        head: [["Technician", "Completed", "In Progress", "Total", "Efficiency", "Revenue", "Avg Time", "Rating"]],
        body: performanceData,
        startY: yPosition,
        theme: "grid",
        headStyles: { fillColor: [139, 92, 246] },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 8 },
        pageBreak: 'auto'
      })

      yPosition = (pdf as any).lastAutoTable.finalY + 10

      // Performance Analysis
      const avgEfficiency = technicianPerformance.reduce((sum: number, tech: any) => sum + (tech.efficiency || 0), 0) / technicianPerformance.length
      const totalRevenue = technicianPerformance.reduce((sum: number, tech: any) => sum + (tech.total_revenue || 0), 0)
      const topPerformer = technicianPerformance.reduce((best: any, current: any) =>
        (!best || current.efficiency > best.efficiency) ? current : best, null)

      pdf.setFontSize(11)
      pdf.setTextColor(34, 197, 94)
      pdf.text("Performance Analysis:", 20, yPosition)
      yPosition += 8

      pdf.setFontSize(9)
      pdf.setTextColor(80, 80, 80)
      if (topPerformer) {
        pdf.text(`• Top Performer: ${topPerformer.technician_name} (${topPerformer.efficiency}% efficiency)`, 20, yPosition)
        yPosition += 5
      }
      pdf.text(`• Average Efficiency: ${avgEfficiency.toFixed(1)}%`, 20, yPosition)
      yPosition += 5
      pdf.text(`• Total Revenue Generated: TSh ${totalRevenue.toLocaleString()}`, 20, yPosition)
    }
  }

  // Inventory Location PDF
  const generateInventoryLocationPDF = (pdf: jsPDF, data: any, startY: number) => {
    let yPosition = startY

    pdf.setFontSize(14)
    pdf.setTextColor(0, 0, 0)
    pdf.text("Inventory Location Report", 20, yPosition)
    yPosition += 15

    // Summary
    const summary = data.summary || {}
    const summaryData = [
      ["Total Laptops", summary.total_laptops?.toString() || "0"],
      ["Total Capacity", summary.total_capacity?.toString() || "0"],
      ["Overall Utilization", `${summary.overall_utilization || '0'}%`],
      ["Available Capacity", summary.total_capacity && summary.total_laptops ?
        (summary.total_capacity - summary.total_laptops).toString() : "0"]
    ]

    pdf.autoTable({
      head: [["Metric", "Value"]],
      body: summaryData,
      startY: yPosition,
      theme: "grid",
      headStyles: { fillColor: [20, 184, 166] },
      margin: { left: 20, right: 20 },
    })

    yPosition = (pdf as any).lastAutoTable.finalY + 15

    // Location Data
    if (data.locations && data.locations.length > 0) {
      pdf.setFontSize(12)
      pdf.text("Inventory by Location", 20, yPosition)
      yPosition += 10

      const locationData = data.locations.map((location: any) => [
        location.location,
        location.laptop_count?.toString() || "0",
        location.capacity?.toString() || "0",
        `${location.utilization || '0'}%`,
        location.utilization >= 90 ? "Full" :
          location.utilization >= 70 ? "Busy" : "Available"
      ])

      pdf.autoTable({
        head: [["Location", "Laptop Count", "Capacity", "Utilization", "Status"]],
        body: locationData,
        startY: yPosition,
        theme: "grid",
        headStyles: { fillColor: [245, 158, 11] },
        margin: { left: 20, right: 20 },
      })

      yPosition = (pdf as any).lastAutoTable.finalY + 10

      // Capacity Analysis
      const fullLocations = data.locations.filter((loc: any) => loc.utilization >= 90).length
      const availableLocations = data.locations.filter((loc: any) => loc.utilization < 70).length

      pdf.setFontSize(11)
      pdf.setTextColor(59, 130, 246)
      pdf.text("Capacity Analysis:", 20, yPosition)
      yPosition += 8

      pdf.setFontSize(9)
      pdf.setTextColor(80, 80, 80)
      pdf.text(`• Full Locations: ${fullLocations}`, 20, yPosition)
      yPosition += 5
      pdf.text(`• Available Locations: ${availableLocations}`, 20, yPosition)
      yPosition += 5
      pdf.text(`• Total Locations: ${data.locations.length}`, 20, yPosition)
    }
  }

  //technician Workload PDF
  // Technician Workload PDF (Enhanced)
  const generateTechnicianWorkloadPDF = (pdf: jsPDF, data: any, startY: number) => {
    let yPosition = startY

    pdf.setFontSize(14)
    pdf.setTextColor(0, 0, 0)
    pdf.text("Technician Workload Report", 20, yPosition)
    yPosition += 15

    // Summary
    const workloadData = data.workload_data || []
    const totalActiveTechnicians = data.total_active_technicians || 0
    const totalAssignedTasks = data.total_assigned_tasks || 0

    const techniciansWithTasks = workloadData.filter((tech: any) => tech.tasks > 0).length
    const averageWorkload = totalActiveTechnicians > 0 ? (totalAssignedTasks / totalActiveTechnicians).toFixed(1) : "0"
    const maxWorkload = workloadData.length > 0 ? Math.max(...workloadData.map((tech: any) => tech.tasks)) : 0

    const summaryData = [
      ["Total Technicians", totalActiveTechnicians.toString()],
      ["Total Assigned Tasks", totalAssignedTasks.toString()],
      ["Technicians with Tasks", techniciansWithTasks.toString()],
      ["Average Workload", `${averageWorkload} tasks`],
      ["Maximum Workload", `${maxWorkload} tasks`]
    ]

    autoTable(pdf, {
      head: [["Metric", "Value"]],
      body: summaryData,
      startY: yPosition,
      theme: "grid",
      headStyles: { fillColor: [249, 115, 22] },
      margin: { left: 20, right: 20 },
    })

    yPosition = (pdf as any).lastAutoTable.finalY + 15

    // Workload Data
    if (workloadData.length > 0) {
      pdf.setFontSize(12)
      pdf.text("Technician Workload Details", 20, yPosition)
      yPosition += 10

      const workloadTableData = workloadData.map((tech: any) => [
        tech.name,
        tech.tasks?.toString() || "0",
        tech.in_progress?.toString() || "0",
        tech.awaiting_parts?.toString() || "0",
        tech.pending?.toString() || "0",
        tech.tasks === 0 ? "Available" :
          tech.tasks <= 2 ? "Light" :
            tech.tasks <= 5 ? "Moderate" : "Heavy"
      ])

      autoTable(pdf, {
        head: [["Technician", "Total Tasks", "In Progress", "Awaiting Parts", "Pending", "Workload Status"]],
        body: workloadTableData,
        startY: yPosition,
        theme: "grid",
        headStyles: { fillColor: [220, 38, 38] },
        margin: { left: 20, right: 20 },
        pageBreak: 'auto'
      })

      yPosition = (pdf as any).lastAutoTable.finalY + 10

      // Capacity Analysis
      const availableTechnicians = workloadData.filter((tech: any) => tech.tasks === 0).length
      const overloadedTechnicians = workloadData.filter((tech: any) => tech.tasks > 5).length

      pdf.setFontSize(11)
      pdf.setTextColor(34, 197, 94)
      pdf.text("Capacity Analysis:", 20, yPosition)
      yPosition += 8

      pdf.setFontSize(9)
      pdf.setTextColor(80, 80, 80)
      pdf.text(`• Available Technicians: ${availableTechnicians} out of ${totalActiveTechnicians}`, 20, yPosition)
      yPosition += 5
      pdf.text(`• Overloaded Technicians: ${overloadedTechnicians}`, 20, yPosition)
      yPosition += 5
      pdf.text(`• Optimal Utilization: ${techniciansWithTasks}/${totalActiveTechnicians} technicians assigned`, 20, yPosition)
    }
  }

  // Generic PDF for unknown report types
  const generateGenericPDF = (pdf: jsPDF, data: any, reportId: string, startY: number) => {
    let yPosition = startY

    pdf.setFontSize(14)
    pdf.setTextColor(0, 0, 0)
    pdf.text(`${reportId.replace(/-/g, ' ')} Report`, 20, yPosition)
    yPosition += 15

    // Convert data to table format for generic reports
    const flattenObject = (obj: any, prefix = ''): string[][] => {
      return Object.keys(obj).reduce((acc: string[][], key) => {
        const pre = prefix.length ? prefix + '.' : ''
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          return [...acc, ...flattenObject(obj[key], pre + key)]
        } else {
          return [...acc, [pre + key, obj[key]?.toString() || '']]
        }
      }, [])
    }

    const tableData = flattenObject(data)

    if (tableData.length > 0) {
      pdf.autoTable({
        head: [["Field", "Value"]],
        body: tableData,
        startY: yPosition,
        theme: "grid",
        headStyles: { fillColor: [100, 100, 100] },
        margin: { left: 20, right: 20 },
      })
    } else {
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.text("No data available for this report", 20, yPosition)
    }
  }



  // In your ReportsOverview component
  const handleViewReport = async (reportId: string) => {
    try {
      // Map frontend report IDs to backend API endpoints
      const apiEndpoints: { [key: string]: string } = {
        'revenue-summary': '/api/reports/revenue-summary/',
        'outstanding-payments': '/api/reports/outstanding-payments/',
        'payment-methods': '/api/reports/payment-methods/',
        'task-status': '/api/reports/task-status/',
        'turnaround-time': '/api/reports/turnaround-time/',
        'workload': '/api/reports/technician-workload/',
        'performance': '/api/reports/technician-performance/'
      }

      const endpoint = apiEndpoints[reportId]
      if (!endpoint) {
        console.warn(`No endpoint mapped for report: ${reportId}`)
        return
      }

      // Build URL with last_30_days parameter for all predefined reports
      let url = `http://localhost:8000${endpoint}`

      console.log('Fetching report from URL:', url);

      // Add date_range parameter for reports that support it
      const dateRangeReports = ['revenue-summary', 'technician-performance', 'payment-methods']
      if (dateRangeReports.includes(reportId)) {
        const params = new URLSearchParams({
          date_range: 'last_30_days' // Always use last 30 days for predefined reports
        })
        url += `?${params.toString()}`
      }

      let token: string | null = null
      const authTokens = localStorage.getItem('auth_tokens')
      if (authTokens) {
        try {
          const parsedTokens = JSON.parse(authTokens)
          token = parsedTokens?.access ?? null
        } catch (e) {
          console.warn('Failed to parse auth_tokens from localStorage', e)
        }
      }

      console.log('Using token:', token);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      const response = await fetch(url, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setSelectedReport({ id: reportId, data })
      setIsViewerOpen(true)

    } catch (error) {
      console.error('Error fetching report:', error)
      alert('Failed to load report data')
    }
  }
  // const handleViewReport = (reportId: string) => {
  //   // Navigate to specific report page
  //   window.location.href = `/dashboard/reports/${reportId}`
  // }

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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleViewReport(report.id)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                        onClick={() => generatePDF(report.id)}
                      >
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

      {/* Report Viewer Modal */}
      {isViewerOpen && selectedReport && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={handleBackdropClick}
        >
          <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  {(() => {
                    const report = [...financialReports, ...operationalReports, ...technicianReports]
                      .find(r => r.id === selectedReport.id);
                    const IconComponent = report?.icon || BarChart3;
                    return <IconComponent className="h-5 w-5 text-red-600" />;
                  })()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedReport.data.report?.title ||
                      [...financialReports, ...operationalReports, ...technicianReports]
                        .find(r => r.id === selectedReport.id)?.title ||
                      selectedReport.id.replace(/-/g, ' ')}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {[...financialReports, ...operationalReports, ...technicianReports]
                      .find(r => r.id === selectedReport.id)?.description ||
                      'Live report data from your backend'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => generatePDF(selectedReport.id)}
                  disabled={isGeneratingPDF === selectedReport.id}
                  className="text-gray-600 hover:text-gray-700"
                >
                  {isGeneratingPDF === selectedReport.id ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                      PDF
                    </div>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleCloseViewer}
                  className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                  title="Close (Esc)"
                >
                  <span className="text-lg">×</span>
                </Button>
              </div>
            </div>

            {/* Report Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <ReportViewer
                apiResponse={selectedReport.data}
                onGeneratePDF={() => generatePDF(selectedReport.id)}
                isGeneratingPDF={isGeneratingPDF === selectedReport.id}
              />
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 sticky bottom-0">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Report generated on {new Date().toLocaleString()}
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="border-gray-300"
                    onClick={handleCloseViewer}
                  >
                    Close Report
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// function useEffect(arg0: () => () => void, arg1: boolean[]) {
//   throw new Error("Function not implemented.")
// }

