'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { deleteTask, updateTask } from "@/lib/api-client";
import { TasksDisplay } from "./tasks-display";
import { useTasks, useUpdateTask } from "@/hooks/use-tasks";
import { useTechnicians } from "@/hooks/use-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AccountantTasksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading, isError, error } = useTasks();
  const { data: technicians } = useTechnicians();

  const updateTaskMutation = useUpdateTask();

  const handleRowClick = (task: any) => {
    router.push(`/dashboard/tasks/${task.title}`);
  };

  const handleMarkAsPaid = (taskTitle: string) => {
    updateTaskMutation.mutate({ id: taskTitle, updates: { payment_status: "Paid", paid_date: new Date().toISOString() } });
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

  const unpaidTasks = tasks?.filter(task => task.payment_status !== "Paid" && task.status !== "Picked Up") || [];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Accountant Tasks</h1>
          <p className="text-gray-600 mt-2">Tasks with outstanding payments.</p>
        </div>
      </div>

      {/* Main Content */}
      <TasksDisplay
        tasks={unpaidTasks}
        technicians={technicians || []}
        onRowClick={handleRowClick}
        showActions={true}
        onMarkAsPaid={handleMarkAsPaid}
        isAccountantView={true}
      />
    </div>
  );
}
