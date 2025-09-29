
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/feedback/dialog';
import { Button } from '@/components/ui/core/button';
import { Input } from '@/components/ui/core/input';
import { Label } from '@/components/ui/core/label';
import { Textarea } from '@/components/ui/core/textarea';
import { useUpdateTask } from '@/hooks/use-tasks';

interface ReturnTaskDialogProps {
  task: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ReturnTaskDialog({ task, isOpen, onClose }: ReturnTaskDialogProps) {
  const [newIssueDescription, setNewIssueDescription] = useState('');
  const [newEstimatedCost, setNewEstimatedCost] = useState('');
  const updateTaskMutation = useUpdateTask();

  const handleSubmit = () => {
    updateTaskMutation.mutate({
      id: task.id,
      updates: {
        status: 'Pending',
        issue_description: newIssueDescription || task.issue_description,
        estimated_cost: newEstimatedCost || task.estimated_cost,
      },
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Return Task: {task.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="new-issue-description">New Issue Description (Optional)</Label>
            <Textarea
              id="new-issue-description"
              value={newIssueDescription}
              onChange={(e) => setNewIssueDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="new-estimated-cost">New Estimated Cost</Label>
            <Input
              id="new-estimated-cost"
              type="number"
              value={newEstimatedCost}
              onChange={(e) => setNewEstimatedCost(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Return Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
