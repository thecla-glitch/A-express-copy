"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard/layouts/dashboard-layout"
import { CustomersOverview } from "@/components/customers/customers-overview"

export default function CustomersPage() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout>
      <CustomersOverview />
    </DashboardLayout>
  )
}
