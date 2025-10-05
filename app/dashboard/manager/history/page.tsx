import { TaskHistoryPage } from "@/components/tasks/task-history-page";
import { DashboardLayout } from "@/components/dashboard/layouts/dashboard-layout";

export default function History() {
  return (
    <DashboardLayout>
      <TaskHistoryPage />
    </DashboardLayout>
  );
}
