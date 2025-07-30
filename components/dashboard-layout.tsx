"use client"

import type React from "react"
import { WebSocketProvider } from "@/lib/websocket-context"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <WebSocketProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardHeader />
          <main className="flex-1 bg-gray-50">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </WebSocketProvider>
  )
}
