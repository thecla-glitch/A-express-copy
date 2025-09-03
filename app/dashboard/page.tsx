"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AdminDashboard } from "@/components/admin-dashboard"
import { ManagerDashboard } from "@/components/manager-dashboard"
import { TechnicianDashboard } from "@/components/technician-dashboard"
import { FrontDeskDashboard } from "@/components/front-desk-dashboard"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const renderDashboard = () => {
    switch (user.role) {
      case "Administrator":
        return <AdminDashboard />
      case "Manager":
        return <ManagerDashboard />
      case "Technician":
        return <TechnicianDashboard />
      case "Front Desk":
        return <FrontDeskDashboard />
      default:
        return <div>Unknown role</div>
    }
  }

  return <DashboardLayout>{renderDashboard()}</DashboardLayout>
}
