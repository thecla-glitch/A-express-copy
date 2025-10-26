import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/feedback/dialog';
import { Button } from '@/components/ui/core/button';
import { Input } from '@/components/ui/core/input';
import { Label } from '@/components/ui/core/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/core/select';
import { Customer } from '@/lib/api';
import { useUpdateCustomer } from '@/hooks/use-update-customer';

interface EditCustomerDialogProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditCustomerDialog({ customer, isOpen, onClose }: EditCustomerDialogProps) {
  const [name, setName] = useState('');
  const [customerType, setCustomerType] = useState('Normal');
  const [phoneNumbers, setPhoneNumbers] = useState<{ id?: number; phone_number: string }[]>([]);

  const updateCustomerMutation = useUpdateCustomer();

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setCustomerType(customer.customer_type || 'Normal');
      setPhoneNumbers(customer.phone_numbers || []);
    }
  }, [customer]);

  const handleSave = () => {
    if (customer) {
      const updatedCustomer = {
        ...customer,
        name,
        customer_type: customerType,
        phone_numbers: phoneNumbers,
      };
      updateCustomerMutation.mutate(updatedCustomer, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const handlePhoneNumberChange = (index: number, value: string) => {
    const newPhoneNumbers = [...phoneNumbers];
    newPhoneNumbers[index].phone_number = value;
    setPhoneNumbers(newPhoneNumbers);
  };

  const addPhoneNumber = () => {
    setPhoneNumbers([...phoneNumbers, { phone_number: '' }]);
  };

  const removePhoneNumber = (index: number) => {
    const newPhoneNumbers = phoneNumbers.filter((_, i) => i !== index);
    setPhoneNumbers(newPhoneNumbers);
  };

  if (!isOpen || !customer) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Customer: {customer.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-type">Customer Type</Label>
            <Select value={customerType} onValueChange={setCustomerType}>
              <SelectTrigger id="customer-type">
                <SelectValue placeholder="Select a customer type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Repairman">Repairman</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Phone Numbers</Label>
            {phoneNumbers.map((pn, index) => (
              <div key={pn.id ?? index} className="flex items-center gap-2">
                <Input
                  value={pn.phone_number}
                  onChange={(e) => handlePhoneNumberChange(index, e.target.value)}
                />
                <Button variant="destructive" size="sm" onClick={() => removePhoneNumber(index)}>
                  Remove
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addPhoneNumber}>
              Add Phone Number
            </Button>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={updateCustomerMutation.isPending}>
            {updateCustomerMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}