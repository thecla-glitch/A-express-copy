'use client'

import { CollaborationRequestsList } from '@/components/dashboard/collaboration/collaboration-requests-list'

export default function CollaborationPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Collaboration Requests</h1>
      <p className="text-gray-600 mt-2">Help your fellow technicians with their tasks.</p>

      <CollaborationRequestsList />
    </div>
  )
}
