"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/core/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getTasks, deleteTask, apiClient } from "@/lib/api-client";
import { User } from "@/lib/use-user-management";
import { TasksDisplay } from "./tasks-display";
import { NewTaskForm } from "./new-task-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/feedback/dialog";

// Define the custom response type
interface CustomApiResponse<T> {
  data?: T;
  error?: string | null;
}

export function ManagerTasksPage() {
  const { user } = useAuth();
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
        const tasksResponse: CustomApiResponse<any[]> = await getTasks();
        if (tasksResponse.data) {
          setTasks(tasksResponse.data);
        } else if (tasksResponse.error) {
          setError(tasksResponse.error);
        }

        const techResponse: CustomApiResponse<User[]> = await apiClient.get("/users/role/Technician/");
        if (techResponse.data) {
          setTechnicians(techResponse.data);
        } else if (techResponse.error) {
          setError(techResponse.error);
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

  const handleDeleteTask = async (taskId: string) => {
    const response: CustomApiResponse<void> = await deleteTask(taskId);
    if (response.error) {
      console.error("Error deleting task:", response.error);
    } else {
      setTasks(tasks.filter((task) => task.id !== taskId));
    }
  };

  const handleRowClick = (task: any) => {
    router.push(`/dashboard/tasks/${task.id}`);
  };

  const handleProcessPickup = (taskId: string) => {
    const updateField = async (field: string, value: any) => {
      try {
        await apiClient.patch(`/tasks/${taskId}/`, { [field]: value });
        setTasks((prev) =>
          prev.map((task) => (task.id === taskId ? { ...task, [field]: value } : task))
        );
      } catch (error) {
        console.error(`Error updating task ${taskId}:`, error);
      }
    };
    updateField("status", "Completed");
    updateField("current_location", "Completed");
    updateField("payment_status", "Paid");
    alert("Pickup processed successfully!");
  };

  const handleTaskCreated = () => {
    setIsCreateModalOpen(false);
    // Refresh tasks list
    getTasks().then((res: CustomApiResponse<any[]>) => {
      if (res.data) setTasks(res.data);
    });
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manager Tasks Portal</h1>
          <p className="text-gray-600 mt-2">Complete task management with Front Desk workflow capabilities</p>
        </div>
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

      {/* Main Content */}
      <TasksDisplay
        tasks={tasks}
        technicians={technicians}
        onRowClick={handleRowClick}
        showActions={true}
        onDeleteTask={handleDeleteTask}
        onProcessPickup={handleProcessPickup}
      />
    </div>
  );
}