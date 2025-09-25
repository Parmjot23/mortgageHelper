'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { PencilIcon, TrashIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Note {
  id: string
  body: string
  pinned: boolean
  createdAt: string
}

interface NoteItemProps {
  note: Note
  onNoteUpdated?: () => void
  onNoteDeleted?: () => void
}

export default function NoteItem({ note, onNoteUpdated, onNoteDeleted }: NoteItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editBody, setEditBody] = useState(note.body)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEdit = async () => {
    if (!editBody.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: editBody.trim() }),
      })

      if (response.ok) {
        setIsEditing(false)
        onNoteUpdated?.()
      } else {
        console.error('Failed to update note')
      }
    } catch (error) {
      console.error('Error updating note:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onNoteDeleted?.()
      } else {
        console.error('Failed to delete note')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const handleTogglePin = async () => {
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pinned: !note.pinned }),
      })

      if (response.ok) {
        onNoteUpdated?.()
      } else {
        console.error('Failed to toggle pin')
      }
    } catch (error) {
      console.error('Error toggling pin:', error)
    }
  }

  return (
    <div className={`p-4 rounded-lg border relative group ${
      note.pinned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
    }`}>
      {/* Action buttons - show on hover */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTogglePin}
          className="h-6 w-6 p-0 hover:bg-gray-200"
          title={note.pinned ? 'Unpin note' : 'Pin note'}
        >
          <MapPinIcon className={`h-3 w-3 ${note.pinned ? 'text-yellow-600' : 'text-gray-500'}`} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsEditing(true)
            setEditBody(note.body)
          }}
          className="h-6 w-6 p-0 hover:bg-gray-200"
          title="Edit note"
        >
          <PencilIcon className="h-3 w-3 text-gray-500" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="h-6 w-6 p-0 hover:bg-red-200 text-red-600"
          title="Delete note"
        >
          <TrashIcon className="h-3 w-3" />
        </Button>
      </div>

      {/* Pinned indicator */}
      {note.pinned && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded flex items-center gap-1">
            <MapPinIcon className="h-3 w-3" />
            PINNED
          </span>
        </div>
      )}

      {/* Note content */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
            rows={3}
            placeholder="Enter your note..."
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(false)
                setEditBody(note.body)
              }}
            >
              <XMarkIcon className="h-3 w-3 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleEdit}
              disabled={isSubmitting || !editBody.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-700 whitespace-pre-wrap pr-16">{note.body}</p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(note.createdAt).toLocaleString()}
          </p>
        </>
      )}
    </div>
  )
}
