
"use client";

import { useTasks } from "@/hooks/use-tasks";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout/card";
import { ClipboardList, Package } from "lucide-react";

export function ManagerTasksKpi() {
  const { data: tasksData, isLoading, error } = useTasks({});

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading tasks</div>;
  }

  const tasks = tasksData?.results || [];

  const tasksReadyForPickup = tasks.filter(
    (task) => task.status === "Ready for Pickup"
  ).length;

  const activeTasks = tasks.filter(
    (task) => task.status === "In Progress" || task.status === "Completed"
  ).length;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeTasks}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Tasks Ready for Pickup
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tasksReadyForPickup}</div>
        </CardContent>
      </Card>
    </>
  )
}
