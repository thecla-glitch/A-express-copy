import AccountantTasksPage from "@/components/tasks/accountant-tasks-page";
import { DashboardLayout } from "@/components/dashboard/layouts/dashboard-layout";

export default function AccountantTasks() {
  return (
    <DashboardLayout>
      <AccountantTasksPage />
    </DashboardLayout>
  );
}
