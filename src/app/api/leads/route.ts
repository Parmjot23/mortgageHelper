import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createLeadSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  sourceType: z.enum(['BANK', 'ONLINE', 'SELF_SOURCE', 'OTHER']).optional().default('OTHER'),
  referrerId: z.string().optional(),
  leadType: z.enum(['PURCHASE', 'REFINANCE', 'OTHER']).optional().default('PURCHASE'),
  applicationStatus: z.enum(['NOT_CONTACTED', 'CONTACTED', 'IN_PROGRESS', 'CONDITIONAL_APPROVED', 'APPROVED']).optional().default('NOT_CONTACTED'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createLeadSchema.parse(body)

    const lead = await prisma.lead.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        sourceType: validatedData.sourceType,
        referrerId: validatedData.referrerId || null,
        leadType: validatedData.leadType,
        applicationStatus: validatedData.applicationStatus,
        stage: 'NEW',
      },
    })

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to create lead:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeParam = searchParams.get('include')
    const statusParam = searchParams.get('status')

    const includeOptions: any = {}
    const whereOptions: any = {}

    if (includeParam) {
      const includes = includeParam.split(',')
      if (includes.includes('tasks')) {
        includeOptions.tasks = {
          where: { status: 'OPEN' },
          orderBy: { dueAt: 'asc' },
          take: 3,
        }
      }
      if (includes.includes('checklists')) {
        includeOptions.checklists = {
          include: {
            items: true,
          },
        }
      }
      if (includes.includes('notes')) {
        includeOptions.notes = {
          orderBy: { createdAt: 'desc' },
          take: 2,
        }
      }
    }

    if (statusParam) {
      whereOptions.applicationStatus = statusParam
    }

    const leads = await prisma.lead.findMany({
      ...(Object.keys(includeOptions).length > 0 ? { include: { ...includeOptions, referrer: true } } : { include: { referrer: true } }),
      ...(Object.keys(whereOptions).length > 0 ? { where: whereOptions } : {}),
      orderBy: { updatedAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(leads)
  } catch (error) {
    console.error('Failed to fetch leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}
