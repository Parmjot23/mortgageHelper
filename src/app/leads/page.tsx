'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, UserGroupIcon, Squares2X2Icon, ListBulletIcon, DocumentCheckIcon, CurrencyDollarIcon, CalculatorIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

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
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  CONDITIONAL_APPROVED: 'Cond. Approved',
  APPROVED: 'Approved'
}

export default function LeadsPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('detailed')
  const [deleteLeadId, setDeleteLeadId] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const params = new URLSearchParams()
        params.set('include', 'tasks,checklists,notes')

        const status = searchParams.get('status')
        if (status) {
          params.set('status', status)
        }

        const response = await fetch(`/api/leads?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch leads')
        }
        const data = await response.json()
        setLeads(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [searchParams])

  const handleDeleteLead = async (leadId: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh the leads list
        const params = new URLSearchParams()
        params.set('include', 'tasks,checklists,notes')

        const status = searchParams.get('status')
        if (status) {
          params.set('status', status)
        }

        const refreshResponse = await fetch(`/api/leads?${params.toString()}`)
        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          setLeads(data)
        }
        setDeleteLeadId(null)
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
        <div className="text-gray-600">Loading leads...</div>
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

  const getStatusDisplay = (status: string | null) => {
    const statusLabels: Record<string, string> = {
      NOT_STARTED: 'Not Started',
      IN_PROGRESS: 'In Progress',
      CONDITIONAL_APPROVED: 'Conditional Approved',
      APPROVED: 'Approved'
    }
    return status ? statusLabels[status] || status : null
  }

  const statusFilter = searchParams.get('status')
  const statusDisplay = getStatusDisplay(statusFilter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Leads {statusDisplay && <span className="text-lg font-normal text-gray-600">- {statusDisplay}</span>}
          </h1>
          <p className="text-gray-600">
            {statusDisplay
              ? `Showing leads with application status: ${statusDisplay.toLowerCase()}`
              : 'Manage your mortgage leads and track their progress'
            }
          </p>
          {statusFilter && (
            <div className="mt-2">
              <Link
                href="/leads"
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Clear Filter
                <XMarkIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>
          )}
        </div>
        <Link href="/leads/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </Link>
      </div>

      {/* View Toggle and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">View:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-xs px-3 py-1 rounded-md"
                    onClick={() => setViewMode('compact')}
                    style={{
                      backgroundColor: viewMode === 'compact' ? 'white' : 'transparent',
                      boxShadow: viewMode === 'compact' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
                    }}
                  >
                    <ListBulletIcon className="h-3 w-3" />
                    Compact
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-xs px-3 py-1 rounded-md"
                    onClick={() => setViewMode('detailed')}
                    style={{
                      backgroundColor: viewMode === 'detailed' ? 'white' : 'transparent',
                      boxShadow: viewMode === 'detailed' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
                    }}
                  >
                    <Squares2X2Icon className="h-3 w-3" />
                    Detailed
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <FunnelIcon className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      {leads.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <UserGroupIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first mortgage lead.</p>
            <Link href="/leads/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Your First Lead
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : viewMode === 'detailed' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {leads.map((lead) => {
            // Calculate document checklist status
            const totalDocs = lead.checklists.reduce((total, checklist) =>
              total + checklist.items.length, 0
            )
            const receivedDocs = lead.checklists.reduce((received, checklist) =>
              received + checklist.items.filter(item => item.status === 'RECEIVED').length, 0
            )
            const pendingDocs = totalDocs - receivedDocs

            // Calculate financial ratios
            const monthlyPayment = lead.loanAmount && lead.interestRate && lead.termYears ?
              Math.round((lead.loanAmount * (lead.interestRate / 100 / 12) *
              Math.pow(1 + lead.interestRate / 100 / 12, lead.termYears * 12)) /
              (Math.pow(1 + lead.interestRate / 100 / 12, lead.termYears * 12) - 1)) : 0

            const gdsRatio = lead.monthlyIncome && lead.monthlyIncome > 0 ?
              Math.round(((monthlyPayment + (lead.monthlyDebts || 0)) / lead.monthlyIncome) * 100) : 0

            return (
              <Card key={lead.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {lead.firstName} {lead.lastName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stageColors[lead.stage as LeadStage]}`}>
                          {stageLabels[lead.stage as LeadStage]}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {lead.leadType.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${applicationStatusColors[lead.applicationStatus]}`}>
                          {applicationStatusLabels[lead.applicationStatus]}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteLeadId(lead.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Financial Summary */}
                  {(lead.propertyValue || lead.loanAmount) && (
                    <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CurrencyDollarIcon className="h-3 w-3 text-blue-600" />
                        <span className="text-xs font-medium text-blue-800">Financial</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {lead.propertyValue && (
                          <div>
                            <span className="text-gray-600">Price:</span>
                            <span className="font-medium ml-1">${lead.propertyValue.toLocaleString()}</span>
                          </div>
                        )}
                        {lead.loanAmount && (
                          <div>
                            <span className="text-gray-600">Loan:</span>
                            <span className="font-medium ml-1">${lead.loanAmount.toLocaleString()}</span>
                          </div>
                        )}
                        {monthlyPayment > 0 && (
                          <div>
                            <span className="text-gray-600">Payment:</span>
                            <span className="font-medium ml-1">${monthlyPayment}/mo</span>
                          </div>
                        )}
                        {gdsRatio > 0 && (
                          <div>
                            <span className="text-gray-600">GDS:</span>
                            <span className={`font-medium ml-1 ${gdsRatio > 39 ? 'text-red-600' : 'text-green-600'}`}>
                              {gdsRatio}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Document Status */}
                  {totalDocs > 0 && (
                    <div className="mb-3 p-2 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <DocumentCheckIcon className="h-3 w-3 text-green-600" />
                        <span className="text-xs font-medium text-green-800">Documents</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-green-700">✓ {receivedDocs} received</span>
                        <span className="text-orange-700">⏳ {pendingDocs} pending</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div
                          className="bg-green-500 h-1 rounded-full"
                          style={{ width: `${totalDocs > 0 ? (receivedDocs / totalDocs) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Tasks Summary */}
                  {lead.tasks.length > 0 && (
                    <div className="mb-3 p-2 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CalculatorIcon className="h-3 w-3 text-yellow-600" />
                        <span className="text-xs font-medium text-yellow-800">Tasks</span>
                      </div>
                      <div className="text-xs text-yellow-700">
                        {lead.tasks.length} open task{lead.tasks.length !== 1 ? 's' : ''}
                        {lead.tasks[0].dueAt && (
                          <span className="ml-1">
                            (next: {new Date(lead.tasks[0].dueAt).toLocaleDateString()})
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="text-xs text-gray-600 space-y-1 mb-3">
                    {lead.email && <div>📧 {lead.email}</div>}
                    {lead.phone && <div>📱 {lead.phone}</div>}
                    {lead.source && <div>📍 {lead.source}</div>}
                  </div>

                  {/* Action Button */}
                  <Link href={`/leads/${lead.id}`}>
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-xs">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="grid gap-4">
          {leads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {lead.firstName} {lead.lastName}
                      </h3>
                      <div className="flex items-center gap-4 mt-1">
                        {lead.email && (
                          <p className="text-sm text-gray-600">{lead.email}</p>
                        )}
                        {lead.phone && (
                          <p className="text-sm text-gray-600">{lead.phone}</p>
                        )}
                        {lead.source && (
                          <p className="text-sm text-gray-500">Source: {lead.source}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageColors[lead.stage as LeadStage]}`}>
                      {stageLabels[lead.stage as LeadStage]}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link href={`/leads/${lead.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteLeadId(lead.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {lead.nextActionAt && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Next action: {new Date(lead.nextActionAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteLeadId && (
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
                onClick={() => setDeleteLeadId(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteLead(deleteLeadId)}
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
