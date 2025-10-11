'use client'

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createExpenditureRequest, getTasks, getPaymentCategories, getPaymentMethods } from '@/lib/api-client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/feedback/dialog";
import { Button } from "@/components/ui/core/button";
import { Input } from "@/components/ui/core/input";
import { Textarea } from "@/components/ui/core/textarea";
import { Label } from "@/components/ui/core/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/core/select";
import { useToast } from '@/hooks/use-toast';

interface AddExpenditureDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddExpenditureDialog({ isOpen, onClose }: AddExpenditureDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm();

  const { data: tasks } = useQuery({ queryKey: ['tasks'], queryFn: () => getTasks({ limit: 1000 }) });
  const { data: categories } = useQuery({ queryKey: ['paymentCategories'], queryFn: getPaymentCategories });
  const { data: methods } = useQuery({ queryKey: ['paymentMethods'], queryFn: getPaymentMethods });

  const mutation = useMutation({
    mutationFn: createExpenditureRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenditureRequests'] });
      toast({ title: "Success", description: "Expenditure request created successfully." });
      onClose();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.response?.data?.detail || "Failed to create expenditure request.", variant: "destructive" });
    },
  });

  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      task: data.task === 'null' ? null : data.task,
    };
    mutation.mutate(payload);
  };

  const selectedTask = watch('task');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Expenditure</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description', { required: true })} />
            {errors.description && <p className="text-red-500 text-xs">Description is required.</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" {...register('amount', { required: true, valueAsNumber: true })} />
            {errors.amount && <p className="text-red-500 text-xs">Amount is required.</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="task">Task (Optional)</Label>
            <Controller
              name="task"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a task..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">None</SelectItem>
                    {tasks?.data.results.map((task: any) => (
                      <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {selectedTask && (
            <div className="grid gap-2">
              <Label htmlFor="cost_type">Cost Type</Label>
              <Controller
                name="cost_type"
                control={control}
                defaultValue="Inclusive"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inclusive">Inclusive (part of original quote)</SelectItem>
                      <SelectItem value="Additive">Additive (will be added to final bill)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="category_id">Payment Category</Label>
            <Controller
              name="category_id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.data.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category_id && <p className="text-red-500 text-xs">Category is required.</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="payment_method_id">Payment Method</Label>
            <Controller
              name="payment_method_id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a method..." />
                  </SelectTrigger>
                  <SelectContent>
                    {methods?.data.map((method: any) => (
                      <SelectItem key={method.id} value={method.id}>{method.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.payment_method_id && <p className="text-red-500 text-xs">Payment method is required.</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
