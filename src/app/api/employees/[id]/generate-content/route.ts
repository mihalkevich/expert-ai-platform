import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAIProvider } from '@/services/ai/factory'
import { Platform } from '@/generated/prisma/client'

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
      include: { companyProfile: true },
    })

    if (!employee) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (employee.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json() as {
      platform: string
      topic: string
    }

    if (!body.platform || !body.topic) {
      return NextResponse.json({ error: 'platform and topic are required' }, { status: 400 })
    }

    const validPlatforms = Object.values(Platform)
    if (!validPlatforms.includes(body.platform as Platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
    }

    const companyName = employee.companyProfile?.companyName ?? 'the company'
    const personality = employee.personality as Record<string, unknown>
    const writingStyle = employee.writingStyle as Record<string, unknown>

    const personalityStr = Object.entries(personality)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ')

    const writingStyleStr = Object.entries(writingStyle)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ')

    const systemPrompt = `You are ${employee.name}, a ${employee.role} at ${companyName}. Your personality: ${personalityStr || 'professional and engaging'}. Writing style: ${writingStyleStr || 'clear and concise'}. Generate content that feels authentic and personal.`

    const userPrompt = `Generate an engaging ${body.platform} post about ${body.topic}. Write in your unique voice. Keep it appropriate for ${body.platform} format and audience.`

    const provider = getAIProvider()
    const result = await provider.generateContent({
      systemPrompt,
      userPrompt,
      maxTokens: 500,
    })

    const plan = await prisma.employeeContentPlan.create({
      data: {
        aiEmployeeId: params.id,
        title: `${body.platform} post about ${body.topic}`,
        content: result.content,
        platform: body.platform as Platform,
        status: 'DRAFT',
      },
    })

    return NextResponse.json({ content: result.content, planId: plan.id }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/employees/[id]/generate-content]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
