"use client"

import {
  CreditCard,
  Home,
  Settings,
  Users,
  ClipboardList,
  FileText,
  UserCheck,
  Wrench,
  BarChart3,
  User,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// Role-based navigation items
const getNavigationItems = (userRole: string) => {
  const baseItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      roles: ["Administrator", "Manager", "Technician", "Front Desk"],
    },
    {
      title: "Profile",
      url: "/dashboard/profile",
      icon: User,
      roles: ["Administrator", "Manager", "Technician", "Front Desk"],
    },
  ]

  const roleSpecificItems = [
    // Admin and Manager items
    {
      title: "Manager Dashboard",
      url: "/dashboard/manager",
      icon: BarChart3,
      roles: ["Administrator", "Manager"],
    },
    {
      title: "All Tasks",
      url: "/dashboard/tasks",
      icon: ClipboardList,
      roles: ["Administrator", "Manager"],
    },
    {
      title: "Customers",
      url: "/dashboard/customers",
      icon: Users,
      roles: ["Administrator", "Manager"],
    },
    {
      title: "Reports",
      url: "/dashboard/reports",
      icon: FileText,
      roles: ["Administrator", "Manager"],
    },
    {
      title: "Payments",
      url: "/dashboard/payments",
      icon: CreditCard,
      roles: ["Administrator", "Manager"],
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
      roles: ["Administrator"],
    },

    // Technician specific items
    {
      title: "My Tasks",
      url: "/dashboard/technician",
      icon: Wrench,
      roles: ["Technician"],
    },

    // Front Desk specific items
    {
      title: "Front Desk",
      url: "/dashboard/front-desk",
      icon: UserCheck,
      roles: ["Front Desk"],
    },
  ]

  const allItems = [...baseItems, ...roleSpecificItems]
  return allItems.filter((item) => item.roles.includes(userRole))
}

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user) return null

  const navigationItems = getNavigationItems(user.role)

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="border-b border-gray-200 p-6">
        <div className="text-2xl font-bold">
          <span className="text-red-600">A</span>
          <sup className="text-gray-500 text-sm font-medium">+</sup>
          <span className="text-gray-900 ml-1">express</span>
        </div>
        <div className="text-sm text-gray-500 mt-1">{user.role} Portal</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url))
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <a
                        href={item.url}
                        className={`flex items-center gap-3 px-3 py-2 font-medium transition-colors ${
                          isActive ? "text-red-600 bg-red-50" : "text-gray-700 hover:text-red-600 hover:bg-red-50"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
