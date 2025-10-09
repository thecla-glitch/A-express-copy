'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card'
import { Button } from '@/components/ui/core/button'
import { Input } from '@/components/ui/core/input'
import { Badge } from '@/components/ui/core/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/layout/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/core/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/layout/tabs'
import { Search, Download, DollarSign, Clock, CheckCircle } from 'lucide-react'
import { usePayments } from '@/hooks/use-payments'

interface Payment {
  id: any;
  task: number;
  task_title: string;
  task_status: string;
  amount: string;
  date: string;
  method: number;
  method_name: string;
}

const paymentStats = {
  totalRevenue: 4250.5,
  todayRevenue: 235.5,
  pendingPayments: 3,
  completedPayments: 47,
}

import { TrendingUp, TrendingDown } from "lucide-react"
import useSWR from 'swr'
import { apiClient } from "@/lib/api-client"

const fetcher = (url: string) => apiClient.get(url).then(res => res.data)

export function PaymentsOverview() {
  const [searchTerm, setSearchTerm] = useState('')
  const [methodFilter, setMethodFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('all')

  const { data: payments, isLoading, isError } = usePayments()
  const { data: revenueData, error: revenueError } = useSWR('/revenue-overview/', fetcher)

  const filteredPayments = payments?.filter((payment: Payment) => {
    const matchesSearch = 
      payment.id && String(payment.id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === 'all' || payment.method_name.toLowerCase() === methodFilter.toLowerCase()

    if (activeTab === 'refunded') {
      return parseFloat(payment.amount) < 0 && matchesSearch && matchesMethod
    }

    return matchesSearch && matchesMethod
  })

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

  if (isLoading) {
    return <div>Loading...</div>
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
          <Tabs defaultValue='all' onValueChange={setActiveTab} className='space-y-4'>
            <div className='flex items-center justify-between'>
              <TabsList>
                <TabsTrigger value='all'>All Payments</TabsTrigger>
                <TabsTrigger value='refunded'>Refunded</TabsTrigger>
              </TabsList>

              <div className='flex items-center space-x-2'>
                <div className='relative'>
                  <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Search payments...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-8 w-[300px]'
                  />
                </div>

                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className='w-[140px]'>
                    <SelectValue placeholder='Method' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Methods</SelectItem>
                    <SelectItem value='Credit Card'>Credit Card</SelectItem>
                    <SelectItem value='Debit Card'>Debit Card</SelectItem>
                    <SelectItem value='Cash'>Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value='all' className='space-y-4'>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className='text-right'>Task Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments?.map((payment: Payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.task_title}</TableCell>
                        <TableCell>TSh {parseFloat(payment.amount).toFixed(2)}</TableCell>
                        <TableCell>{payment.method_name}</TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell className='text-right'>{getStatusBadge(payment.task_status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value='refunded' className='space-y-4'>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className='text-right'>Task Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments?.map((payment: Payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.task_title}</TableCell>
                        <TableCell>TSh {parseFloat(payment.amount).toFixed(2)}</TableCell>
                        <TableCell>{payment.method_name}</TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell className='text-right'>{getStatusBadge(payment.task_status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}