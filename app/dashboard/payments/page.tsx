"use client"

import { DashboardLayout } from "@/components/dashboard/layouts/dashboard-layout"
import { PaymentsOverview } from "@/components/payments/payments-overview"

export default function PaymentsPage() {
  return (
    <DashboardLayout>
      <PaymentsOverview />
    </DashboardLayout>
  )
}