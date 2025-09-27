'use client'

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/layout/card";
import { Button } from "@/components/ui/core/button";
import { Input } from "@/components/ui/core/input";
import { Label } from "@/components/ui/core/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/core/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/layout/table";
import { DollarSign, Edit, Plus, Trash2 } from "lucide-react";
import { Task, CostBreakdown as CostBreakdownType } from '@/lib/api';

interface CostBreakdownProps {
  task: Task;
}

export function CostBreakdown({ task }: CostBreakdownProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newBreakdown, setNewBreakdown] = useState({ description: '', amount: '', cost_type: 'Inclusive' });

  const { data: costBreakdowns, isLoading } = useQuery<CostBreakdownType[]>({
    queryKey: ['costBreakdowns', task.title],
    queryFn: () => apiClient.getCostBreakdowns(task.title).then(res => res.data || []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.createCostBreakdown(task.title, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costBreakdowns', task.title] });
      queryClient.invalidateQueries({ queryKey: ['task', task.title] });
      setIsAdding(false);
      setNewBreakdown({ description: '', amount: '', cost_type: 'Inclusive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteCostBreakdown(task.title, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costBreakdowns', task.title] });
      queryClient.invalidateQueries({ queryKey: ['task', task.title] });
    },
  });

  const handleAdd = () => {
    createMutation.mutate(newBreakdown);
  };

  const isManager = user?.role === 'Manager';

  if (isLoading) return <div>Loading cost breakdowns...</div>;

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-red-600" />
            Cost Breakdown
          </CardTitle>
          {isManager && (
            <Button variant="outline" size="sm" onClick={() => setIsAdding(!isAdding)} className="border-gray-300 text-gray-600 bg-transparent">
              <Plus className="h-3 w-3 mr-1" />
              {isAdding ? 'Cancel' : 'Add Item'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              {isManager && <TableHead></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Estimated Cost</TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right">TSh {parseFloat(task.estimated_cost || '0').toFixed(2)}</TableCell>
              {isManager && <TableCell></TableCell>}
            </TableRow>
            {costBreakdowns?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.cost_type}</TableCell>
                <TableCell className={`text-right ${item.cost_type === 'Subtractive' ? 'text-red-600' : 'text-green-600'}`}>
                  {item.cost_type === 'Subtractive' ? '-' : '+'}TSh {parseFloat(item.amount).toFixed(2)}
                </TableCell>
                {isManager && (
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {isAdding && (
              <TableRow>
                <TableCell>
                  <Input
                    placeholder="Description"
                    value={newBreakdown.description}
                    onChange={(e) => setNewBreakdown({ ...newBreakdown, description: e.target.value })}
                  />
                </TableCell>
                <TableCell>
                  <Select value={newBreakdown.cost_type} onValueChange={(value) => setNewBreakdown({ ...newBreakdown, cost_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inclusive">Inclusive</SelectItem>
                      <SelectItem value="Additive">Additive</SelectItem>
                      <SelectItem value="Subtractive">Subtractive</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={newBreakdown.amount}
                    onChange={(e) => setNewBreakdown({ ...newBreakdown, amount: e.target.value })}
                    className="text-right"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" onClick={handleAdd}>Add</Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Label className="text-base font-semibold text-gray-900">Total Cost</Label>
        <span className="text-xl font-bold text-red-600">TSh {parseFloat(task.total_cost || '0').toFixed(2)}</span>
      </CardFooter>
    </Card>
  );
}
