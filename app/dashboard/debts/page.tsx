"use client";
import DebtsPage from "@/components/tasks/debts-page";
import { DashboardLayout } from "@/components/dashboard/layouts/dashboard-layout";

const Debts = () => {
  return (
    <DashboardLayout>
      <DebtsPage />
    </DashboardLayout>
  );
};

export default Debts;
