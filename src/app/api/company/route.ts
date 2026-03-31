import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma/client'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const company = await prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error('[GET /api/company]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as {
      companyName: string
      industry?: string
      products?: unknown
      brandGuidelines?: string
      complianceRules?: string
      website?: string
    }

    if (!body.companyName) {
      return NextResponse.json({ error: 'companyName is required' }, { status: 400 })
    }

    const existing = await prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (existing) {
      return NextResponse.json({ error: 'Company profile already exists' }, { status: 409 })
    }

    const company = await prisma.companyProfile.create({
      data: {
        userId: session.user.id,
        companyName: body.companyName,
        industry: body.industry ?? null,
        products: (body.products ?? []) as unknown as Prisma.InputJsonValue,
        brandGuidelines: body.brandGuidelines ?? null,
        complianceRules: body.complianceRules ?? null,
        website: body.website ?? null,
      },
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error('[POST /api/company]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
