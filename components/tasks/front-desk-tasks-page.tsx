"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/core/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { UserResponse as User } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/layout/tabs";
import UnassignedTasksList from "./unassigned-tasks-list";
import AllTasksList from "./all-tasks-list";
import ReadyForPickupTasksList from "./ready-for-pickup-tasks-list";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/feedback/dialog";
import { NewTaskForm } from "./new-task-form";

interface Location {
  id: number;
  name: string;
}

export function FrontDeskTasksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
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

        const locationsResponse = await apiClient.getLocations();
        if (locationsResponse.data) {
          setLocations(locationsResponse.data);
        } else if (locationsResponse.error) {
          setError(locationsResponse.error as string);
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

  const completedTasks = tasks.filter(task => ["Completed", "Picked Up"].includes(task.status));
  const readyForPickupTasks = tasks.filter(task => task.status === "Ready for Pickup");

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Front Desk Tasks</h1>
          <p className="text-gray-600 mt-2">Manage unassigned, completed, and ready for pickup tasks.</p>
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
              <NewTaskForm onClose={handleTaskCreated} locations={locations} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="unassigned">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100">
          <TabsTrigger value="unassigned" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Unassigned Tasks</TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Completed</TabsTrigger>
          <TabsTrigger value="pickup" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Ready For Pickup</TabsTrigger>
        </TabsList>
        <TabsContent value="unassigned">
          <UnassignedTasksList />
        </TabsContent>
        <TabsContent value="completed">
          <AllTasksList tasks={completedTasks} onRowClick={handleRowClick} />
        </TabsContent>
        <TabsContent value="pickup">
           <ReadyForPickupTasksList tasks={readyForPickupTasks} technicians={technicians} onRowClick={handleRowClick} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default FrontDeskTasksPage;
