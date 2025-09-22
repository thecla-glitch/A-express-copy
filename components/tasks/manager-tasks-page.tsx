'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/core/button";
import { Plus, MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiClient, UserResponse as User } from "@/lib/api";
import { TasksDisplay } from "./tasks-display";
import { NewTaskForm } from "./new-task-form";
import { LocationsManager } from "../locations/locations-manager";
import { BrandManager } from "../brands/brand-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/layout/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/feedback/dialog";

export function ManagerTasksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLocationsModalOpen, setIsLocationsModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

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

  const handleDeleteTask = async (taskTitle: string) => {
    const response = await apiClient.deleteTask(taskTitle);
    if (response.error) {
      console.error("Error deleting task:", response.error);
    } else {
      setTasks(tasks.filter((task) => task.title !== taskTitle));
    }
  };

  const handleRowClick = (task: any) => {
    router.push(`/dashboard/tasks/${task.title}`);
  };

  const handleProcessPickup = (taskTitle: string) => {
    const updateField = async (field: string, value: any) => {
      try {
        await apiClient.updateTask(taskTitle, { [field]: value });
        setTasks((prev) =>
          prev.map((task) => (task.title === taskTitle ? { ...task, [field]: value } : task))
        );
      } catch (error) {
        console.error(`Error updating task ${taskTitle}:`, error);
      }
    };
    updateField("status", "Completed");
    updateField("current_location", "Completed");
    updateField("payment_status", "Paid");
    alert("Pickup processed successfully!");
  };

  const handleApprove = async (taskTitle: string) => {
    try {
      await apiClient.updateTask(taskTitle, { status: "Completed" });
      setTasks((prev) =>
        prev.map((task) =>
          task.title === taskTitle ? { ...task, status: "Completed" } : task
        )
      );
    } catch (error) {
      console.error(`Error approving task ${taskTitle}:`, error);
    }
  };

  const handleReject = async (taskTitle: string, notes: string) => {
    try {
      await apiClient.updateTask(taskTitle, { status: "In Progress", qc_notes: notes });
      setTasks((prev) =>
        prev.map((task) =>
          task.title === taskTitle ? { ...task, status: "In Progress" } : task
        )
      );
    } catch (error) {
      console.error(`Error rejecting task ${taskTitle}:`, error);
    }
  };

  const handleTaskCreated = () => {
    setIsCreateModalOpen(false);
    // Refresh tasks list
    apiClient.getTasks().then((res) => {
      if (res.data) setTasks(res.data);
    });
  };

  const handleMarkAsPaid = async (taskTitle: string) => {
    try {
      await apiClient.updateTask(taskTitle, {
        payment_status: "Paid",
        paid_date: new Date().toISOString(),
      });
      setTasks((prev) =>
        prev.map((task) =>
          task.title === taskTitle
            ? {
                ...task,
                payment_status: "Paid",
                paid_date: new Date().toISOString(),
              }
            : task
        )
      );
    } catch (error) {
      console.error(`Error marking task ${taskTitle} as paid:`, error);
    }
  };

  const handleTerminateTask = async (taskTitle: string) => {
    try {
      await apiClient.updateTask(taskTitle, { status: "Terminated" });
      setTasks((prev) =>
        prev.map((task) =>
          task.title === taskTitle ? { ...task, status: "Terminated" } : task
        )
      );
    } catch (error) {
      console.error(`Error terminating task ${taskTitle}:`, error);
    }
  };

  const pendingAndInProgressTasks = tasks.filter(task => ["Pending", "In Progress", "Awaiting Parts", "Assigned - Not Accepted", "Diagnostic"].includes(task.status));
  const completedTasks = tasks.filter(task => ["Completed", "Ready for Pickup", "Picked Up"].includes(task.status));

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manager Tasks Portal</h1>
          <p className="text-gray-600 mt-2">Complete task management with Front Desk workflow capabilities</p>
        </div>
        <div className="flex gap-4">
          <Dialog open={isLocationsModalOpen} onOpenChange={setIsLocationsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <MapPin className="mr-2 h-4 w-4" />
                Locations
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Manage Locations</DialogTitle>
              </DialogHeader>
              <LocationsManager />
            </DialogContent>
          </Dialog>
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
          <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
            <a href="/dashboard/tasks/new">
              <Plus className="mr-2 h-4 w-4" />
              Create New Task
            </a>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100">
          <TabsTrigger value="pending" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Pending and in Progress</TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <TasksDisplay
            tasks={pendingAndInProgressTasks}
            technicians={technicians}
            onRowClick={handleRowClick}
            showActions={true}
            onDeleteTask={handleDeleteTask}
            onProcessPickup={handleProcessPickup}
            onTerminateTask={handleTerminateTask}
            isManagerView={true}
          />
        </TabsContent>
        <TabsContent value="completed">
          <TasksDisplay
            tasks={completedTasks}
            technicians={technicians}
            onRowClick={handleRowClick}
            showActions={true}
            onDeleteTask={handleDeleteTask}
            onProcessPickup={handleProcessPickup}
            isCompletedTab={true}
            onMarkAsPaid={handleMarkAsPaid}
            isManagerView={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
