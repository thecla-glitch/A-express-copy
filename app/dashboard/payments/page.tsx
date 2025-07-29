"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PaymentsOverview } from "@/components/payments-overview"

export default function PaymentsPage() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout>
      <PaymentsOverview />
    </DashboardLayout>
  )
}
