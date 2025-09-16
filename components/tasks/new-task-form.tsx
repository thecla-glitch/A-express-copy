'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/core/button'
import { Input } from '@/components/ui/core/input'
import { Label } from '@/components/ui/core/label'
import { Textarea } from '@/components/ui/core/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/core/select'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { createTask, apiClient } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'
import { User } from "@/lib/use-user-management"
import { Brand } from '@/lib/api'

interface NewTaskFormProps {}

interface Location {
  id: number;
  name: string;
}

interface FormData {
  title: string;
  customer_name: string
  customer_phone: string
  customer_email: string
  brand: string
  laptop_model: string
  serial_number: string
  description: string
  urgency: string
  current_location: string
  device_type: string
  device_notes: string
  assigned_to?: string
  estimated_cost?: number
}

interface FormErrors {
  [key: string]: string | undefined
}

const URGENCY_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
]

const DEVICE_TYPE_OPTIONS = [
  { value: 'Full', label: 'Full' },
  { value: 'Not Full', label: 'Not Full' },
  { value: 'Motherboard Only', label: 'Motherboard Only' },
]

const generateTaskID = () => {
    const prefix = "TASK";
    const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
    const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${randomPart}`;
}

export function NewTaskForm({}: NewTaskFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [technicians, setTechnicians] = useState<User[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [formData, setFormData] = useState<FormData>({
    title: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    brand: '',
    laptop_model: '',
    serial_number: '',
    description: '',
    urgency: 'Medium',
    current_location: '',
    device_type: 'Full',
    device_notes: '',
    assigned_to: '',
    estimated_cost: 0,
  })
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    setFormData(prev => ({...prev, title: generateTaskID()}));

    if (user && (user.role === 'Manager' || user.role === 'Administrator')) {
      apiClient.get('/users/role/Technician/').then(response => {
        if (response.data) {
          setTechnicians(response.data)
        }
      })
    }
    apiClient.get('/locations/').then(response => {
      if (response.data) {
        setLocations(response.data)
        if (response.data.length > 0) {
            setFormData(prev => ({...prev, current_location: response.data[0].name}))
        }
      }
    })
    apiClient.get('/brands/').then(response => {
      if (response.data) {
        setBrands(response.data)
      }
    })
  }, [user])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.customer_name.trim()) newErrors.customer_name = 'Name is required'
    if (!formData.customer_phone.trim()) newErrors.customer_phone = 'Phone is required'
    if (!formData.serial_number.trim()) newErrors.serial_number = 'Serial number is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.urgency) newErrors.urgency = 'Urgency is required'
    if (!formData.current_location) newErrors.current_location = 'Location is required'
    if ((formData.device_type === 'Not Full' || formData.device_type === 'Motherboard Only') && !formData.device_notes.trim()) {
        newErrors.device_notes = 'Device notes are required for this device type'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string | number) => {
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
      const taskData = {
        ...formData,
        total_cost: formData.estimated_cost,
      };
      await createTask(taskData)
      setSubmitSuccess(true)
      setTimeout(() => {
        window.location.href = '/dashboard/tasks'
      }, 2000)
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className='flex flex-col items-center justify-center p-8 text-center'>
        <CheckCircle className='h-16 w-16 text-green-600 mb-4' />
        <h2 className='text-2xl font-bold text-green-800 mb-2'>Task Created!</h2>
        <p className='text-green-700'>The new task has been added to the system.</p>
      </div>
    )
  }

  const canAssignTechnician = user && (user.role === 'Manager' || user.role === 'Administrator')

  return (
    <form onSubmit={handleSubmit} className='space-y-6 p-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='space-y-4'>
          <h3 className='text-lg font-medium text-gray-900'>Customer & Device</h3>
          <FormField id='title' label='Task ID' required error={errors.title}>
            <Input
              id='title'
              value={formData.title}
              readOnly
              className='bg-gray-100'
            />
          </FormField>
          <FormField id='customer_name' label='Customer Name' required error={errors.customer_name}>
            <Input
              id='customer_name'
              value={formData.customer_name}
              onChange={(e) => handleInputChange('customer_name', e.target.value)}
              className={errors.customer_name ? 'border-red-500' : ''}
            />
          </FormField>
          <FormField id='customer_phone' label='Phone Number' required error={errors.customer_phone}>
            <Input
              id='customer_phone'
              type='text'
              value={formData.customer_phone}
              onChange={(e) => handleInputChange('customer_phone', e.target.value)}
              className={errors.customer_phone ? 'border-red-500' : ''}
            />
          </FormField>
          <FormField id='customer_email' label='Email Address' error={errors.customer_email}>
            <Input
              id='customer_email'
              type='email'
              value={formData.customer_email}
              onChange={(e) => handleInputChange('customer_email', e.target.value)}
              className={errors.customer_email ? 'border-red-500' : ''}
            />
          </FormField>
          <div className='grid grid-cols-2 gap-4'>
            <FormField id='brand' label='Brand'>
              <Select value={formData.brand} onValueChange={(value) => handleInputChange('brand', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField id='laptop_model' label='Model'>
              <Input
                id='laptop_model'
                value={formData.laptop_model}
                onChange={(e) => handleInputChange('laptop_model', e.target.value)}
                readOnly={formData.device_type === 'Motherboard Only'}
              />
            </FormField>
          </div>
          <FormField id='serial_number' label='Serial Number' required error={errors.serial_number}>
            <Input
              id='serial_number'
              value={formData.serial_number}
              onChange={(e) => handleInputChange('serial_number', e.target.value)}
              className={errors.serial_number ? 'border-red-500' : ''}
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
              rows={canAssignTechnician ? 5 : 8}
              className={errors.description ? 'border-red-500' : ''}
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
              />
            </FormField>
          <FormField id='estimated_cost' label='Estimated Cost (TSh)'>
            <Input
              id='estimated_cost'
              type='number'
              value={formData.estimated_cost}
              onChange={(e) => handleInputChange('estimated_cost', e.target.valueAsNumber)}
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
            <Select value={formData.current_location} onValueChange={(value) => handleInputChange('current_location', value)}>
              <SelectTrigger className={errors.current_location ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.name}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          {canAssignTechnician && (
            <FormField id='assigned_to' label='Assign Technician'>
              <Select value={formData.assigned_to} onValueChange={(value) => handleInputChange('assigned_to', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((technician) => (
                    <SelectItem key={technician.id} value={technician.id.toString()}>
                      {technician.first_name} {technician.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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