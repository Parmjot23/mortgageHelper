'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface AddTaskFormProps {
  leadId: string
  onTaskAdded?: () => void
}

export default function AddTaskForm({ leadId, onTaskAdded }: AddTaskFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'CALL' | 'EMAIL' | 'DOCS_CHASE' | 'OTHER'>('OTHER')
  const [dueAt, setDueAt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/leads/${leadId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          type,
          dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        }),
      })

      if (response.ok) {
        setTitle('')
        setType('OTHER')
        setDueAt('')
        setIsOpen(false)
        onTaskAdded?.()
      } else {
        console.error('Failed to add task')
      }
    } catch (error) {
      console.error('Error adding task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="w-full"
      >
        <PlusIcon className="h-4 w-4 mr-2" />
        Add Task
      </Button>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as typeof type)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="OTHER">Other</option>
                <option value="CALL">Call</option>
                <option value="EMAIL">Email</option>
                <option value="DOCS_CHASE">Document Chase</option>
              </select>
            </div>

            <div>
              <input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false)
                setTitle('')
                setType('OTHER')
                setDueAt('')
              }}
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
