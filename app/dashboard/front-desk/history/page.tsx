import { DashboardLayout } from "@/components/dashboard/layouts/dashboard-layout";
import { FrontDeskHistoryPage } from "@/components/tasks/front-desk-history-page";

export default function HistoryPage() {
  return (
    <DashboardLayout>
      <FrontDeskHistoryPage />
    </DashboardLayout>
  );
}
