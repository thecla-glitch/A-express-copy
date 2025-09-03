"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DatabaseManagementPage } from "@/components/database-management-page"

export default function AdminDatabasePage() {
  return (
    <DashboardLayout>
      <DatabaseManagementPage />
    </DashboardLayout>
  )
}
