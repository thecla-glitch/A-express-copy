'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient, UserResponse as User } from "@/lib/api";
import { TasksDisplay } from "./tasks-display";

export function TaskHistoryPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<User[]>([]);

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

  const historicalTasks = tasks.filter(task => ["Picked Up", "Completed", "Terminated"].includes(task.status));

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
        showActions={false}
      />
    </div>
  );
}
