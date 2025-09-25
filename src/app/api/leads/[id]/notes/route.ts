import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createNoteSchema = z.object({
  body: z.string().min(1, 'Note body is required'),
  pinned: z.boolean().optional().default(false),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = createNoteSchema.parse(body)

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

    const note = await prisma.note.create({
      data: {
        leadId: id,
        body: validatedData.body,
        pinned: validatedData.pinned,
      },
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to create note:', error)
    return NextResponse.json(
      { error: 'Failed to create note' },
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
    const notes = await prisma.note.findMany({
      where: { leadId: id },
      orderBy: [
        { pinned: 'desc' },
        { createdAt: 'desc' }
      ],
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Failed to fetch notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}
