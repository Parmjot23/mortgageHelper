import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
        notes: {
          orderBy: [
            { pinned: 'desc' },
            { createdAt: 'desc' }
          ],
        },
        emails: {
          orderBy: { createdAt: 'desc' },
        },
        checklists: {
          include: {
            items: {
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Failed to fetch lead:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    )
  }
}

const updateLeadSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  source: z.string().optional(),
  leadType: z.enum(['PURCHASE', 'REFINANCE', 'OTHER']).optional(),
  applicationStatus: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'CONDITIONAL_APPROVED', 'APPROVED']).optional(),
  propertyValue: z.number().optional(),
  downPayment: z.number().optional(),
  loanAmount: z.number().optional(),
  interestRate: z.number().optional(),
  termYears: z.number().optional(),
  monthlyIncome: z.number().optional(),
  monthlyDebts: z.number().optional(),
  creditScore: z.number().optional(),
  gdsRatio: z.number().optional(),
  tdsRatio: z.number().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateLeadSchema.parse(body)

    const lead = await prisma.lead.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(lead)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to update lead:', error)
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    )
  }
}
