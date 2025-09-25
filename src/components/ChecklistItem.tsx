'use client'

import { useState } from 'react'

interface ChecklistItem {
  id: string
  label: string
  required: boolean
  status: 'PENDING' | 'RECEIVED' | 'WAIVED'
}

interface ChecklistItemProps {
  item: ChecklistItem
  onStatusChange?: (id: string, status: 'PENDING' | 'RECEIVED' | 'WAIVED') => void
}

export default function ChecklistItemComponent({ item, onStatusChange }: ChecklistItemProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: 'PENDING' | 'RECEIVED' | 'WAIVED') => {
    if (isUpdating) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/checklist-items/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        onStatusChange?.(item.id, newStatus)
      } else {
        console.error('Failed to update item status')
      }
    } catch (error) {
      console.error('Error updating item status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return 'bg-green-100 text-green-800'
      case 'WAIVED':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
      <input
        type="checkbox"
        checked={item.status === 'RECEIVED'}
        onChange={(e) => handleStatusChange(e.target.checked ? 'RECEIVED' : 'PENDING')}
        disabled={isUpdating}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
      />

      <span className={`flex-1 text-sm ${
        item.status === 'RECEIVED' ? 'line-through text-gray-500' :
        item.required ? 'text-gray-900' : 'text-gray-700'
      }`}>
        {item.label}
        {item.required && <span className="text-red-500 ml-1">*</span>}
      </span>

      <div className="flex gap-2">
        {item.status !== 'RECEIVED' && (
          <button
            onClick={() => handleStatusChange('WAIVED')}
            disabled={isUpdating}
            className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 disabled:opacity-50"
          >
            Waive
          </button>
        )}
        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(item.status)}`}>
          {item.status}
        </span>
      </div>
    </div>
  )
}
