"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/layout/card"
import { Button } from "@/components/ui/core/button"
import { Input } from "@/components/ui/core/input"
import { Label } from "@/components/ui/core/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/core/select"
import { CreditCard, Edit, Check, X, AlertCircle } from "lucide-react"
import { updateTask } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/feedback/alert"

const paymentStatusOptions = ["Unpaid", "Partially Paid", "Fully Paid", "Refunded"];

interface PaymentStatusViewProps {
  taskData: any;
  onUpdate: (updatedTask: any) => void;
  canEdit: boolean;
}

export function PaymentStatusView({ taskData, onUpdate, canEdit }: PaymentStatusViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(taskData.payment_status);
  const [nextPaymentDate, setNextPaymentDate] = useState(taskData.next_payment_date);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setPaymentStatus(taskData.payment_status);
    setNextPaymentDate(taskData.next_payment_date);
  }, [taskData]);

  const handleSave = async () => {
    const payload: { payment_status: string; next_payment_date?: string | null } = {
      payment_status: paymentStatus,
    };
    if (paymentStatus === 'Partially Paid') {
      payload.next_payment_date = nextPaymentDate;
    }

    try {
      const response = await updateTask(taskData.id, payload);
      onUpdate(response.data);
      setIsEditing(false);
      setError(null);
      toast({
        title: "Success",
        description: "Payment status updated successfully.",
      });
    } catch (error: any) {
      console.error(`Error updating task ${taskData.id}:`, error);
      setError(error.response?.data?.error || "An unexpected error occurred.");
    }
  };

  const handleCancel = () => {
    setPaymentStatus(taskData.payment_status);
    setNextPaymentDate(taskData.next_payment_date);
    setIsEditing(false);
    setError(null);
  };

  const getFilteredPaymentStatusOptions = () => {
    if (taskData.payment_status === 'Fully Paid') {
      return ['Fully Paid', 'Refunded'];
    }
    if (taskData.payment_status === 'Partially Paid') {
      return ['Partially Paid', 'Fully Paid', 'Refunded'];
    }
    return paymentStatusOptions;
  };

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-red-600" />
            Payment Status
          </CardTitle>
          {canEdit && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="border-gray-300 text-gray-600 bg-transparent"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-600">Payment Status</Label>
              <Select
                value={paymentStatus || ''}
                onValueChange={setPaymentStatus}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredPaymentStatusOptions().map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {paymentStatus === 'Partially Paid' && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Next Payment Date</Label>
                <Input
                  type="date"
                  value={nextPaymentDate || ''}
                  onChange={(e) => setNextPaymentDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-600">Payment Status</Label>
              <p className="text-gray-900 font-medium mt-1">{taskData.payment_status}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Paid Date</Label>
              <p className="text-gray-900 mt-1">{taskData.paid_date ? new Date(taskData.paid_date).toLocaleDateString() : "Not paid"}</p>
            </div>
            {taskData.payment_status === 'Partially Paid' && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Next Payment Date</Label>
                <p className="text-gray-900 mt-1">{taskData.next_payment_date}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      {isEditing && (
        <CardFooter className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Check className="h-4 w-4 mr-1" />
            Save
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}