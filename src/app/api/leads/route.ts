import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createLeadSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  source: z.string().optional(),
  leadType: z.enum(['PURCHASE', 'REFINANCE', 'RENEWAL', 'EQUITY_LINE', 'OTHER']).optional().default('PURCHASE'),
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
        source: validatedData.source || null,
        leadType: validatedData.leadType,
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

    const includeOptions: any = {}

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

    const leads = await prisma.lead.findMany({
      ...(Object.keys(includeOptions).length > 0 ? { include: includeOptions } : {}),
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
