"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard/layouts/dashboard-layout"
import { UserProfilePage } from "@/components/users/user-profile-page"

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
