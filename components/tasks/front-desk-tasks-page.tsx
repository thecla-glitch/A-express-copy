'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/core/button";
import { Plus } from "lucide-react";
import { TasksDisplay } from "./tasks-display";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/layout/tabs";
import { useTasks, useTechnicians, useUpdateTask } from "@/hooks/use-data";

export function FrontDeskTasksPage() {
  const router = useRouter();
  const { data: tasks, isLoading, isError, error } = useTasks();
  const { data: technicians } = useTechnicians();
  const updateTaskMutation = useUpdateTask();

  const handleRowClick = (task: any) => {
    router.push(`/dashboard/tasks/${task.title}`);
  };

  const handleApprove = async (taskTitle: string) => {
    updateTaskMutation.mutate({ taskId: taskTitle, data: { status: "Ready for Pickup" } });
  };

  const handleReject = async (taskTitle: string, notes: string) => {
    updateTaskMutation.mutate({ taskId: taskTitle, data: { status: "In Progress", qc_notes: notes } });
  };

  const handlePickedUp = async (taskTitle: string) => {
    updateTaskMutation.mutate({ taskId: taskTitle, data: { status: "Picked Up" } });
  };

  const handleNotifyCustomer = (taskTitle: string, customerName: string) => {
    alert(`Notifying ${customerName} for task ${taskTitle}`);
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
        <div className="flex-1 space-y-6 p-6">
            <div className="text-red-500">Error: {error.message}</div>
        </div>
    )
  }

  const unassignedTasks = tasks?.filter(task => task.status === "Pending" || task.status === "In Progress") || [];
  const completedTasks = tasks?.filter(task => task.status === "Completed") || [];
  const readyForPickupTasks = tasks?.filter(task => task.status === "Ready for Pickup") || [];

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Front Desk Tasks</h1>
          <p className="text-gray-600 mt-2">Manage tasks assigned to the front desk.</p>
        </div>
        <div className="flex gap-4">
          <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
            <a href="/dashboard/tasks/new">
              <Plus className="mr-2 h-4 w-4" />
              Create New Task
            </a>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="not-completed">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100">
          <TabsTrigger value="not-completed" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Not Completed</TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Completed Tasks</TabsTrigger>
          <TabsTrigger value="pickup" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Ready For Pickup</TabsTrigger>
        </TabsList>
        <TabsContent value="not-completed">
          <TasksDisplay
            tasks={unassignedTasks}
            technicians={technicians || []}
            onRowClick={handleRowClick}
            showActions={false}
            isManagerView={true}
          />
        </TabsContent>
        <TabsContent value="completed">
          <TasksDisplay
            tasks={completedTasks}
            technicians={technicians || []}
            onRowClick={handleRowClick}
            showActions={true}
            onApprove={handleApprove}
            onReject={handleReject}
            isFrontDeskCompletedView={true}
          />
        </TabsContent>
        <TabsContent value="pickup">
          <TasksDisplay
            tasks={readyForPickupTasks}
            technicians={technicians || []}
            onRowClick={handleRowClick}
            showActions={true}
            isPickupView={true}
            onPickedUp={handlePickedUp}
            onNotifyCustomer={handleNotifyCustomer}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
