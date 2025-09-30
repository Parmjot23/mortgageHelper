import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').optional(),
  leadType: z.enum(['PURCHASE', 'REFINANCE', 'OTHER']).optional(),
  items: z.array(z.object({
    label: z.string().min(1, 'Item label is required'),
    required: z.boolean().default(true),
    sortOrder: z.number().default(0),
  })).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateTemplateSchema.parse(body)

    // Start a transaction to update template and items
    const result = await prisma.$transaction(async (tx) => {
      // Update the template
      const updateData: any = {}
      if (validatedData.name !== undefined) updateData.name = validatedData.name
      if (validatedData.leadType !== undefined) updateData.leadType = validatedData.leadType

      const template = await tx.checklistTemplate.update({
        where: { id },
        data: updateData,
      })

      // If items are provided, replace all items
      if (validatedData.items !== undefined) {
        // Delete existing items
        await tx.checklistItemTemplate.deleteMany({
          where: { templateId: id },
        })

        // Create new items
        if (validatedData.items.length > 0) {
          await tx.checklistItemTemplate.createMany({
            data: validatedData.items.map((item, index) => ({
              templateId: id,
              label: item.label,
              required: item.required,
              sortOrder: item.sortOrder !== undefined ? item.sortOrder : index,
            })),
          })
        }
      }

      // Return updated template with items
      return await tx.checklistTemplate.findUnique({
        where: { id },
        include: {
          items: true,
          _count: {
            select: { items: true },
          },
        },
      })
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to update checklist template:', error)
    return NextResponse.json(
      { error: 'Failed to update checklist template' },
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

    // Delete the template (Prisma will cascade delete the items due to foreign key constraints)
    await prisma.checklistTemplate.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Checklist template deleted successfully' })
  } catch (error) {
    console.error('Failed to delete checklist template:', error)
    return NextResponse.json(
      { error: 'Failed to delete checklist template' },
      { status: 500 }
    )
  }
}
