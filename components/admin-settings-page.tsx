"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  CreditCard,
  ToggleLeft,
  Save,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

export function AdminSettingsPage() {
  // Repair Statuses State
  const [repairStatuses, setRepairStatuses] = useState([
    { id: 1, name: "Pending Diagnosis", color: "yellow" },
    { id: 2, name: "Awaiting Parts", color: "blue" },
    { id: 3, name: "In Progress", color: "orange" },
    { id: 4, name: "Quality Check", color: "purple" },
    { id: 5, name: "Ready for Pickup", color: "green" },
    { id: 6, name: "Completed", color: "green" },
  ])
  const [newStatus, setNewStatus] = useState("")

  // Messaging Templates State
  const [messageTemplates, setMessageTemplates] = useState([
    {
      id: 1,
      type: "Task Accepted",
      subject: "Your repair has been accepted",
      content:
        "Hello {customer_name}, we have accepted your {device_type} for repair. Your repair ID is {repair_id}. We will keep you updated on the progress.",
      expanded: false,
    },
    {
      id: 2,
      type: "Ready for Pickup",
      subject: "Your device is ready for pickup",
      content:
        "Good news {customer_name}! Your {device_type} (Repair ID: {repair_id}) has been successfully repaired and is ready for pickup. Please visit our store during business hours.",
      expanded: false,
    },
    {
      id: 3,
      type: "Awaiting Parts",
      subject: "Parts ordered for your repair",
      content:
        "Hi {customer_name}, we have ordered the necessary parts for your {device_type} repair (ID: {repair_id}). We expect the parts to arrive within 3-5 business days.",
      expanded: false,
    },
    {
      id: 4,
      type: "Payment Reminder",
      subject: "Payment required to proceed",
      content:
        "Dear {customer_name}, to proceed with your {device_type} repair (ID: {repair_id}), we require payment of ${amount}. Please contact us to arrange payment.",
      expanded: false,
    },
  ])

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, name: "Credit Card", enabled: true },
    { id: 2, name: "Debit Card", enabled: true },
    { id: 3, name: "Cash", enabled: true },
    { id: 4, name: "Mobile Money", enabled: false },
    { id: 5, name: "Bank Transfer", enabled: true },
  ])
  const [newPaymentMethod, setNewPaymentMethod] = useState("")

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    smsNotifications: true,
    emailNotifications: true,
    darkMode: false,
    automaticBackups: true,
    maintenanceMode: false,
  })

  // Repair Status Functions
  const addRepairStatus = () => {
    if (newStatus.trim()) {
      setRepairStatuses([
        ...repairStatuses,
        {
          id: Date.now(),
          name: newStatus.trim(),
          color: "gray",
        },
      ])
      setNewStatus("")
    }
  }

  const deleteRepairStatus = (id: number) => {
    setRepairStatuses(repairStatuses.filter((status) => status.id !== id))
  }

  // Message Template Functions
  const toggleTemplateExpansion = (id: number) => {
    setMessageTemplates(
      messageTemplates.map((template) =>
        template.id === id ? { ...template, expanded: !template.expanded } : template,
      ),
    )
  }

  const updateTemplateContent = (id: number, field: string, value: string) => {
    setMessageTemplates(
      messageTemplates.map((template) => (template.id === id ? { ...template, [field]: value } : template)),
    )
  }

  // Payment Method Functions
  const addPaymentMethod = () => {
    if (newPaymentMethod.trim()) {
      setPaymentMethods([
        ...paymentMethods,
        {
          id: Date.now(),
          name: newPaymentMethod.trim(),
          enabled: true,
        },
      ])
      setNewPaymentMethod("")
    }
  }

  const togglePaymentMethod = (id: number) => {
    setPaymentMethods(
      paymentMethods.map((method) => (method.id === id ? { ...method, enabled: !method.enabled } : method)),
    )
  }

  const deletePaymentMethod = (id: number) => {
    setPaymentMethods(paymentMethods.filter((method) => method.id !== id))
  }

  // General Settings Functions
  const updateGeneralSetting = (key: string, value: boolean) => {
    setGeneralSettings({ ...generalSettings, [key]: value })
  }

  const saveAllSettings = () => {
    // Simulate saving settings
    console.log("Saving all settings...")
    // In a real app, this would make API calls to save settings
  }

  const getStatusBadge = (color: string) => {
    const colorClasses = {
      yellow: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      blue: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      orange: "bg-orange-100 text-orange-800 hover:bg-orange-100",
      purple: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      green: "bg-green-100 text-green-800 hover:bg-green-100",
      gray: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    }
    return colorClasses[color as keyof typeof colorClasses] || colorClasses.gray
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <Settings className="h-8 w-8 text-red-600" />
            System Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Configure system-wide settings, repair statuses, messaging templates, and payment options
          </p>
        </div>
        <Button onClick={saveAllSettings} className="bg-red-600 hover:bg-red-700 text-white">
          <Save className="h-4 w-4 mr-2" />
          Save All Settings
        </Button>
      </div>

      {/* Repair Statuses Section */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
            <ToggleLeft className="h-6 w-6 text-red-600" />
            Repair Statuses
          </CardTitle>
          <CardDescription>
            Manage the available repair statuses that can be assigned to customer devices throughout the repair process.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter new repair status..."
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addRepairStatus()}
              className="flex-1"
            />
            <Button onClick={addRepairStatus} className="bg-red-600 hover:bg-red-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Status
            </Button>
          </div>

          <div className="grid gap-2">
            {repairStatuses.map((status) => (
              <div key={status.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusBadge(status.color)}>{status.name}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Repair Status</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the "{status.name}" status? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteRepairStatus(status.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Messaging Templates Section */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            Messaging Templates
          </CardTitle>
          <CardDescription>
            Customize automated message templates sent to customers. Use variables like {"{customer_name}"},{" "}
            {"{device_type}"}, {"{repair_id}"}, and {"{amount}"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {messageTemplates.map((template) => (
            <Collapsible
              key={template.id}
              open={template.expanded}
              onOpenChange={() => toggleTemplateExpansion(template.id)}
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">{template.type}</span>
                  </div>
                  {template.expanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 p-4 border border-gray-200 rounded-lg mt-2">
                <div className="space-y-2">
                  <Label htmlFor={`subject-${template.id}`}>Email Subject</Label>
                  <Input
                    id={`subject-${template.id}`}
                    value={template.subject}
                    onChange={(e) => updateTemplateContent(template.id, "subject", e.target.value)}
                    placeholder="Email subject line..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`content-${template.id}`}>Message Content</Label>
                  <Textarea
                    id={`content-${template.id}`}
                    value={template.content}
                    onChange={(e) => updateTemplateContent(template.id, "content", e.target.value)}
                    placeholder="Message content..."
                    rows={4}
                  />
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent>
      </Card>

      {/* Payment Methods Section */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-green-600" />
            Payment Methods
          </CardTitle>
          <CardDescription>
            Configure which payment methods are accepted by your repair shop. Toggle methods on/off as needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter new payment method..."
              value={newPaymentMethod}
              onChange={(e) => setNewPaymentMethod(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addPaymentMethod()}
              className="flex-1"
            />
            <Button onClick={addPaymentMethod} className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Method
            </Button>
          </div>

          <div className="grid gap-2">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900">{method.name}</span>
                  <Badge
                    className={
                      method.enabled
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }
                  >
                    {method.enabled ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={method.enabled} onCheckedChange={() => togglePaymentMethod(method.id)} />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{method.name}" as a payment method? This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deletePaymentMethod(method.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* General Settings Section */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
            <Settings className="h-6 w-6 text-purple-600" />
            General Settings
          </CardTitle>
          <CardDescription>
            Configure system-wide preferences and operational settings for the A+ Express platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-base font-medium text-gray-900">SMS Notifications</Label>
                <p className="text-sm text-gray-600">Send SMS updates to customers about their repairs</p>
              </div>
              <Switch
                checked={generalSettings.smsNotifications}
                onCheckedChange={(checked) => updateGeneralSetting("smsNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-base font-medium text-gray-900">Email Notifications</Label>
                <p className="text-sm text-gray-600">Send email updates to customers and staff</p>
              </div>
              <Switch
                checked={generalSettings.emailNotifications}
                onCheckedChange={(checked) => updateGeneralSetting("emailNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-base font-medium text-gray-900">Dark Mode</Label>
                <p className="text-sm text-gray-600">Enable dark theme for the admin interface</p>
              </div>
              <Switch
                checked={generalSettings.darkMode}
                onCheckedChange={(checked) => updateGeneralSetting("darkMode", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-base font-medium text-gray-900">Automatic Backups</Label>
                <p className="text-sm text-gray-600">Automatically backup database daily at 2:00 AM</p>
              </div>
              <Switch
                checked={generalSettings.automaticBackups}
                onCheckedChange={(checked) => updateGeneralSetting("automaticBackups", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-base font-medium text-gray-900">Maintenance Mode</Label>
                <p className="text-sm text-gray-600">Put the system in maintenance mode for updates</p>
              </div>
              <Switch
                checked={generalSettings.maintenanceMode}
                onCheckedChange={(checked) => updateGeneralSetting("maintenanceMode", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
