"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { Button } from "@/components/ui/core/button"
import { Badge } from "@/components/ui/core/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/layout/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/core/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/layout/tabs"
import { Download } from "lucide-react"
import { usePayments } from "@/hooks/use-payments"
import { usePaymentMethods } from "@/hooks/use-payment-methods"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/layout/popover"
import { Calendar } from "@/components/ui/core/calendar"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/core/input";
import { useAuth } from "@/lib/auth-context";
import { PendingRefundsList } from "./pending-refunds-list";

interface Payment {
  id: any;
  task: number;
  task_status: string;
  amount: string;
  date: string;
  method: number;
  method_name: string;
  description: string;
  category_name: string;
}

import { TrendingUp, TrendingDown } from "lucide-react"
import useSWR from 'swr'
import { apiClient } from "@/lib/api-client"

const fetcher = (url: string) => apiClient.get(url).then(res => res.data)

export function PaymentsOverview() {
  const [methodFilter, setMethodFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("task_payments")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [searchTerm, setSearchTerm] = useState("");

  const { data: payments, isLoading, isError } = usePayments({
    method: methodFilter,
    category: categoryFilter,
    is_refunded: activeTab === "expenditure",
    task_payments: activeTab === "task_payments",
    date: date ? format(date, "yyyy-MM-dd") : undefined,
    search: searchTerm,
  })
  const { data: revenueData, error: revenueError } = useSWR('/revenue-overview/', fetcher)
  const { data: paymentMethods } = usePaymentMethods()
  const { data: paymentCategories } = useSWR('/payment-categories/', fetcher)
  const { user } = useAuth();

  const isManager = user?.role === 'Manager';
  const isAccountant = user?.role === 'Accountant';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className='bg-green-100 text-green-800'>Completed</Badge>
      case 'pending':
        return <Badge className='bg-yellow-100 text-yellow-800'>Pending</Badge>
      case 'refunded':
        return <Badge className='bg-red-100 text-red-800'>Refunded</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TZS',
    }).format(amount)
  }

  if (isError) {
    return <div>Error fetching payments.</div>
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Payments</h1>
          <p className='text-muted-foreground'>Manage and track all payment transactions</p>
        </div>
        <Button>
          <Download className='mr-2 h-4 w-4' />
          Export Report
        </Button>
      </div>

      {/* Payment Statistics */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-2'>
        {revenueError ? (
          <div>Failed to load revenue data</div>
        ) : !revenueData ? (
          <div>Loading...</div>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue this month</CardTitle>
                {revenueData.month_over_month_change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(revenueData.this_month_revenue)}</div>
                <p className="text-xs text-muted-foreground">
                  {revenueData.month_over_month_change.toFixed(2)}% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                {revenueData.day_over_day_change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(revenueData.today_revenue)}</div>
                <p className="text-xs text-muted-foreground">
                  {revenueData.day_over_day_change.toFixed(2)}% from yesterday
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <CardDescription>View and manage all payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='task_payments' onValueChange={setActiveTab} className='space-y-4'>
            <div className='flex items-center justify-between'>
              <TabsList>
                <TabsTrigger value='task_payments'>Task Payments</TabsTrigger>
                <TabsTrigger value='expenditure'>Expenditure</TabsTrigger>
                {(isManager || isAccountant) && <TabsTrigger value='pending'>Pending Refunds</TabsTrigger>}
              </TabsList>

              <div className='flex items-center space-x-2'>
                <Input
                  placeholder="Search by description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-[200px]"
                />
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className='w-[140px]'>
                    <SelectValue placeholder='Method' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Methods</SelectItem>
                    {paymentMethods?.map((method) => (
                      <SelectItem key={method.id} value={method.name}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className='w-[140px]'>
                    <SelectValue placeholder='Category' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Categories</SelectItem>
                    {paymentCategories?.map((category: any) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <TabsContent value='task_payments' className='space-y-4'>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className='text-right'>Task Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : payments?.map((payment: Payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>TSh {parseFloat(payment.amount).toFixed(2)}</TableCell>
                        <TableCell>{payment.method_name}</TableCell>
                        <TableCell>{payment.category_name}</TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell className='text-right'>{getStatusBadge(payment.task_status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value='expenditure' className='space-y-4'>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className='text-right'>Task Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : payments?.map((payment: Payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>TSh {parseFloat(payment.amount).toFixed(2)}</TableCell>
                        <TableCell>{payment.method_name}</TableCell>
                        <TableCell>{payment.category_name}</TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell className='text-right'>{getStatusBadge(payment.task_status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value='pending'>
              <PendingRefundsList />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
