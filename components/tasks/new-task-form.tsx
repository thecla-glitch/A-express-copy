'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/core/button'
import { Input } from '@/components/ui/core/input'
import { Label } from '@/components/ui/core/label'
import { Textarea } from '@/components/ui/core/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/core/select'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/layout/tabs";
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { createTask, createCustomer } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'
import { Checkbox } from '@/components/ui/core/checkbox'
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/feedback/alert-dialog";
import { CurrencyInput } from "@/components/ui/core/currency-input";
import { useTechnicians, useManagers, useBrands, useLocations } from '@/hooks/use-data'
import { useCustomers } from '@/hooks/use-customers'
import { SimpleCombobox } from '@/components/ui/core/combobox'
import { toast } from '@/hooks/use-toast'

interface NewTaskFormProps {}

interface FormData {
  title: string;
  customer_id: string;
  customer_name: string
  customer_phone: string
  customer_email: string
  customer_type?: string
  brand: string
  laptop_model: string
  serial_number: string
  description: string
  urgency: string
  current_location: string
  device_type: string
  device_notes: string
  negotiated_by: string
  assigned_to?: string
  estimated_cost?: number
  is_commissioned: boolean
  commissioned_by: string
}

interface FormErrors {
  [key: string]: string | undefined
}

const URGENCY_OPTIONS = [
  { value: 'Yupo', label: 'Yupo' },
  { value: 'Katoka kidogo', label: 'Katoka kidogo' },
  { value: 'Kaacha', label: 'Kaacha' },
  { value: 'Expedited', label: 'Expedited' },
  { value: 'Ina Haraka', label: 'Ina Haraka' },
]

const CUSTOMER_TYPE_OPTIONS = [
  { value: 'Normal', label: 'Normal' },
  { value: 'Repairman', label: 'Repairman' },
]

const DEVICE_TYPE_OPTIONS = [
  { value: 'Full', label: 'Full' },
  { value: 'Not Full', label: 'Not Full' },
  { value: 'Motherboard Only', label: 'Motherboard Only' },
]

export function NewTaskForm({}: NewTaskFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isCommissioned, setIsCommissioned] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')

  const { data: technicians, isLoading: isLoadingTechnicians } = useTechnicians()
  const { data: managers, isLoading: isLoadingManagers } = useManagers()
  const { data: brands, isLoading: isLoadingBrands } = useBrands()
  const { data: locations, isLoading: isLoadingLocations } = useLocations()
  const { data: customers, isLoading: isLoadingCustomers } = useCustomers(customerSearch)

  const [formData, setFormData] = useState<FormData>({
    title: '',
    customer_id: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_type: 'Normal',
    brand: '',
    laptop_model: '',
    serial_number: '',
    description: '',
    urgency: 'Yupo',
    current_location: '',
    device_type: 'Full',
    device_notes: '',
    negotiated_by: '',
    assigned_to: '',
    estimated_cost: 0,
    is_commissioned: false,
    commissioned_by: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (locations && locations.length > 0) {
        setFormData(prev => ({...prev, current_location: locations[0].name}))
    }
  }, [locations])

  useEffect(() => {
    if (user?.role === 'Manager') {
        setFormData(prev => ({...prev, negotiated_by: user.id.toString()}))
    }
  }, [user])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.customer_name.trim()) newErrors.customer_name = 'Name is required'
    
    if (!formData.customer_phone.trim()) {
        newErrors.customer_phone = 'Phone is required'
    } else {
        const phoneRegex = /^0\s?\d{3}\s?\d{3}\s?\d{3}$/;
        if (!phoneRegex.test(formData.customer_phone)) {
            newErrors.customer_phone = 'Invalid phone number format. Example: 0XXX XXX XXX'
        }
    }

    if (!formData.brand && !formData.laptop_model.trim()) {
        newErrors.brand = 'Either brand or model is required';
        newErrors.laptop_model = 'Either brand or model is required';
    }

    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.urgency) newErrors.urgency = 'Urgency is required'
    if (!formData.current_location) newErrors.current_location = 'Location is required'
    if ((formData.device_type === 'Not Full' || formData.device_type === 'Motherboard Only') && !formData.device_notes.trim()) {
        newErrors.device_notes = 'Device notes are required for this device type'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => {
        const newFormData = { ...prev, [field]: value };
        if (field === 'device_type' && value === 'Motherboard Only') {
            newFormData.laptop_model = 'Motherboard';
        } else if (field === 'device_type' && prev.laptop_model === 'Motherboard') {
            newFormData.laptop_model = '';
        }
        return newFormData;
    })
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      let customerId = formData.customer_id;
      if (!customerId) {
        const response = await createCustomer({
          name: formData.customer_name,
          phone: formData.customer_phone,
          email: formData.customer_email,
          customer_type: formData.customer_type,
        });
        customerId = response.data.id;
        toast({
          title: 'Customer Created',
          description: `Customer ${formData.customer_name} has been added to the database.`,
        });
      }

      const taskData = {
        ...formData,
        customer: customerId,
        negotiated_by: formData.negotiated_by || null,
        commissioned_by: formData.is_commissioned ? formData.commissioned_by : 'Not Commissioned',
      };
      await createTask(taskData)
      setSubmitSuccess(true)
    } catch (error) {
      console.error('Error creating task:', error.response.data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSuccessRedirect = () => {
    if (user?.role === 'Manager') {
      router.push('/dashboard/manager/tasks')
    }
    else if (user?.role === 'Front Desk') {
      router.push('/dashboard/front-desk/tasks')
    }
    else {
      router.push('/dashboard/tasks')
    }
  }

  const canAssignTechnician = user && (user.role === 'Manager' || user.role === 'Administrator' || user.role === 'Front Desk')

  const customerOptions = customers ? customers.map((c: any) => ({ label: c.name, value: c.id.toString() })) : [];

  return (
    <>
      <form onSubmit={handleSubmit} className='space-y-6 p-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <h3 className='text-lg font-medium text-gray-900'>Customer & Device</h3>
            <FormField id='title' label='Task ID' required error={errors.title}>
              <Input
                id='title'
                value="Will be generated on creation"
                readOnly
                className='bg-gray-100'
              />
            </FormField>
            <FormField id='customer_name' label='Customer Name' required error={errors.customer_name}>
              <SimpleCombobox
                options={customerOptions}
                value={formData.customer_name}
                onChange={(value) => {
                  const selectedCustomer = customers.find((c: any) => c.id.toString() === value)
                  if(selectedCustomer){
                    handleInputChange('customer_id', selectedCustomer.id)
                    handleInputChange('customer_name', selectedCustomer.name)
                    handleInputChange('customer_phone', selectedCustomer.phone)
                    handleInputChange('customer_email', selectedCustomer.email)
                    handleInputChange('customer_type', selectedCustomer.customer_type)
                  } else {
                    handleInputChange('customer_id', '')
                  }
                }}
                onInputChange={(value) => {
                  handleInputChange('customer_name', value)
                  setCustomerSearch(value)
                }}
                placeholder="Search or create customer..."
              />
            </FormField>
            <FormField id='customer_phone' label='Phone Number' required error={errors.customer_phone}>
              <Input
                id='customer_phone'
                type='text'
                value={formData.customer_phone}
                onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                className={errors.customer_phone ? 'border-red-500' : ''}
                placeholder="e.g. 0712 345 678"
              />
            </FormField>
            <FormField id='customer_email' label='Email Address' error={errors.customer_email}>
              <Input
                id='customer_email'
                type='email'
                value={formData.customer_email}
                onChange={(e) => handleInputChange('customer_email', e.target.value)}
                className={errors.customer_email ? 'border-red-500' : ''}
                placeholder="e.g. john.doe@example.com"
              />
            </FormField>
            <FormField id='customer_type' label='Customer Type'>
              <Tabs
                value={formData.customer_type}
                onValueChange={(value) => handleInputChange('customer_type', value)}
              >
                <TabsList>
                  {CUSTOMER_TYPE_OPTIONS.map((option) => (
                    <TabsTrigger
                      key={option.value}
                      value={option.value}
                      className='data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=inactive]:bg-gray-200'
                    >
                      {option.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </FormField>
            <div className='grid grid-cols-2 gap-4'>
              <FormField id='brand' label='Brand' error={errors.brand}>
                <Select value={formData.brand} onValueChange={(value) => handleInputChange('brand', value)} disabled={isLoadingBrands}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands?.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField id='laptop_model' label='Model' error={errors.laptop_model}>
                <Input
                  id='laptop_model'
                  value={formData.laptop_model}
                  onChange={(e) => handleInputChange('laptop_model', e.target.value)}
                  readOnly={formData.device_type === 'Motherboard Only'}
                  placeholder="e.g. MacBook Pro 14-inch"
                />
              </FormField>
            </div>
            <FormField id='serial_number' label='Serial Number' error={errors.serial_number}>
              <Input
                id='serial_number'
                value={formData.serial_number}
                onChange={(e) => handleInputChange('serial_number', e.target.value)}
                className={errors.serial_number ? 'border-red-500' : ''}
                placeholder="e.g. C02G812JHC85"
              />
            </FormField>
          </div>

          <div className='space-y-4'>
            <h3 className='text-lg font-medium text-gray-900'>Issue Details</h3>
            <FormField id='description' label='Issue Description' required error={errors.description}>
              <Textarea
                id='description'
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={canAssignTechnician ? 4 : 7}
                className={errors.description ? 'border-red-500' : ''}
                placeholder="e.g. The laptop is not turning on. No signs of life."
              />
            </FormField>
            <FormField id='device_type' label='Device Type'>
              <Select value={formData.device_type} onValueChange={(value) => handleInputChange('device_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select device type" />
                </SelectTrigger>
                <SelectContent>
                  {DEVICE_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField id='device_notes' label='Device Notes' required={formData.device_type === 'Not Full' || formData.device_type === 'Motherboard Only'} error={errors.device_notes}>
                <Textarea
                  id='device_notes'
                  value={formData.device_notes}
                  onChange={(e) => handleInputChange('device_notes', e.target.value)}
                  className={errors.device_notes ? 'border-red-500' : ''}
                  placeholder="e.g. Customer brought only the motherboard and the screen."
                />
              </FormField>
            <FormField id='estimated_cost' label='Estimated Cost (TSh)'>
              <CurrencyInput
                id='estimated_cost'
                value={formData.estimated_cost}
                onValueChange={(value) => handleInputChange('estimated_cost', value)}
                placeholder="e.g. 150,000"
              />
            </FormField>
            <FormField id='urgency' label='Urgency' required error={errors.urgency}>
              <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                <SelectTrigger className={errors.urgency ? 'border-red-500' : ''}>
                  <SelectValue placeholder='Set urgency' />
                </SelectTrigger>
                <SelectContent>
                  {URGENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField id='current_location' label='Initial Location' required error={errors.current_location}>
              <Select value={formData.current_location} onValueChange={(value) => handleInputChange('current_location', value)} disabled={isLoadingLocations}>
                <SelectTrigger className={errors.current_location ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations?.map((location) => (
                    <SelectItem key={location.id} value={location.name}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
  		  <FormField id='negotiated_by' label='Negotiated By'>
              {user?.role === 'Manager' ? (
                  <Input
                      id='negotiated_by'
                      value={`${user.first_name} ${user.last_name}`}
                      readOnly
                      className='bg-gray-100'
                  />
              ) : (
                  <Select value={formData.negotiated_by} onValueChange={(value) => handleInputChange('negotiated_by', value)} disabled={isLoadingManagers}>
                      <SelectTrigger>
                          <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                          {managers?.map((manager) => (
                              <SelectItem key={manager.id} value={manager.id.toString()}>
                                  {manager.first_name} {manager.last_name}
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              )}
              </FormField>
            {canAssignTechnician && (
              <FormField id='assigned_to' label='Assign Technician'>
                <Select value={formData.assigned_to} onValueChange={(value) => handleInputChange('assigned_to', value)} disabled={isLoadingTechnicians}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians?.map((technician) => (
                      <SelectItem key={technician.id} value={technician.id.toString()}>
                        {technician.first_name} {technician.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            )}
          <div className="flex items-center space-x-2">
            <Checkbox id="is_commissioned" checked={isCommissioned} onCheckedChange={(checked) => { setIsCommissioned(!!checked); handleInputChange('is_commissioned', !!checked); }} />
              <label
                htmlFor="is_commissioned"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Commissioned
              </label>
            </div>
            {isCommissioned && (
              <FormField id='commissioned_by' label='Commissioned By'>
                <Input
                  id='commissioned_by'
                  value={formData.commissioned_by}
                  onChange={(e) => handleInputChange('commissioned_by', e.target.value)}
                  placeholder="e.g. Jane Smith"
                />
              </FormField>
            )}
          </div>
        </div>

        <div className='flex justify-end gap-4 pt-4'>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button type='submit' disabled={isSubmitting} className='bg-red-600 hover:bg-red-700 text-white'>
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
      <AlertDialog open={submitSuccess} onOpenChange={setSubmitSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Task Created!</AlertDialogTitle>
            <AlertDialogDescription>
              The new task has been added to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSuccessRedirect}>Go to Tasks</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

const FormField = ({
  id,
  label,
  required = false,
  error,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) => (
  <div className='space-y-1.5'>
    <Label htmlFor={id} className='font-medium'>
      {label}
      {required && <span className='text-red-500 ml-1'>*</span>}
    </Label>
    {children}
    {error && (
      <p className='text-sm text-red-600 flex items-center gap-1'>
        <AlertTriangle className='h-4 w-4' />
        {error}
      </p>
    )}
  </div>
)