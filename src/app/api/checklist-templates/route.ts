import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  leadType: z.enum(['PURCHASE', 'REFINANCE', 'OTHER']),
  items: z.array(z.object({
    label: z.string().min(1, 'Item label is required'),
    required: z.boolean().default(true),
    sortOrder: z.number().default(0),
  })).min(1, 'At least one checklist item is required'),
})

const updateTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').optional(),
  leadType: z.enum(['PURCHASE', 'REFINANCE', 'OTHER']).optional(),
  items: z.array(z.object({
    label: z.string().min(1, 'Item label is required'),
    required: z.boolean().default(true),
    sortOrder: z.number().default(0),
  })).optional(),
})

export async function GET() {
  try {
    const templates = await prisma.checklistTemplate.findMany({
      include: {
        items: true,
        _count: {
          select: { items: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Failed to fetch checklist templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch checklist templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createTemplateSchema.parse(body)

    const template = await prisma.checklistTemplate.create({
      data: {
        name: validatedData.name,
        leadType: validatedData.leadType,
        items: {
          create: validatedData.items,
        },
      },
      include: {
        items: true,
        _count: {
          select: { items: true },
        },
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to create checklist template:', error)
    return NextResponse.json(
      { error: 'Failed to create checklist template' },
      { status: 500 }
    )
  }
}
