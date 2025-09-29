'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function NewLeadPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [referrers, setReferrers] = useState<Array<{ id: string; name: string; isActive: boolean }>>([])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    sourceType: 'OTHER',
    referrerId: '',
    leadType: 'PURCHASE',
    applicationStatus: 'NOT_STARTED',
  })

  useEffect(() => {
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
    fetchReferrers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/leads')
      } else {
        console.error('Failed to create lead')
      }
    } catch (error) {
      console.error('Error creating lead:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/leads">
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Lead</h1>
          <p className="text-gray-600">Enter the basic information for your new mortgage lead</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Smith"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="john.smith@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(416) 555-0123"
                />
              </div>

              <div>
                <label htmlFor="leadType" className="block text-sm font-medium text-gray-700 mb-2">
                  Lead Type *
                </label>
                <select
                  id="leadType"
                  name="leadType"
                  value={formData.leadType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="PURCHASE">Purchase</option>
                  <option value="REFINANCE">Refinance</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="applicationStatus" className="block text-sm font-medium text-gray-700 mb-2">
                  Application Status
                </label>
                <select
                  id="applicationStatus"
                  name="applicationStatus"
                  value={formData.applicationStatus}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="CONDITIONAL_APPROVED">Conditional Approved</option>
                  <option value="APPROVED">Approved</option>
                </select>
              </div>

              <div>
                <label htmlFor="sourceType" className="block text-sm font-medium text-gray-700 mb-2">
                  Source Type
                </label>
                <select
                  id="sourceType"
                  name="sourceType"
                  value={formData.sourceType}
                  onChange={(e) => {
                    const newSourceType = e.target.value as 'BANK' | 'ONLINE' | 'SELF_SOURCE' | 'OTHER'
                    setFormData(prev => ({
                      ...prev,
                      sourceType: newSourceType,
                      referrerId: newSourceType !== 'BANK' ? '' : prev.referrerId // Clear referrer if not bank
                    }))
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="BANK">Bank</option>
                  <option value="ONLINE">Online</option>
                  <option value="SELF_SOURCE">Self Source</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {formData.sourceType === 'BANK' && (
                <div>
                  <label htmlFor="referrerId" className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Referrer
                  </label>
                  <select
                    id="referrerId"
                    name="referrerId"
                    value={formData.referrerId}
                    onChange={handleChange}
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
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Link href="/leads">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Creating...' : 'Create Lead'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
