import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createChecklistSchema = z.object({
  templateId: z.string(),
  title: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = createChecklistSchema.parse(body)

    // Verify lead exists
    const lead = await prisma.lead.findUnique({
      where: { id },
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Get the template
    const template = await prisma.checklistTemplate.findUnique({
      where: { id: validatedData.templateId },
      include: { items: true },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Create checklist with items
    const checklist = await prisma.checklist.create({
      data: {
        leadId: params.id,
        title: validatedData.title || template.name,
        status: 'OPEN',
        items: {
          create: template.items.map((templateItem) => ({
            label: templateItem.label,
            required: templateItem.required,
            sortOrder: templateItem.sortOrder,
            status: 'PENDING',
          })),
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json(checklist, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to create checklist:', error)
    return NextResponse.json(
      { error: 'Failed to create checklist' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const checklists = await prisma.checklist.findMany({
      where: { leadId: id },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(checklists)
  } catch (error) {
    console.error('Failed to fetch checklists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch checklists' },
      { status: 500 }
    )
  }
}
