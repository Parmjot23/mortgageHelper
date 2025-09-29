import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateReferrerSchema = z.object({
  name: z.string().min(1, 'Referrer name is required').max(100, 'Name too long').optional(),
  isActive: z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateReferrerSchema.parse(body)

    const referrer = await prisma.referrer.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(referrer)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to update referrer:', error)
    return NextResponse.json(
      { error: 'Failed to update referrer' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Soft delete by setting isActive to false
    const referrer = await prisma.referrer.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ message: 'Referrer deactivated successfully' })
  } catch (error) {
    console.error('Failed to delete referrer:', error)
    return NextResponse.json(
      { error: 'Failed to delete referrer' },
      { status: 500 }
    )
  }
}
