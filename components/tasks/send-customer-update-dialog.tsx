"use client"

import { useState } from "react"
import { Button } from "@/components/ui/core/button"
import { Input } from "@/components/ui/core/input"
import { Textarea } from "@/components/ui/core/textarea"
import { Label } from "@/components/ui/core/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/feedback/dialog"
import { apiClient } from "@/lib/api-client"

interface SendCustomerUpdateDialogProps {
  taskId: string
  customerEmail: string
}

export function SendCustomerUpdateDialog({ taskId, customerEmail }: SendCustomerUpdateDialogProps) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleSendUpdate = async () => {
    const response = await apiClient.post(`/tasks/${taskId}/send-update/`, { subject, message })
    if (response.error) {
      console.error("Error sending update:", response.error)
    } else {
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700 text-white">
          Send Customer Update
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Customer Update</DialogTitle>
          <DialogDescription>Send an email update to {customerEmail}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">
              Subject
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="message" className="text-right">
              Message
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSendUpdate}>Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}