"use client"

import { DashboardLayout } from "@/components/dashboard/layouts/dashboard-layout"
import { CustomReportBuilder } from "@/components/reports/custom-report-builder"

export default function CustomReportPage() {
  return (
    <DashboardLayout>
      <CustomReportBuilder />
    </DashboardLayout>
  )
}
