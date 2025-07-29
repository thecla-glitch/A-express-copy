"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { UserProfilePage } from "@/components/user-profile-page"

export default function ProfilePage() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout>
      <UserProfilePage />
    </DashboardLayout>
  )
}
