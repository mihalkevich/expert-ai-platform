import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    })

    if (!employee) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (employee.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const plans = await prisma.employeeContentPlan.findMany({
      where: { aiEmployeeId: params.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(plans)
  } catch (error) {
    console.error('[GET /api/employees/[id]/content-plans]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
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
      planId: string
      status: string
    }

    if (!body.planId || !body.status) {
      return NextResponse.json({ error: 'planId and status are required' }, { status: 400 })
    }

    const plan = await prisma.employeeContentPlan.findUnique({
      where: { id: body.planId },
    })

    if (!plan || plan.aiEmployeeId !== params.id) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const updated = await prisma.employeeContentPlan.update({
      where: { id: body.planId },
      data: { status: body.status },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[POST /api/employees/[id]/content-plans]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
