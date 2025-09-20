'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { InWorkshopTasksList } from "@/components/tasks/in-workshop-tasks-list"
import { DashboardLayout } from "@/components/dashboard/layouts/dashboard-layout"

export default function WorkshopPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && (user.role !== 'Technician' || !user.is_workshop)) {
      router.push("/dashboard")
    }
  }, [user, router])

  if (!user || (user.role !== 'Technician' || !user.is_workshop)) {
    return null // Or a loading spinner
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Workshop Tasks</h1>
        <InWorkshopTasksList />
      </div>
    </DashboardLayout>
  )
}