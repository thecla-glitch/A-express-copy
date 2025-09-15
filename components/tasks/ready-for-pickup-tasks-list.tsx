"use client"

import { TasksDisplay } from "./tasks-display"
import { User } from "@/lib/use-user-management"

interface ReadyForPickupTasksListProps {
  tasks: any[];
  technicians: User[];
  onRowClick: (task: any) => void;
}

export function ReadyForPickupTasksList({ tasks, technicians, onRowClick }: ReadyForPickupTasksListProps) {
  return (
    <div className="flex-1 space-y-6 p-6">
      <TasksDisplay tasks={tasks} technicians={technicians} onRowClick={onRowClick} showActions={false} />
    </div>
  )
}

export default ReadyForPickupTasksList;
