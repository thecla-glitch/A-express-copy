"use client"

import { OutstandingPaymentsPreview } from "./outstanding-payments-preview"
import { TechnicianPerformancePreview } from "./technician-performance-preview"
import { RevenueSummaryPreview } from "./revenue-summary-preview"
import { TaskStatusPreview } from "./task-status-preview"
import { TechnicianWorkloadPreview } from "./technician-workload-preview"
import { PaymentMethodsPreview } from "./payment-methods-preview"
import { TurnaroundTimePreview } from "./turnaround-time-preview"
import { InventoryLocationPreview } from "./inventory-location-preview"
import { GenericReportPreview } from "./generic-report-preview"

// Extended interfaces for all report types
interface OutstandingTask {
    task_id: string
    customer_name: string
    customer_phone: string
    total_cost: number
    paid_amount: number
    outstanding_balance: number
    days_overdue: number
    status: string
    date_in: string
}

interface OutstandingPaymentsReport {
    outstanding_tasks: OutstandingTask[]
    summary: {
        total_outstanding: number
        task_count: number
        average_balance: number
    }
}

interface TechnicianPerformance {
    technician_name: string
    completed_tasks: number
    in_progress_tasks: number
    total_tasks: number
    efficiency: number
    total_revenue: number
    avg_completion_hours: number
    rating: number
}

interface TechnicianPerformanceReport {
    technician_performance: {
        technician_name: string
        completed_tasks: number
        in_progress_tasks: number
        total_tasks: number
        efficiency: number
        total_revenue: number
        avg_completion_hours: number
        rating: number
    }[]
    date_range: string
    total_technicians: number
}

interface RevenueSummaryReport {
    periods: {
        period: string
        revenue: number
        tasks_completed: number
        average_revenue_per_task: number
    }[]
    summary: {
        total_revenue: number
        total_tasks: number
        growth_rate: number
        average_revenue: number
    }
    date_range: string
}

interface TaskStatusReport {
    statuses: {
        name: string
        value: number
        color: string
    }[]
    summary: {
        total_tasks: number
        completed_tasks: number
        in_progress_tasks: number
    }
}

interface TechnicianWorkloadReport {
    workload_data: {
        name: string
        tasks: number
        in_progress: number
        awaiting_parts: number
        pending: number
    }[]
    total_active_technicians: number
    total_assigned_tasks: number
}

interface PaymentMethodsReport {
    payment_methods: {
        method_name: string
        total_amount: number
        payment_count: number
        average_payment: number
        percentage: number
    }[]
    summary: {
        total_revenue: number
        total_payments: number
        date_range: string
    }
}

interface TurnaroundTimeReport {
    periods: {
        period: string
        average_turnaround: number
        tasks_completed: number
        efficiency: number
    }[]
    summary: {
        overall_average: number
        best_period: string
        improvement: number
    }
}

interface InventoryLocationReport {
    locations: {
        location: string
        laptop_count: number
        capacity: number
        utilization: number
    }[]
    summary: {
        total_laptops: number
        total_capacity: number
        overall_utilization: number
    }
}

export const ReportPreview = ({ type, data, searchTerm }: { type: string, data: any, searchTerm: string }) => {
    switch (type) {
        case "outstanding_payments":
            return <OutstandingPaymentsPreview report={data as OutstandingPaymentsReport} searchTerm={searchTerm} />
        case "technician_performance":
            return <TechnicianPerformancePreview report={data as TechnicianPerformanceReport} />
        case "revenue_summary":
            return <RevenueSummaryPreview report={data as RevenueSummaryReport} />
        case "task_status":
            return <TaskStatusPreview report={data as TaskStatusReport} />
        case "technician_workload":
            return <TechnicianWorkloadPreview report={data as TechnicianWorkloadReport} />
        case "payment_methods":
            return <PaymentMethodsPreview report={data as PaymentMethodsReport} />
        case "turnaround_time":
            return <TurnaroundTimePreview report={data as TurnaroundTimeReport} />
        case "inventory_location":
            return <InventoryLocationPreview report={data as InventoryLocationReport} />
        default:
            return <GenericReportPreview report={data} />
    }
}
