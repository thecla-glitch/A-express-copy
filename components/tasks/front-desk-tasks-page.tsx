'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/core/button";
import { Plus } from "lucide-react";
import { apiClient, UserResponse as User } from "@/lib/api";
import { TasksDisplay } from "./tasks-display";
import { NewTaskForm } from "./new-task-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/layout/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/feedback/dialog";

export function FrontDeskTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tasksResponse = await apiClient.getTasks();
        if (tasksResponse.data) {
          setTasks(tasksResponse.data);
        } else if (tasksResponse.error) {
          setError(tasksResponse.error);
        }

        const techResponse = await apiClient.listUsersByRole("Technician");
        if (techResponse.data) {
          setTechnicians(techResponse.data);
        } else if (techResponse.error) {
          setError(techResponse.error as string);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRowClick = (task: any) => {
    router.push(`/dashboard/tasks/${task.id}`);
  };

  const handleTaskCreated = () => {
    setIsCreateModalOpen(false);
    // Refresh tasks list
    apiClient.getTasks().then((res) => {
      if (res.data) setTasks(res.data);
    });
  };

  const unassignedTasks = tasks.filter(task => task.status === "Pending");
  const completedTasks = tasks.filter(task => task.status === "Completed");
  const readyForPickupTasks = tasks.filter(task => task.status === "Ready for Pickup");

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Front Desk Tasks</h1>
          <p className="text-gray-600 mt-2">Manage tasks assigned to the front desk.</p>
        </div>
        <div className="flex gap-4">
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create New Repair Task</DialogTitle>
              </DialogHeader>
              <NewTaskForm onClose={handleTaskCreated} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="unassigned">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100">
          <TabsTrigger value="unassigned" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Unassigned Tasks</TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Completed Tasks</TabsTrigger>
          <TabsTrigger value="pickup" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Ready For Pickup</TabsTrigger>
        </TabsList>
        <TabsContent value="unassigned">
          <TasksDisplay
            tasks={unassignedTasks}
            technicians={technicians}
            onRowClick={handleRowClick}
            showActions={false}
          />
        </TabsContent>
        <TabsContent value="completed">
          <TasksDisplay
            tasks={completedTasks}
            technicians={technicians}
            onRowClick={handleRowClick}
            showActions={false}
          />
        </TabsContent>
        <TabsContent value="pickup">
          <TasksDisplay
            tasks={readyForPickupTasks}
            technicians={technicians}
            onRowClick={handleRowClick}
            showActions={false}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
