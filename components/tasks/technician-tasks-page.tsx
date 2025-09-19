'use client'

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/layout/tabs"
import { UnassignedTasksList } from "./unassigned-tasks-list"
import { ActiveTasksList } from "./active-tasks-list"
import { CollaborationRequestsList } from "../dashboard/collaboration/collaboration-requests-list"

export function TechnicianTasksPage() {
  const [refresh, setRefresh] = useState(false)

  return (
    <div className="flex-1 space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tasks</h1>
      <Tabs defaultValue="unassigned" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="unassigned" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">Unassigned</TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">Active Tasks</TabsTrigger>
          <TabsTrigger value="collaborations" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">Collaborations</TabsTrigger>
        </TabsList>
        <TabsContent value="unassigned">
          <UnassignedTasksList />
        </TabsContent>
        <TabsContent value="active">
          <ActiveTasksList refresh={refresh} setRefresh={setRefresh} />
        </TabsContent>
        <TabsContent value="collaborations">
          <CollaborationRequestsList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
