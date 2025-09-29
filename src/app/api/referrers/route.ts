import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createReferrerSchema = z.object({
  name: z.string().min(1, 'Referrer name is required').max(100, 'Name too long'),
})

export async function GET() {
  try {
    const referrers = await prisma.referrer.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(referrers)
  } catch (error) {
    console.error('Failed to fetch referrers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch referrers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createReferrerSchema.parse(body)

    // Check if referrer already exists
    const existingReferrer = await prisma.referrer.findUnique({
      where: { name: validatedData.name },
    })

    if (existingReferrer) {
      if (!existingReferrer.isActive) {
        // Reactivate the referrer
        const updatedReferrer = await prisma.referrer.update({
          where: { id: existingReferrer.id },
          data: { isActive: true },
        })
        return NextResponse.json(updatedReferrer, { status: 200 })
      } else {
        return NextResponse.json(
          { error: 'Referrer with this name already exists' },
          { status: 409 }
        )
      }
    }

    const referrer = await prisma.referrer.create({
      data: { name: validatedData.name },
    })

    return NextResponse.json(referrer, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to create referrer:', error)
    return NextResponse.json(
      { error: 'Failed to create referrer' },
      { status: 500 }
    )
  }
}
