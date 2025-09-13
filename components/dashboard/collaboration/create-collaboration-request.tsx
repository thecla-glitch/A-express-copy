'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/core/button'
import { Textarea } from '@/components/ui/core/textarea'
import { createCollaborationRequest } from '@/lib/collaboration-api-client'

export function CreateCollaborationRequest({ taskId, onSubmitted }: { taskId: string, onSubmitted: () => void }) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createCollaborationRequest(taskId, { reason })
      setReason('')
      onSubmitted()
    } catch (error) {
      console.error('Error creating collaboration request:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
          Reason for Collaboration
        </label>
        <Textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Describe why you need help with this task..."
          required
          className="mt-1"
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Request Collaboration'}
      </Button>
    </form>
  )
}
