"use client";
import FrontDeskTasksPage from "@/components/tasks/front-desk-tasks-page";
import React from "react";
import { DashboardLayout } from "@/components/dashboard/layouts/dashboard-layout";

const FrontDeskTasks = () => {
  return (
    <DashboardLayout>
      <FrontDeskTasksPage />
    </DashboardLayout>
  );
};

export default FrontDeskTasks;
