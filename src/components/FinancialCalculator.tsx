'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalculatorIcon, CurrencyDollarIcon, PercentBadgeIcon } from '@heroicons/react/24/outline'

interface FinancialCalculatorProps {
  leadData: {
    propertyValue?: number
    downPayment?: number
    loanAmount?: number
    interestRate?: number
    termYears?: number
    monthlyIncome?: number
    monthlyDebts?: number
  }
  onDataChange?: (data: any) => void
}

export default function FinancialCalculator({ leadData, onDataChange }: FinancialCalculatorProps) {
  const [data, setData] = useState({
    propertyValue: leadData.propertyValue || 0,
    downPayment: leadData.downPayment || 0,
    loanAmount: leadData.loanAmount || 0,
    interestRate: leadData.interestRate || 4.5,
    termYears: leadData.termYears || 25,
    monthlyIncome: leadData.monthlyIncome || 0,
    monthlyDebts: leadData.monthlyDebts || 0,
  })

  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const [calculations, setCalculations] = useState({
    monthlyPayment: 0,
    totalPayments: 0,
    totalInterest: 0,
    gdsRatio: 0,
    tdsRatio: 0,
    downPaymentPercent: 0,
  })

  // Calculate mortgage payment using standard formula
  const calculateMortgagePayment = (principal: number, rate: number, years: number) => {
    const monthlyRate = rate / 100 / 12
    const numPayments = years * 12

    if (monthlyRate === 0) return principal / numPayments

    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
           (Math.pow(1 + monthlyRate, numPayments) - 1)
  }

  // Calculate all financial metrics
  const calculateAll = () => {
    const propertyValue = data.propertyValue || 0
    const downPayment = data.downPayment || 0
    const loanAmount = data.loanAmount || (propertyValue - downPayment)
    const interestRate = data.interestRate || 0
    const termYears = data.termYears || 25
    const monthlyIncome = data.monthlyIncome || 0
    const monthlyDebts = data.monthlyDebts || 0

    const monthlyPayment = calculateMortgagePayment(loanAmount, interestRate, termYears)
    const totalPayments = monthlyPayment * termYears * 12
    const totalInterest = totalPayments - loanAmount

    const gdsRatio = monthlyIncome > 0 ? ((monthlyPayment + monthlyDebts) / monthlyIncome) * 100 : 0
    const tdsRatio = monthlyIncome > 0 ? ((monthlyPayment + monthlyDebts) / monthlyIncome) * 100 : 0 // Simplified
    const downPaymentPercent = propertyValue > 0 ? (downPayment / propertyValue) * 100 : 0

    return {
      monthlyPayment,
      totalPayments,
      totalInterest,
      gdsRatio,
      tdsRatio,
      downPaymentPercent,
    }
  }

  // Debounced function to notify parent of changes
  const debouncedDataChange = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      // Only send data if onDataChange is provided and we have valid data
      if (onDataChange && Object.values(data).some(val => val !== 0 && val !== '')) {
        onDataChange(data)
      }
    }, 1500) // Wait 1.5 seconds after user stops typing
  }, [data, onDataChange])

  useEffect(() => {
    const results = calculateAll()
    setCalculations(results)

    // Auto-calculate loan amount if not provided
    if (data.propertyValue && data.downPayment && !data.loanAmount) {
      const calculatedLoan = data.propertyValue - data.downPayment
      setData(prev => ({ ...prev, loanAmount: calculatedLoan }))
    }

    // Notify parent component of changes with debouncing
    debouncedDataChange()
  }, [data, debouncedDataChange])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0
    // Ensure non-negative values for financial fields
    const validatedValue = numValue < 0 ? 0 : numValue
    setData(prev => ({ ...prev, [field]: validatedValue }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalculatorIcon className="h-5 w-5" />
            Mortgage Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Value
              </label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={data.propertyValue || ''}
                  onChange={(e) => handleInputChange('propertyValue', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="500,000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Down Payment
              </label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={data.downPayment || ''}
                  onChange={(e) => handleInputChange('downPayment', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="100,000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Amount
              </label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={data.loanAmount || ''}
                  onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="400,000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interest Rate (%)
              </label>
              <div className="relative">
                <PercentBadgeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  value={data.interestRate || ''}
                  onChange={(e) => handleInputChange('interestRate', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="4.5"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Term (Years)
              </label>
              <input
                type="number"
                value={data.termYears || ''}
                onChange={(e) => handleInputChange('termYears', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="25"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Gross Income
              </label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={data.monthlyIncome || ''}
                  onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="8,000"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Debt Payments (excluding mortgage)
              </label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={data.monthlyDebts || ''}
                  onChange={(e) => handleInputChange('monthlyDebts', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="500"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card>
        <CardHeader>
          <CardTitle>Calculation Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Monthly Payment</div>
              <div className="text-2xl font-bold text-blue-900">
                {formatCurrency(calculations.monthlyPayment)}
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Down Payment %</div>
              <div className="text-2xl font-bold text-green-900">
                {formatPercent(calculations.downPaymentPercent)}
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">GDS Ratio</div>
              <div className={`text-2xl font-bold ${calculations.gdsRatio > 39 ? 'text-red-600' : 'text-purple-900'}`}>
                {formatPercent(calculations.gdsRatio)}
              </div>
              <div className="text-xs text-purple-600 mt-1">
                {calculations.gdsRatio > 39 ? 'High - May need adjustment' : 'Within guidelines'}
              </div>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-sm text-orange-600 font-medium">TDS Ratio</div>
              <div className={`text-2xl font-bold ${calculations.tdsRatio > 44 ? 'text-red-600' : 'text-orange-900'}`}>
                {formatPercent(calculations.tdsRatio)}
              </div>
              <div className="text-xs text-orange-600 mt-1">
                {calculations.tdsRatio > 44 ? 'High - May need adjustment' : 'Within guidelines'}
              </div>
            </div>

            <div className="p-4 bg-indigo-50 rounded-lg">
              <div className="text-sm text-indigo-600 font-medium">Total Interest</div>
              <div className="text-2xl font-bold text-indigo-900">
                {formatCurrency(calculations.totalInterest)}
              </div>
            </div>

            <div className="p-4 bg-teal-50 rounded-lg">
              <div className="text-sm text-teal-600 font-medium">Total Cost</div>
              <div className="text-2xl font-bold text-teal-900">
                {formatCurrency(calculations.totalPayments)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
