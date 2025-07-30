"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CustomReportBuilder } from "@/components/custom-report-builder"

export default function CustomReportPage() {
  return (
    <DashboardLayout>
      <CustomReportBuilder />
    </DashboardLayout>
  )
}
