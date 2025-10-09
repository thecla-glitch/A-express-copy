'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTasks, listUsersByRole } from "@/lib/api-client";
import { UserResponse as User } from "@/lib/api";
import { TasksDisplay } from "./tasks-display";
import { ReturnTaskDialog } from "./return-task-dialog";

export function TaskHistoryPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tasksResponse = await getTasks();
        if (tasksResponse.data) {
          setTasks(tasksResponse.data.results);
        } else {
          setError("Failed to fetch tasks");
        }

        const techResponse = await listUsersByRole("Technician");
        if (techResponse.data) {
          setTechnicians(techResponse.data);
        } else {
          setError("Failed to fetch technicians");
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

  const handleReturnTask = (task: any) => {
    setSelectedTask(task);
    setIsReturnDialogOpen(true);
  };

  const historicalTasks = tasks.filter(task => ["Picked Up", "Terminated"].includes(task.status));

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Task History</h1>
          <p className="text-gray-600 mt-2">A log of all completed, picked up and terminated tasks.</p>
        </div>
      </div>

      <TasksDisplay
        tasks={historicalTasks}
        technicians={technicians}
        onRowClick={handleRowClick}
        showActions={true}
        isHistoryView={true}
        onReturnTask={handleReturnTask}
        isCompletedTab={true}
      />

      {selectedTask && (
        <ReturnTaskDialog
          task={selectedTask}
          isOpen={isReturnDialogOpen}
          onClose={() => setIsReturnDialogOpen(false)}
        />
      )}
    </div>
  );
}
