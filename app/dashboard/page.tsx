"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardPage } from "@/components/dashboard-page"

export default function Dashboard() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
      return
    }

    if (user) {
      // Role-based redirects
      if (user.role === "Technician") {
        router.push("/dashboard/technician")
        return
      }
      if (user.role === "Front Desk") {
        router.push("/dashboard/front-desk")
        return
      }
    }
  }, [isAuthenticated, user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">
            <span className="text-red-600">A</span>
            <sup className="text-gray-500 text-sm font-medium">+</sup>
            <span className="text-gray-900 ml-1">express</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Only show main dashboard for Admin and Manager roles
  if (user?.role === "Administrator" || user?.role === "Manager") {
    return (
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>
    )
  }

  return null
}
