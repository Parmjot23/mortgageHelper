import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  type: z.enum(['CALL', 'EMAIL', 'DOCS_CHASE', 'OTHER']).optional().default('OTHER'),
  dueAt: z.string().datetime().optional().nullable(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = createTaskSchema.parse(body)

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

    const task = await prisma.task.create({
      data: {
        leadId: params.id,
        title: validatedData.title,
        type: validatedData.type,
        dueAt: validatedData.dueAt ? new Date(validatedData.dueAt) : null,
        status: 'OPEN',
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to create task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
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
    const tasks = await prisma.task.findMany({
      where: { leadId: id },
      orderBy: [
        { status: 'asc' },
        { dueAt: 'asc' },
        { createdAt: 'desc' }
      ],
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}
