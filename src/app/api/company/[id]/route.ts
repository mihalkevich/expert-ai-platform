import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma/client'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const company = await prisma.companyProfile.findUnique({
      where: { id: params.id },
    })

    if (!company) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (company.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('[GET /api/company/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const company = await prisma.companyProfile.findUnique({
      where: { id: params.id },
    })

    if (!company) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (company.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json() as {
      companyName?: string
      industry?: string
      products?: unknown
      brandGuidelines?: string
      complianceRules?: string
      website?: string
    }

    const updated = await prisma.companyProfile.update({
      where: { id: params.id },
      data: {
        ...(body.companyName !== undefined && { companyName: body.companyName }),
        ...(body.industry !== undefined && { industry: body.industry }),
        ...(body.products !== undefined && { products: body.products as unknown as Prisma.InputJsonValue }),
        ...(body.brandGuidelines !== undefined && { brandGuidelines: body.brandGuidelines }),
        ...(body.complianceRules !== undefined && { complianceRules: body.complianceRules }),
        ...(body.website !== undefined && { website: body.website }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PATCH /api/company/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const company = await prisma.companyProfile.findUnique({
      where: { id: params.id },
    })

    if (!company) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (company.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.companyProfile.delete({ where: { id: params.id } })

    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('[DELETE /api/company/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
