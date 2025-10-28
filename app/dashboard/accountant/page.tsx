import AccountantDashboard from "@/components/dashboard/overviews/accountant-dashboard";
import { DashboardLayout } from "@/components/dashboard/layouts/dashboard-layout";

export default function AccountantPage() {
  return (
    <DashboardLayout>
      <AccountantDashboard />
    </DashboardLayout>
  );
}
