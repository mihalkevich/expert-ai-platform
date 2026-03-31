import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const jobs = await prisma.repurposeJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        inputType: true,
        inputUrl: true,
        status: true,
        targetPlatforms: true,
        createdAt: true,
        _count: {
          select: { outputs: true },
        },
      },
    })

    const header = 'Date,InputType,InputUrl,Status,Platforms,OutputCount'
    const rows = jobs.map((job) => {
      const date = job.createdAt.toISOString().split('T')[0]
      const inputUrl = job.inputUrl ? `"${job.inputUrl.replace(/"/g, '""')}"` : ''
      const platforms = `"${job.targetPlatforms.join('|')}"`
      return `${date},${job.inputType},${inputUrl},${job.status},${platforms},${job._count.outputs}`
    })

    const csv = [header, ...rows].join('\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="analytics-export.csv"',
      },
    })
  } catch (error) {
    console.error('[GET /api/analytics/export]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
