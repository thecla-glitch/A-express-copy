'use client';

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/core/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { deleteTask, updateTask } from "@/lib/api-client";
import { TasksDisplay } from "./tasks-display";
import { BrandManager } from "../brands/brand-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/layout/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/feedback/dialog";
import { useTasks, useUpdateTask } from "@/hooks/use-tasks";
import { useTechnicians } from "@/hooks/use-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ManagePaymentMethodsDialog from "./manage-payment-methods-dialog";

type Tab = 'pending' | 'completed';

export function ManagerTasksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [pages, setPages] = useState({
    pending: 1,
    completed: 1,
  });

  const { data: tasksData, isLoading, isError, error } = useTasks({
    page: pages[activeTab],
    status: activeTab === "pending" ? "Pending,In Progress,Awaiting Parts,Assigned - Not Accepted,Diagnostic" : "Completed,Ready for Pickup",
  });

  const { data: technicians } = useTechnicians();

  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isManagePaymentMethodsDialogOpen, setIsManagePaymentMethodsDialogOpen] = useState(false);

  const deleteTaskMutation = useMutation({
    mutationFn: (taskTitle: string) => deleteTask(taskTitle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTaskMutation = useUpdateTask();

  const handleRowClick = (task: any) => {
    router.push(`/dashboard/tasks/${task.title}`);
  };

  const handleProcessPickup = (taskTitle: string) => {
    updateTaskMutation.mutate({ id: taskTitle, updates: { status: "Completed", current_location: "Completed", payment_status: "Paid" } });
    alert("Pickup processed successfully!");
  };

  const handleApprove = (taskTitle: string) => {
    updateTaskMutation.mutate({ id: taskTitle, updates: { status: "Completed" } });
  };

  const handleReject = (taskTitle: string, notes: string) => {
    updateTaskMutation.mutate({ id: taskTitle, updates: { status: "In Progress", qc_notes: notes } });
  };

  const handleTerminateTask = (taskTitle: string) => {
    updateTaskMutation.mutate({ id: taskTitle, updates: { status: "Terminated" } });
  };
  
  const handlePageChange = (tab: Tab, direction: 'next' | 'previous') => {
    setPages(prev => ({
      ...prev,
      [tab]: direction === 'next' ? prev[tab] + 1 : prev[tab] - 1,
    }));
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

  const tasks = useMemo(() => tasksData?.results || [], [tasksData]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as Tab);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manager Tasks Portal</h1>
          <p className="text-gray-600 mt-2">Complete task management with Front Desk workflow capabilities</p>
        </div>
        <div className="flex gap-4">
          <Dialog open={isBrandModalOpen} onOpenChange={setIsBrandModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Brands
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Manage Brands</DialogTitle>
              </DialogHeader>
              <BrandManager />
            </DialogContent>
          </Dialog>
          <Dialog open={isManagePaymentMethodsDialogOpen} onOpenChange={setIsManagePaymentMethodsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Payment Methods
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Manage Payment Methods</DialogTitle>
              </DialogHeader>
              <ManagePaymentMethodsDialog onClose={() => setIsManagePaymentMethodsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
          <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
            <a href="/dashboard/tasks/new">
              <Plus className="mr-2 h-4 w-4" />
              Create New Task
            </a>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pending" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2 bg-gray-100">
          <TabsTrigger value="pending" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Pending and in Progress</TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <TasksDisplay
            tasks={tasks}
            technicians={technicians || []}
            onRowClick={handleRowClick}
            showActions={true}
            onDeleteTask={deleteTaskMutation.mutate}
            onProcessPickup={handleProcessPickup}
            onTerminateTask={handleTerminateTask}
            isManagerView={true}
          />
          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={() => handlePageChange('pending', 'previous')} disabled={!tasksData?.previous}>Previous</Button>
            <Button onClick={() => handlePageChange('pending', 'next')} disabled={!tasksData?.next}>Next</Button>
          </div>
        </TabsContent>
        <TabsContent value="completed">
          <TasksDisplay
            tasks={tasks}
            technicians={technicians || []}
            onRowClick={handleRowClick}
            showActions={true}
            onDeleteTask={deleteTaskMutation.mutate}
            onProcessPickup={handleProcessPickup}
            isCompletedTab={true}
            isManagerView={true}
          />
          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={() => handlePageChange('completed', 'previous')} disabled={!tasksData?.previous}>Previous</Button>
            <Button onClick={() => handlePageChange('completed', 'next')} disabled={!tasksData?.next}>Next</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
