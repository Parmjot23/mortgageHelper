import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
