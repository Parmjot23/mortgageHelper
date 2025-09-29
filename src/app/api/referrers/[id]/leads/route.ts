import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)

    // Get filter parameters
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search')

    // Build where conditions
    const whereConditions: any = {
      referrerId: id,
    }

    // Add status filter
    if (status && status !== 'all') {
      whereConditions.applicationStatus = status
    }

    // Add date range filter
    if (startDate || endDate) {
      whereConditions.createdAt = {}
      if (startDate) {
        whereConditions.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        whereConditions.createdAt.lte = new Date(endDate)
      }
    }

    // Add search filter (searches in firstName, lastName, email, phone)
    if (search) {
      whereConditions.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ]
    }

    const leads = await prisma.lead.findMany({
      where: whereConditions,
      include: {
        referrer: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get referrer info
    const referrer = await prisma.referrer.findUnique({
      where: { id },
    })

    if (!referrer) {
      return NextResponse.json(
        { error: 'Referrer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      referrer,
      leads,
      totalCount: leads.length,
    })
  } catch (error) {
    console.error('Failed to fetch referrer leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch referrer leads' },
      { status: 500 }
    )
  }
}
