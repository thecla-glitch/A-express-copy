'use client';

import { usePaymentMethods } from '@/hooks/use-payment-methods';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/feedback/dialog';
import { Button } from '@/components/ui/core/button';
import { CurrencyInput } from '@/components/ui/core/currency-input';
import { Label } from '@/components/ui/core/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/core/select';
import { useState } from 'react';

interface AddPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, method: string) => void;
  taskTitle: string;
}

export default function AddPaymentDialog({
  isOpen,
  onClose,
  onSubmit,
  taskTitle,
}: AddPaymentDialogProps) {
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const { data: paymentMethods } = usePaymentMethods();

  const handleSubmit = () => {
    onSubmit(amount, paymentMethod);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Payment for {taskTitle}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <CurrencyInput
              id="amount"
              value={amount}
              onValueChange={setAmount}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-method" className="text-right">
              Payment Method
            </Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods?.map((method) => (
                  <SelectItem key={method.id} value={method.name}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}