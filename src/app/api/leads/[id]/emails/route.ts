import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const sendEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = sendEmailSchema.parse(body)

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

    // Create email record in database
    const emailMessage = await prisma.emailMessage.create({
      data: {
        leadId: id,
        to: validatedData.to,
        subject: validatedData.subject,
        body: validatedData.body,
        status: 'QUEUED',
      },
    })

    // Send email via Resend
    try {
      const { data, error } = await resend.emails.send({
        from: 'Mortgage Helper <noreply@yourdomain.com>', // Replace with your verified domain
        to: validatedData.to,
        subject: validatedData.subject,
        text: validatedData.body,
      })

      if (error) {
        console.error('Resend error:', error)
        // Update email status to failed
        await prisma.emailMessage.update({
          where: { id: emailMessage.id },
          data: { status: 'FAILED' },
        })
        return NextResponse.json(
          { error: 'Failed to send email' },
          { status: 500 }
        )
      }

      // Update email status to sent
      await prisma.emailMessage.update({
        where: { id: emailMessage.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      })

      return NextResponse.json({
        ...emailMessage,
        status: 'SENT',
        sentAt: new Date().toISOString(),
      }, { status: 201 })

    } catch (sendError) {
      console.error('Email sending error:', sendError)
      // Update email status to failed
      await prisma.emailMessage.update({
        where: { id: emailMessage.id },
        data: { status: 'FAILED' },
      })
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to send email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
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
    const emails = await prisma.emailMessage.findMany({
      where: { leadId: id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(emails)
  } catch (error) {
    console.error('Failed to fetch emails:', error)
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    )
  }
}
