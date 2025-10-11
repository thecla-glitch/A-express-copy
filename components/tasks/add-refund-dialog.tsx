'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/core/button';
import { Input } from '@/components/ui/core/input';
import { Label } from '@/components/ui/core/label';
import { Textarea } from '@/components/ui/core/textarea';
import { createCostBreakdown } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '../ui/feedback/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/core/select';
import { usePaymentMethods } from '@/hooks/use-payment-methods';

interface AddRefundDialogProps {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskTitle: string;
}

export function AddRefundDialog({ taskId, open, onOpenChange, taskTitle }: AddRefundDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const { data: paymentMethods } = usePaymentMethods();

  const addRefundMutation = useMutation({
    mutationFn: (variables: { amount: string; reason: string; paymentMethod: string }) =>
      createCostBreakdown(taskId, {
        amount: variables.amount,
        cost_type: 'Subtractive',
        description: `Refund - ${taskTitle}`,
        category: 'Tech Support',
        reason: variables.reason,
        payment_method: variables.paymentMethod,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      toast({
        title: 'Refund Request Sent',
        description: 'Your refund request has been successfully sent for approval.',
      });
      onOpenChange(false);
      setAmount('');
      setReason('');
      setPaymentMethod('');
    },
    onError: () => {
        toast({
            title: 'Error',
            description: 'Failed to add refund.',
            variant: 'destructive',
        });
    }
  });

  const handleAddRefund = () => {
    if (!amount || !reason || !paymentMethod) {
      toast({
        title: 'Missing Information',
        description: 'Please provide amount, reason, and payment method for the refund.',
        variant: 'destructive',
      });
      return;
    }
    addRefundMutation.mutate({ amount, reason, paymentMethod });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Refund</DialogTitle>
          <DialogDescription>
            Add a refund to this task. This will be recorded as a cost item and a note will be added to the task activity.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter refund amount"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods?.map((method) => (
                  <SelectItem key={method.id} value={method.id.toString()}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for the refund"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddRefund} disabled={addRefundMutation.isPending}>
            {addRefundMutation.isPending ? 'Adding...' : 'Add Refund'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
