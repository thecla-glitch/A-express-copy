"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard/layouts/dashboard-layout"
import { SystemAuditLog } from "@/components/system/system-audit-log"

export default function AuditLogPage() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  // Check if user has admin access
  const hasAdminAccess = user?.role === "Administrator"

  if (!hasAdminAccess) {
    return (
      <DashboardLayout>
        <div className="flex-1 p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access the system audit log.</p>
            <p className="text-sm text-gray-500 mt-2">This page is restricted to Administrator accounts only.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <SystemAuditLog />
    </DashboardLayout>
  )
}
