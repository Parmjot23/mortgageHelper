'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeftIcon, PencilIcon, PhoneIcon, ClockIcon, DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import AddNoteForm from '@/components/AddNoteForm'
import AddTaskForm from '@/components/AddTaskForm'
import CreateChecklistForm from '@/components/CreateChecklistForm'
import ChecklistItemComponent from '@/components/ChecklistItem'
import TaskItem from '@/components/TaskItem'
import FinancialCalculator from '@/components/FinancialCalculator'

type LeadStage = 'NEW' | 'CONTACTED' | 'PREQUAL' | 'DOCS_REQUESTED' | 'DOCS_RECEIVED' | 'PACKAGED' | 'SUBMITTED' | 'APPROVED' | 'FUNDED' | 'LOST'

const stageColors: Record<LeadStage, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  PREQUAL: 'bg-purple-100 text-purple-800',
  DOCS_REQUESTED: 'bg-orange-100 text-orange-800',
  DOCS_RECEIVED: 'bg-indigo-100 text-indigo-800',
  PACKAGED: 'bg-green-100 text-green-800',
  SUBMITTED: 'bg-cyan-100 text-cyan-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  FUNDED: 'bg-lime-100 text-lime-800',
  LOST: 'bg-red-100 text-red-800'
}

const stageLabels: Record<LeadStage, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  PREQUAL: 'Pre-qual',
  DOCS_REQUESTED: 'Docs Requested',
  DOCS_RECEIVED: 'Docs Received',
  PACKAGED: 'Packaged',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  FUNDED: 'Funded',
  LOST: 'Lost'
}

interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  source: string | null
  stage: LeadStage
  leadType: 'PURCHASE' | 'REFINANCE' | 'RENEWAL' | 'EQUITY_LINE' | 'OTHER'
  nextActionAt: string | null
  propertyValue?: number
  downPayment?: number
  loanAmount?: number
  interestRate?: number
  termYears?: number
  monthlyIncome?: number
  monthlyDebts?: number
  creditScore?: number
  gdsRatio?: number
  tdsRatio?: number
  createdAt: string
  updatedAt: string
  tasks: Task[]
  notes: Note[]
  checklists: Checklist[]
}

interface Task {
  id: string
  title: string
  type: 'CALL' | 'EMAIL' | 'DOCS_CHASE' | 'OTHER'
  dueAt: string | null
  status: 'OPEN' | 'DONE' | 'CANCELED'
  createdAt: string
}

interface Note {
  id: string
  body: string
  pinned: boolean
  createdAt: string
}


interface Checklist {
  id: string
  title: string
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETE'
  createdAt: string
  items: ChecklistItem[]
}

interface ChecklistItem {
  id: string
  label: string
  required: boolean
  status: 'PENDING' | 'RECEIVED' | 'WAIVED'
}

export default function LeadDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLead()
  }, [params.id])

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/leads/${params.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch lead')
      }
      const data = await response.json()
      setLead(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChecklistItemUpdate = (itemId: string, newStatus: 'PENDING' | 'RECEIVED' | 'WAIVED') => {
    if (!lead) return

    setLead(prev => {
      if (!prev) return prev

      return {
        ...prev,
        checklists: prev.checklists.map(checklist => ({
          ...checklist,
          items: checklist.items.map(item =>
            item.id === itemId ? { ...item, status: newStatus } : item
          )
        }))
      }
    })
  }

  const handleChecklistCreated = () => {
    fetchLead() // Refresh the lead data
  }

  const handleTaskStatusChange = (taskId: string, newStatus: 'OPEN' | 'DONE' | 'CANCELED') => {
    setLead(prev => {
      if (!prev) return prev

      return {
        ...prev,
        tasks: prev.tasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      }
    })
  }

  const handleFinancialDataChange = async (financialData: any) => {
    try {
      const response = await fetch(`/api/leads/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(financialData),
      })

      if (response.ok) {
        // Update local state
        setLead(prev => prev ? { ...prev, ...financialData } : prev)
      } else {
        console.error('Failed to update financial data')
      }
    } catch (error) {
      console.error('Error updating financial data:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-red-600">{error || 'Lead not found'}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/leads">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Leads
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {lead.firstName} {lead.lastName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageColors[lead.stage as LeadStage]}`}>
                {stageLabels[lead.stage as LeadStage]}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {lead.leadType.replace('_', ' ')}
              </span>
              {lead.source && (
                <span className="text-sm text-gray-500">Source: {lead.source}</span>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline">
          <PencilIcon className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lead.email && (
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">{lead.email}</span>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
                <a href={`tel:${lead.phone}`} className="text-blue-600 hover:text-blue-800">
                  {lead.phone}
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Tasks</p>
                <p className="text-2xl font-semibold text-gray-900">{lead.tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Notes</p>
                <p className="text-2xl font-semibold text-gray-900">{lead.notes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Checklists</p>
                <p className="text-2xl font-semibold text-gray-900">{lead.checklists.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Notes
              <span className="text-sm font-normal text-gray-500">
                {lead.notes.length} total
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AddNoteForm leadId={lead.id} onNoteAdded={fetchLead} />

            {lead.notes.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {lead.notes.map((note) => (
                  <div key={note.id} className={`p-3 rounded-lg border ${
                    note.pinned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                  }`}>
                    {note.pinned && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                          PINNED
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.body}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>No notes yet.</p>
                <p className="text-sm">Add your first note above.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Tasks
              <span className="text-sm font-normal text-gray-500">
                {lead.tasks.length} total
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AddTaskForm leadId={lead.id} onTaskAdded={fetchLead} />

            {lead.tasks.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {lead.tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onStatusChange={handleTaskStatusChange}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>No tasks yet.</p>
                <p className="text-sm">Add your first task above.</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Checklists Section */}
      <Card>
        <CardHeader>
          <CardTitle>Document Checklists</CardTitle>
        </CardHeader>
        <CardContent>
          {lead.checklists.length > 0 ? (
            <div className="space-y-4">
              {lead.checklists.map((checklist) => (
                <div key={checklist.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{checklist.title}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      checklist.status === 'COMPLETE' ? 'bg-green-100 text-green-800' :
                      checklist.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {checklist.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {checklist.items.map((item) => (
                      <ChecklistItemComponent
                        key={item.id}
                        item={item}
                        onStatusChange={handleChecklistItemUpdate}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No checklists created yet.</p>
              <p className="text-sm text-gray-500 mb-6">Create a checklist to track required documents.</p>
              <CreateChecklistForm leadId={lead.id} onChecklistCreated={handleChecklistCreated} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Calculator */}
      <FinancialCalculator
        leadData={{
          propertyValue: lead.propertyValue,
          downPayment: lead.downPayment,
          loanAmount: lead.loanAmount,
          interestRate: lead.interestRate,
          termYears: lead.termYears,
          monthlyIncome: lead.monthlyIncome,
          monthlyDebts: lead.monthlyDebts,
        }}
        onDataChange={handleFinancialDataChange}
      />
    </div>
  )
}
