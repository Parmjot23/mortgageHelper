'use client'

import { useState } from 'react'
import { CheckCircleIcon, ClockIcon, PencilIcon } from '@heroicons/react/24/outline'

interface Task {
  id: string
  title: string
  type: 'CALL' | 'EMAIL' | 'DOCS_CHASE' | 'OTHER'
  dueAt: string | null
  status: 'OPEN' | 'DONE' | 'CANCELED'
  createdAt: string
}

interface TaskItemProps {
  task: Task
  onStatusChange?: (id: string, status: 'OPEN' | 'DONE' | 'CANCELED') => void
}

export default function TaskItem({ task, onStatusChange }: TaskItemProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: 'OPEN' | 'DONE' | 'CANCELED') => {
    if (isUpdating) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        onStatusChange?.(task.id, newStatus)
      } else {
        console.error('Failed to update task status')
      }
    } catch (error) {
      console.error('Error updating task status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const isOverdue = task.dueAt && new Date(task.dueAt) < new Date() && task.status === 'OPEN'

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CALL':
        return 'bg-blue-100 text-blue-800'
      case 'EMAIL':
        return 'bg-purple-100 text-purple-800'
      case 'DOCS_CHASE':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`p-3 rounded-lg border ${
      isOverdue ? 'bg-red-50 border-red-200' :
      task.status === 'DONE' ? 'bg-green-50 border-green-200' :
      'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${
            task.status === 'DONE' ? 'line-through text-gray-500' :
            isOverdue ? 'text-red-900' :
            'text-gray-900'
          }`}>
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(task.type)}`}>
              {task.type}
            </span>
            {task.dueAt && (
              <span className={`text-xs flex items-center gap-1 ${
                isOverdue ? 'text-red-700' : 'text-gray-600'
              }`}>
                <ClockIcon className="h-3 w-3" />
                {new Date(task.dueAt).toLocaleDateString()}
                {isOverdue && ' (Overdue)'}
              </span>
            )}
          </div>
        </div>

        {task.status === 'OPEN' && (
          <div className="flex gap-2 ml-2">
            <button
              onClick={() => handleStatusChange('DONE')}
              disabled={isUpdating}
              className="text-green-600 hover:text-green-800 disabled:opacity-50"
              title="Mark as done"
            >
              <CheckCircleIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
          task.status === 'DONE' ? 'bg-green-100 text-green-800' :
          task.status === 'CANCELED' ? 'bg-red-100 text-red-800' :
          isOverdue ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {task.status}
        </span>
      </div>
    </div>
  )
}
