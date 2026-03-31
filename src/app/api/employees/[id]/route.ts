import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AiEmployeeRole, Prisma } from '@/generated/prisma/client'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const employee = await prisma.aiEmployee.findUnique({
      where: { id: params.id },
      include: {
        contentPlans: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!employee) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (employee.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error('[GET /api/employees/[id]]', error)
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

    const employee = await prisma.aiEmployee.findUnique({
      where: { id: params.id },
    })

    if (!employee) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (employee.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json() as {
      name?: string
      role?: string
      personality?: Record<string, unknown>
      background?: Record<string, unknown>
      writingStyle?: Record<string, unknown>
      avatarUrl?: string
      isActive?: boolean
    }

    if (body.role) {
      const validRoles = Object.values(AiEmployeeRole)
      if (!validRoles.includes(body.role as AiEmployeeRole)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }
    }

    const updated = await prisma.aiEmployee.update({
      where: { id: params.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.role !== undefined && { role: body.role as AiEmployeeRole }),
        ...(body.personality !== undefined && { personality: body.personality as unknown as Prisma.InputJsonValue }),
        ...(body.background !== undefined && { background: body.background as unknown as Prisma.InputJsonValue }),
        ...(body.writingStyle !== undefined && { writingStyle: body.writingStyle as unknown as Prisma.InputJsonValue }),
        ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PATCH /api/employees/[id]]', error)
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

    const employee = await prisma.aiEmployee.findUnique({
      where: { id: params.id },
    })

    if (!employee) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (employee.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.aiEmployee.delete({ where: { id: params.id } })

    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('[DELETE /api/employees/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
