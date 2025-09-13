'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/layout/tabs"
import { UnassignedTasksList } from "./unassigned-tasks-list"
import { ActiveTasksList } from "./active-tasks-list"
import { CollaborationRequestsList } from "../dashboard/collaboration/collaboration-requests-list"

export function TechnicianTasksPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tasks</h1>
      <Tabs defaultValue="unassigned">
        <TabsList>
          <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
          <TabsTrigger value="active">Active Tasks</TabsTrigger>
          <TabsTrigger value="collaborations">Collaborations</TabsTrigger>
        </TabsList>
        <TabsContent value="unassigned">
          <UnassignedTasksList />
        </TabsContent>
        <TabsContent value="active">
          <ActiveTasksList />
        </TabsContent>
        <TabsContent value="collaborations">
          <CollaborationRequestsList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
