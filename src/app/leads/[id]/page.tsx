'use client'

import { useState, useEffect, use } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeftIcon, PencilIcon, PhoneIcon, ClockIcon, DocumentTextIcon, PlusIcon, ChevronDownIcon, TrashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import AddNoteForm from '@/components/AddNoteForm'
import AddTaskForm from '@/components/AddTaskForm'
import CreateChecklistForm from '@/components/CreateChecklistForm'
import ChecklistItemComponent from '@/components/ChecklistItem'
import TaskItem from '@/components/TaskItem'
import NoteItem from '@/components/NoteItem'
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

const applicationStatusColors: Record<string, string> = {
  NOT_STARTED: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  CONDITIONAL_APPROVED: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800'
}

const applicationStatusLabels: Record<string, string> = {
  NOT_STARTED: 'Not Contacted',
  IN_PROGRESS: 'In Progress',
  CONDITIONAL_APPROVED: 'Conditional Approved',
  APPROVED: 'Approved'
}

interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  sourceType: 'BANK' | 'ONLINE' | 'SELF_SOURCE' | 'OTHER'
  referrerId: string | null
  referrer: {
    id: string
    name: string
    isActive: boolean
  } | null
  stage: LeadStage
  leadType: 'PURCHASE' | 'REFINANCE' | 'OTHER'
  applicationStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'CONDITIONAL_APPROVED' | 'APPROVED'
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
  params: Promise<{ id: string }>
}) {
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showApplicationStatusDropdown, setShowApplicationStatusDropdown] = useState(false)
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false)
  const [editedLeadData, setEditedLeadData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    sourceType: 'OTHER',
    referrerId: '',
    leadType: ''
  })
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [referrers, setReferrers] = useState<Array<{ id: string; name: string; isActive: boolean }>>([])

  // Unwrap the params Promise
  const resolvedParams = use(params)
  const leadId = resolvedParams.id

  useEffect(() => {
    fetchLead()
    fetchReferrers()
  }, [leadId])

  const fetchReferrers = async () => {
    try {
      const response = await fetch('/api/referrers')
      if (response.ok) {
        const data = await response.json()
        setReferrers(data)
      }
    } catch (error) {
      console.error('Failed to fetch referrers:', error)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showApplicationStatusDropdown && !(event.target as Element).closest('.application-status-dropdown')) {
        setShowApplicationStatusDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showApplicationStatusDropdown])

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/leads/${leadId}`)
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

  const handleNoteUpdated = () => {
    fetchLead() // Refresh the lead data
  }

  const handleNoteDeleted = () => {
    fetchLead() // Refresh the lead data
  }

  const handleLeadInfoUpdate = async () => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedLeadData),
      })

      if (response.ok) {
        setIsEditingBasicInfo(false)
        fetchLead() // Refresh the lead data
      } else {
        const errorData = await response.json()
        console.error('Failed to update lead info:', errorData)
        alert(`Failed to update lead: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating lead info:', error)
      alert('Network error while updating lead information. Please try again.')
    }
  }

  const handleStartEdit = () => {
    if (!lead) return
    setEditedLeadData({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email || '',
      phone: lead.phone || '',
      sourceType: lead.sourceType,
      referrerId: lead.referrerId || '',
      leadType: lead.leadType
    })
    setIsEditingBasicInfo(true)
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
      const response = await fetch(`/api/leads/${leadId}`, {
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
      // Silently handle network errors to prevent UI breakage
      console.warn('Network error while updating financial data:', error)
    }
  }

  const handleApplicationStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationStatus: newStatus }),
      })

      if (response.ok) {
        // Update local state
        setLead(prev => prev ? { ...prev, applicationStatus: newStatus } : prev)
      } else {
        console.error('Failed to update application status')
      }
    } catch (error) {
      console.error('Error updating application status:', error)
    }
  }

  const handleDeleteLead = async () => {
    if (!lead) return

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Redirect to leads list page
        window.location.href = '/leads'
      } else {
        const errorData = await response.json()
        console.error('Failed to delete lead:', errorData)
        alert(`Failed to delete lead: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting lead:', error)
      alert('Network error while deleting lead. Please try again.')
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
                {isEditingBasicInfo ? (
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={editedLeadData.firstName}
                      onChange={(e) => setEditedLeadData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="text-2xl font-bold text-gray-900 border border-gray-300 rounded px-2 py-1"
                      placeholder="First Name"
                    />
                    <input
                      type="text"
                      value={editedLeadData.lastName}
                      onChange={(e) => setEditedLeadData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="text-2xl font-bold text-gray-900 border border-gray-300 rounded px-2 py-1"
                      placeholder="Last Name"
                    />
                  </div>
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900">
                    {lead.firstName} {lead.lastName}
                  </h1>
                )}
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageColors[lead.stage as LeadStage]}`}>
                {stageLabels[lead.stage as LeadStage]}
              </span>
              {isEditingBasicInfo ? (
                <select
                  value={editedLeadData.leadType}
                  onChange={(e) => setEditedLeadData(prev => ({ ...prev, leadType: e.target.value }))}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200"
                >
                  <option value="PURCHASE">Purchase</option>
                  <option value="REFINANCE">Refinance</option>
                  <option value="OTHER">Other</option>
                </select>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {lead.leadType.replace('_', ' ')}
                </span>
              )}
              <div className="relative application-status-dropdown">
                <button
                  onClick={() => setShowApplicationStatusDropdown(!showApplicationStatusDropdown)}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 ${applicationStatusColors[lead.applicationStatus]}`}
                >
                  {applicationStatusLabels[lead.applicationStatus]}
                  <ChevronDownIcon className="h-3 w-3 ml-1" />
                </button>
                {showApplicationStatusDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-40">
                    {Object.entries(applicationStatusLabels).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => {
                          handleApplicationStatusChange(key)
                          setShowApplicationStatusDropdown(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 first:rounded-t-md last:rounded-b-md ${
                          lead.applicationStatus === key ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {isEditingBasicInfo ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Source:</span>
                  <select
                    value={editedLeadData.sourceType}
                    onChange={(e) => setEditedLeadData(prev => ({ ...prev, sourceType: e.target.value as 'BANK' | 'ONLINE' | 'SELF_SOURCE' | 'OTHER' }))}
                    className="text-sm text-gray-500 border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="BANK">Bank</option>
                    <option value="ONLINE">Online</option>
                    <option value="SELF_SOURCE">Self Source</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <input
                    type="text"
                    value={editedLeadData.referrer}
                    onChange={(e) => setEditedLeadData(prev => ({ ...prev, referrer: e.target.value }))}
                    placeholder="Referrer name (optional)"
                    className="text-sm text-gray-500 border border-gray-300 rounded px-2 py-1"
                  />
                </div>
              ) : (
                <span className="text-sm text-gray-500">
                  Source: {lead.sourceType.replace('_', ' ')}
                  {lead.referrer && ` - ${lead.referrer.name}`}
                </span>
              )}
            </div>
          </div>
        </div>
            {isEditingBasicInfo ? (
              <div className="flex gap-2">
                <Button
                  onClick={handleLeadInfoUpdate}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditingBasicInfo(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleStartEdit}>
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirmation(true)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
      </div>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isEditingBasicInfo ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editedLeadData.email}
                    onChange={(e) => setEditedLeadData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editedLeadData.phone}
                    onChange={(e) => setEditedLeadData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="(416) 555-0123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source Type</label>
                  <select
                    value={editedLeadData.sourceType}
                    onChange={(e) => {
                      const newSourceType = e.target.value as 'BANK' | 'ONLINE' | 'SELF_SOURCE' | 'OTHER'
                      setEditedLeadData(prev => ({
                        ...prev,
                        sourceType: newSourceType,
                        referrerId: newSourceType !== 'BANK' ? '' : prev.referrerId // Clear referrer if not bank
                      }))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="BANK">Bank</option>
                    <option value="ONLINE">Online</option>
                    <option value="SELF_SOURCE">Self Source</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                {editedLeadData.sourceType === 'BANK' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Referrer</label>
                    <select
                      value={editedLeadData.referrerId}
                      onChange={(e) => setEditedLeadData(prev => ({ ...prev, referrerId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select referrer (optional)</option>
                      {referrers.map((referrer) => (
                        <option key={referrer.id} value={referrer.id}>
                          {referrer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            ) : (
              <>
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
                {lead.source && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Source: {lead.source}</span>
                  </div>
                )}
              </>
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
                  <NoteItem
                    key={note.id}
                    note={note}
                    onNoteUpdated={handleNoteUpdated}
                    onNoteDeleted={handleNoteDeleted}
                  />
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
                  <CreateChecklistForm leadId={lead.id} leadType={lead.leadType} onChecklistCreated={handleChecklistCreated} />
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

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Lead
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this lead? This action cannot be undone and will permanently remove all associated data including tasks, notes, checklists, and documents.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteLead}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Lead
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
