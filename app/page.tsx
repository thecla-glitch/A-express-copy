"use client"

import { useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/components/login-form"
import { DashboardPage } from "@/components/dashboard-page"

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">
            <span className="text-red-600">A</span>
            <sup className="text-gray-500 text-lg font-medium">+</sup>
            <span className="text-gray-900 ml-1">express</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <LoginForm />
      </div>
    )
  }

  return <DashboardPage />
}
