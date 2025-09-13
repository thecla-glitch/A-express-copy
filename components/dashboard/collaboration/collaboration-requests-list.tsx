'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card'
import { Button } from '@/components/ui/core/button'
import { Badge } from '@/components/ui/core/badge'
import { listCollaborationRequests, updateCollaborationRequest } from '@/lib/collaboration-api-client'
import { useAuth } from '@/lib/auth-context'

export function CollaborationRequestsList() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<any[]>([])

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await listCollaborationRequests()
        setRequests(response.data)
      } catch (error) {
        console.error('Error fetching collaboration requests:', error)
      }
    }
    fetchRequests()
  }, [])

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await updateCollaborationRequest(requestId, { status: 'Accepted', assigned_to: user?.id })
      // Refresh the list of requests
      const response = await listCollaborationRequests()
      setRequests(response.data)
    } catch (error) {
      console.error(`Error accepting collaboration request ${requestId}:`, error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Requests</CardTitle>
        <CardDescription>These tasks are awaiting collaboration from a technician.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests
            .filter((request) => request.status === 'Pending')
            .map((request) => (
              <div key={request.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="font-medium text-blue-600">{request.task.id}</span>
                      <span className="font-medium text-gray-900 ml-2">{request.task.customer_name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Requested by: {request.requested_by.first_name} {request.requested_by.last_name}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-2">Reason for Collaboration:</h4>
                  <p className="text-sm text-gray-700">{request.reason}</p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleAcceptRequest(request.id)}>Accept</Button>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
