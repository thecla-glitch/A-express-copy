'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/core/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/layout/table';
import { approveRefund, rejectRefund } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/lib/api';

interface PendingRefundsProps {
  task: Task;
}

export function PendingRefunds({ task }: PendingRefundsProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const pendingRefunds = task.cost_breakdowns?.filter(item => item.status === 'Pending') || [];

  const approveMutation = useMutation({
    mutationFn: (id: number) => approveRefund(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task.title] });
      toast({
        title: 'Refund Approved',
        description: 'The refund has been successfully approved.',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => rejectRefund(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task.title] });
      toast({
        title: 'Refund Rejected',
        description: 'The refund has been successfully rejected.',
      });
    },
  });

  if (pendingRefunds.length === 0) {
    return null;
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">Pending Refunds</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Amount</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingRefunds.map((refund) => (
              <TableRow key={refund.id}>
                <TableCell>TSh {parseFloat(refund.amount).toFixed(2)}</TableCell>
                <TableCell>{refund.reason}</TableCell>
                <TableCell>{refund.requested_by?.full_name}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => approveMutation.mutate(refund.id)}>
                    Approve
                  </Button>
                  <Button variant="destructive" size="sm" className="ml-2" onClick={() => rejectMutation.mutate(refund.id)}>
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
