'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Referrer {
  id: string
  name: string
  isActive: boolean
  createdAt: string
}

export default function ReferrersPage() {
  const [referrers, setReferrers] = useState<Referrer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingReferrer, setEditingReferrer] = useState<Referrer | null>(null)
  const [formData, setFormData] = useState({ name: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchReferrers()
  }, [])

  const fetchReferrers = async () => {
    try {
      const response = await fetch('/api/referrers')
      if (response.ok) {
        const data = await response.json()
        setReferrers(data)
      } else {
        setError('Failed to fetch referrers')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsSubmitting(true)
    try {
      const url = editingReferrer ? `/api/referrers/${editingReferrer.id}` : '/api/referrers'
      const method = editingReferrer ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: formData.name.trim() }),
      })

      if (response.ok) {
        setFormData({ name: '' })
        setShowAddForm(false)
        setEditingReferrer(null)
        fetchReferrers()
      } else {
        const errorData = await response.json()
        alert(`Failed to ${editingReferrer ? 'update' : 'create'} referrer: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (referrer: Referrer) => {
    if (!confirm(`Are you sure you want to deactivate "${referrer.name}"? This will remove it from the referrer list.`)) {
      return
    }

    try {
      const response = await fetch(`/api/referrers/${referrer.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchReferrers()
      } else {
        const errorData = await response.json()
        alert(`Failed to deactivate referrer: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting referrer:', error)
      alert('Network error. Please try again.')
    }
  }

  const startEdit = (referrer: Referrer) => {
    setEditingReferrer(referrer)
    setFormData({ name: referrer.name })
    setShowAddForm(true)
  }

  const cancelEdit = () => {
    setEditingReferrer(null)
    setFormData({ name: '' })
    setShowAddForm(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-600">Loading referrers...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank Referrers</h1>
          <p className="text-gray-600">Manage the list of bank referrers for lead tracking</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Referrer
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingReferrer ? 'Edit Referrer' : 'Add New Referrer'}
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelEdit}
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Referrer Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter referrer name"
                  required
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                  {isSubmitting ? (editingReferrer ? 'Updating...' : 'Adding...') : (editingReferrer ? 'Update' : 'Add')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Referrers List */}
      {referrers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <PlusIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No referrers yet</h3>
            <p className="text-gray-600 mb-6">Add your first bank referrer to start tracking leads by referrer.</p>
            <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Your First Referrer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {referrers.map((referrer) => (
            <Card key={referrer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{referrer.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Added {new Date(referrer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(referrer)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(referrer)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
