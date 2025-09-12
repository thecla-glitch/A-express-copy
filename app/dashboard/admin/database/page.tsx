"use client"

import { DashboardLayout } from "@/components/dashboard/layouts/dashboard-layout"
import { DatabaseManagementPage } from "@/components/system/database-management-page"

export default function AdminDatabasePage() {
  return (
    <DashboardLayout>
      <DatabaseManagementPage />
    </DashboardLayout>
  )
}
