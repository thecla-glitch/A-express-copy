'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingRefunds, approveRefund, rejectRefund } from '@/lib/api-client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/layout/table";
import { Button } from "@/components/ui/core/button";
import { useAuth } from '@/lib/auth-context';
import { toast } from '@/hooks/use-toast';

export function PendingRefundsList() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: pendingRefunds, isLoading, isError } = useQuery({
    queryKey: ['pendingRefunds'],
    queryFn: getPendingRefunds,
  });

  const approveMutation = useMutation({
    mutationFn: approveRefund,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRefunds'] });
      toast({ title: 'Success', description: 'Refund approved.' });
    },
    onError: () => {
        toast({ title: 'Error', description: 'Failed to approve refund.', variant: 'destructive' });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: rejectRefund,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRefunds'] });
      toast({ title: 'Success', description: 'Refund rejected.' });
    },
    onError: () => {
        toast({ title: 'Error', description: 'Failed to reject refund.', variant: 'destructive' });
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading pending refunds.</div>;

  const isManager = user?.role === 'Manager';

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Requested By</TableHead>
          {isManager && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {pendingRefunds?.data.map((refund: any) => (
          <TableRow key={refund.id}>
            <TableCell>{refund.task_title}</TableCell>
            <TableCell>{refund.amount}</TableCell>
            <TableCell>{refund.reason}</TableCell>
            <TableCell>{refund.requested_by.full_name}</TableCell>
            {isManager && (
              <TableCell>
                <Button onClick={() => approveMutation.mutate(refund.id)} size="sm" className="mr-2">Approve</Button>
                <Button onClick={() => rejectMutation.mutate(refund.id)} size="sm" variant="destructive">Reject</Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
