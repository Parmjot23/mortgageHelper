'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

interface ChecklistTemplate {
  id: string
  name: string
  leadType: 'PURCHASE' | 'REFINANCE' | 'RENEWAL' | 'EQUITY_LINE' | 'OTHER'
  _count: {
    items: number
  }
}

interface CreateChecklistFormProps {
  leadId: string
  leadType: 'PURCHASE' | 'REFINANCE' | 'RENEWAL' | 'EQUITY_LINE' | 'OTHER'
  onChecklistCreated?: () => void
}

export default function CreateChecklistForm({ leadId, leadType, onChecklistCreated }: CreateChecklistFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [customTitle, setCustomTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && templates.length === 0) {
      loadTemplates()
    }
  }, [isOpen, templates.length])

  const loadTemplates = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/checklist-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
        // Auto-select the template that matches the lead type
        const matchingTemplate = data.find((template: ChecklistTemplate) => template.leadType === leadType)
        if (matchingTemplate) {
          setSelectedTemplate(matchingTemplate.id)
        }
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTemplate) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/leads/${leadId}/checklists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: selectedTemplate,
          title: customTitle.trim() || undefined,
        }),
      })

      if (response.ok) {
        setSelectedTemplate('')
        setCustomTitle('')
        setIsOpen(false)
        onChecklistCreated?.()
      } else {
        console.error('Failed to create checklist')
      }
    } catch (error) {
      console.error('Error creating checklist:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <PlusIcon className="h-4 w-4 mr-2" />
        Create Checklist
      </Button>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Create Checklist
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600">No templates available</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Template
                </label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  {selectedTemplate ? (
                    (() => {
                      const template = templates.find(t => t.id === selectedTemplate)
                      return template ? (
                        <div>
                          <div className="font-medium text-blue-900">{template.name}</div>
                          <div className="text-sm text-blue-700">{template._count.items} items</div>
                        </div>
                      ) : (
                        <div className="text-gray-500">No template selected</div>
                      )
                    })()
                  ) : (
                    <div className="text-gray-500">No matching template found for {leadType}</div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Title (Optional)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Leave blank to use template name"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedTemplate}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Creating...' : 'Create Checklist'}
                </Button>
              </div>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
