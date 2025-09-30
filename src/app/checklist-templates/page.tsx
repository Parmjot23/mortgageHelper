'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, DocumentTextIcon, CheckIcon } from '@heroicons/react/24/outline'

interface ChecklistItemTemplate {
  id: string
  label: string
  required: boolean
  sortOrder: number
}

interface ChecklistTemplate {
  id: string
  name: string
  leadType: 'PURCHASE' | 'REFINANCE' | 'OTHER'
  items: ChecklistItemTemplate[]
  _count: {
    items: number
  }
  createdAt: string
}

type LeadType = 'PURCHASE' | 'REFINANCE' | 'OTHER'

const leadTypeLabels: Record<LeadType, string> = {
  PURCHASE: 'Purchase',
  REFINANCE: 'Refinance',
  OTHER: 'Other'
}

const leadTypeColors: Record<LeadType, string> = {
  PURCHASE: 'bg-blue-100 text-blue-800',
  REFINANCE: 'bg-green-100 text-green-800',
  OTHER: 'bg-gray-100 text-gray-800'
}

export default function ChecklistTemplatesPage() {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    leadType: 'PURCHASE' as LeadType,
    items: [] as { label: string; required: boolean }[]
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/checklist-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      } else {
        setError('Failed to fetch templates')
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

    try {
      const url = editingTemplate ? `/api/checklist-templates/${editingTemplate.id}` : '/api/checklist-templates'
      const method = editingTemplate ? 'PATCH' : 'POST'

      const payload = {
        name: formData.name.trim(),
        leadType: formData.leadType,
        items: formData.items.map((item, index) => ({
          label: item.label.trim(),
          required: item.required,
          sortOrder: index
        }))
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setFormData({ name: '', leadType: 'PURCHASE', items: [] })
        setShowCreateForm(false)
        setEditingTemplate(null)
        fetchTemplates()
      } else {
        const errorData = await response.json()
        alert(`Failed to ${editingTemplate ? 'update' : 'create'} template: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Network error. Please try again.')
    }
  }

  const handleDelete = async (template: ChecklistTemplate) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"? This will permanently remove the template and all its items.`)) {
      return
    }

    try {
      const response = await fetch(`/api/checklist-templates/${template.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchTemplates()
      } else {
        const errorData = await response.json()
        alert(`Failed to delete template: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Network error. Please try again.')
    }
  }

  const startEdit = (template: ChecklistTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      leadType: template.leadType,
      items: template.items.map(item => ({
        label: item.label,
        required: item.required
      }))
    })
    setShowCreateForm(true)
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { label: '', required: true }]
    }))
  }

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const updateItem = (index: number, field: 'label' | 'required', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const cancelEdit = () => {
    setEditingTemplate(null)
    setFormData({ name: '', leadType: 'PURCHASE', items: [] })
    setShowCreateForm(false)
  }

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.leadType]) {
      acc[template.leadType] = []
    }
    acc[template.leadType].push(template)
    return acc
  }, {} as Record<LeadType, ChecklistTemplate[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-600">Loading checklist templates...</div>
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
          <h1 className="text-2xl font-bold text-gray-900">Checklist Templates</h1>
          <p className="text-gray-600">Manage document checklists for different application types</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Template Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Purchase Application Documents"
                  required
                  autoFocus
                />
              </div>

              {/* Lead Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Type
                </label>
                <select
                  value={formData.leadType}
                  onChange={(e) => setFormData(prev => ({ ...prev, leadType: e.target.value as LeadType }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="PURCHASE">Purchase</option>
                  <option value="REFINANCE">Refinance</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Checklist Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Checklist Items
                  </label>
                  <Button
                    type="button"
                    onClick={addItem}
                    variant="outline"
                    size="sm"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-md">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => updateItem(index, 'label', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Document requirement..."
                          required
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            checked={item.required}
                            onChange={(e) => updateItem(index, 'required', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          Required
                        </label>
                        <Button
                          type="button"
                          onClick={() => removeItem(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {formData.items.length === 0 && (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-md">
                    <DocumentTextIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No checklist items yet. Add your first item above.</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!formData.name.trim() || formData.items.length === 0}
                >
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Templates by Lead Type */}
      {Object.entries(groupedTemplates).map(([leadType, typeTemplates]) => (
        <div key={leadType} className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">
              {leadTypeLabels[leadType as LeadType]} Templates
            </h2>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${leadTypeColors[leadType as LeadType]}`}>
              {typeTemplates.length} template{typeTemplates.length !== 1 ? 's' : ''}
            </span>
          </div>

          {typeTemplates.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first {leadTypeLabels[leadType as LeadType].toLowerCase()} checklist template.
                </p>
                <Button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, leadType: leadType as LeadType }))
                    setShowCreateForm(true)
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {typeTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                          {template.name}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          {template._count.items} item{template._count.items !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(template)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(template)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {template.items.slice(0, 3).map((item, index) => (
                        <div key={item.id} className="flex items-center gap-2 text-sm">
                          {item.required ? (
                            <CheckIcon className="h-3 w-3 text-green-600 flex-shrink-0" />
                          ) : (
                            <div className="h-3 w-3 border border-gray-300 rounded flex-shrink-0" />
                          )}
                          <span className="text-gray-700 truncate">{item.label}</span>
                        </div>
                      ))}
                      {template.items.length > 3 && (
                        <p className="text-sm text-gray-500">
                          +{template.items.length - 3} more items
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                      Created {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
