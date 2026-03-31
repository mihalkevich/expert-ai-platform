import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AiEmployeeRole, Prisma } from '@/generated/prisma/client'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const company = await prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!company) {
      return NextResponse.json([])
    }

    const employees = await prisma.aiEmployee.findMany({
      where: { userId: session.user.id },
      include: {
        _count: { select: { contentPlans: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(employees)
  } catch (error) {
    console.error('[GET /api/employees]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const company = await prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!company) {
      return NextResponse.json({ error: 'Company profile required' }, { status: 400 })
    }

    const body = await request.json() as {
      name: string
      role: string
      personality?: Record<string, unknown>
      background?: Record<string, unknown>
      writingStyle?: Record<string, unknown>
      avatarUrl?: string
    }

    if (!body.name || !body.role) {
      return NextResponse.json({ error: 'name and role are required' }, { status: 400 })
    }

    const validRoles = Object.values(AiEmployeeRole)
    if (!validRoles.includes(body.role as AiEmployeeRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const employee = await prisma.aiEmployee.create({
      data: {
        userId: session.user.id,
        companyProfileId: company.id,
        name: body.name,
        role: body.role as AiEmployeeRole,
        personality: (body.personality ?? {}) as unknown as Prisma.InputJsonValue,
        background: (body.background ?? {}) as unknown as Prisma.InputJsonValue,
        writingStyle: (body.writingStyle ?? {}) as unknown as Prisma.InputJsonValue,
        avatarUrl: body.avatarUrl ?? null,
      },
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error('[POST /api/employees]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
