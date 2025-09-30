'use client'

import { useState, useEffect, use } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeftIcon, MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

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

const applicationStatusColors: Record<string, string> = {
  NOT_CONTACTED: 'bg-gray-100 text-gray-800',
  CONTACTED: 'bg-indigo-100 text-indigo-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  CONDITIONAL_APPROVED: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800'
}

const applicationStatusLabels: Record<string, string> = {
  NOT_CONTACTED: 'Not Contacted',
  CONTACTED: 'Contacted',
  IN_PROGRESS: 'In Progress',
  CONDITIONAL_APPROVED: 'Cond. Approved',
  APPROVED: 'Approved'
}

interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  sourceType: 'BANK' | 'ONLINE' | 'SELF_SOURCE' | 'OTHER'
  leadType: 'PURCHASE' | 'REFINANCE' | 'OTHER'
  applicationStatus: 'NOT_CONTACTED' | 'CONTACTED' | 'IN_PROGRESS' | 'CONDITIONAL_APPROVED' | 'APPROVED'
  stage: LeadStage
  createdAt: string
  updatedAt: string
  referrer?: {
    id: string
    name: string
  }
}

interface Referrer {
  id: string
  name: string
  isActive: boolean
  createdAt: string
}

interface ReferrerLeadsData {
  referrer: Referrer
  leads: Lead[]
  totalCount: number
}

export default function ReferrerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [data, setData] = useState<ReferrerLeadsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const resolvedParams = use(params)
  const referrerId = resolvedParams.id

  useEffect(() => {
    fetchReferrerLeads()
  }, [referrerId, statusFilter, startDate, endDate, searchTerm])

  const fetchReferrerLeads = async () => {
    try {
      const params = new URLSearchParams()

      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }
      if (startDate) {
        params.set('startDate', startDate)
      }
      if (endDate) {
        params.set('endDate', endDate)
      }
      if (searchTerm) {
        params.set('search', searchTerm)
      }

      const response = await fetch(`/api/referrers/${referrerId}/leads?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setData(data)
      } else {
        setError('Failed to fetch referrer leads')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setStatusFilter('all')
    setStartDate('')
    setEndDate('')
    setSearchTerm('')
  }

  const getStatusDisplay = (status: string | null) => {
    const statusLabels: Record<string, string> = {
      NOT_STARTED: 'Not Contacted',
      IN_PROGRESS: 'In Progress',
      CONDITIONAL_APPROVED: 'Conditional Approved',
      APPROVED: 'Approved'
    }
    return status ? statusLabels[status] || status : null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-600">Loading referrer leads...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-red-600">{error || 'Referrer not found'}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/referrers">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Referrers
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{data.referrer.name}</h1>
            <p className="text-gray-600">
              {data.totalCount} lead{data.totalCount !== 1 ? 's' : ''} •
              Added {new Date(data.referrer.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FunnelIcon className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="NOT_CONTACTED">Not Contacted</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="CONDITIONAL_APPROVED">Conditional Approved</option>
                  <option value="APPROVED">Approved</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, or phone"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="flex items-center gap-2"
              >
                <XMarkIcon className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leads from {data.referrer.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {data.leads.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || startDate || endDate
                  ? 'No leads match your filters.'
                  : 'No leads found for this referrer.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Application Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.firstName} {lead.lastName}
                        </div>
                        {lead.email && (
                          <div className="text-sm text-gray-500">{lead.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {lead.leadType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.sourceType.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageColors[lead.stage]}`}>
                          {lead.stage.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${applicationStatusColors[lead.applicationStatus]}`}>
                          {applicationStatusLabels[lead.applicationStatus]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link href={`/leads/${lead.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
