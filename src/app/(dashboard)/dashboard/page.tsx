import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Wand2,
  Link as LinkIcon,
  Repeat2,
  Calendar,
  Mic,
  BarChart3,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Lightbulb,
} from 'lucide-react'

const JOB_STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType; color: string }> = {
  COMPLETED: { label: 'Completed', variant: 'default', icon: CheckCircle2, color: 'text-green-600' },
  PENDING: { label: 'Pending', variant: 'secondary', icon: Clock, color: 'text-muted-foreground' },
  EXTRACTING: { label: 'Extracting', variant: 'secondary', icon: Loader2, color: 'text-blue-500' },
  GENERATING: { label: 'Generating', variant: 'secondary', icon: Loader2, color: 'text-blue-500' },
  FAILED: { label: 'Failed', variant: 'destructive', icon: AlertCircle, color: 'text-destructive' },
  PARTIALLY_FAILED: { label: 'Partial', variant: 'outline', icon: AlertCircle, color: 'text-yellow-600' },
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id
  const userName = session?.user?.name?.split(' ')[0] ?? 'there'

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [totalRepurposes, thisMonthCount, connectedAccountsCount, recentJobs] = await Promise.all([
    prisma.repurposeJob.count({ where: { userId } }),
    prisma.repurposeJob.count({
      where: { userId, createdAt: { gte: startOfMonth } },
    }),
    prisma.socialAccount.count({ where: { userId, isActive: true } }),
    prisma.repurposeJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        status: true,
        inputType: true,
        inputContent: true,
        inputUrl: true,
        targetPlatforms: true,
        createdAt: true,
      },
    }),
  ])

  const monthLabel = now.toLocaleString('en-US', { month: 'long', year: 'numeric' })

  const statCards = [
    {
      title: 'Total Repurposes',
      value: totalRepurposes.toString(),
      description: 'All-time content repurposed',
      icon: Repeat2,
    },
    {
      title: 'This Month',
      value: thisMonthCount.toString(),
      description: `Repurposes in ${monthLabel}`,
      icon: Calendar,
    },
    {
      title: 'Connected Accounts',
      value: connectedAccountsCount.toString(),
      description: 'Active social platforms',
      icon: LinkIcon,
    },
    {
      title: 'Voice Profiles',
      value: (await prisma.voiceProfile.count({ where: { userId } })).toString(),
      description: 'Custom writing styles',
      icon: Mic,
    },
  ]

  const isNewUser = totalRepurposes === 0

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {getGreeting()}, {userName}!
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your content performance.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/repurpose">
              <Wand2 className="mr-2 h-4 w-4" />
              New Repurpose
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/accounts">
              <LinkIcon className="mr-2 h-4 w-4" />
              Connect Account
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions + Recent Jobs */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/repurpose">
                <Wand2 className="mr-2 h-4 w-4" />
                Repurpose content
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/accounts">
                <LinkIcon className="mr-2 h-4 w-4" />
                Connect a platform
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/voice/new">
                <Mic className="mr-2 h-4 w-4" />
                Create voice profile
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                View analytics
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Repurpose Jobs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Repurposes</CardTitle>
                <CardDescription>Your last 5 repurpose jobs</CardDescription>
              </div>
              {recentJobs.length > 0 && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/history">View all</Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {recentJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Wand2 className="mb-3 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm font-medium">No repurposes yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Start by repurposing your first piece of content.
                </p>
                <Button asChild size="sm" className="mt-4">
                  <Link href="/repurpose">
                    <Wand2 className="mr-2 h-3.5 w-3.5" />
                    Get Started
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job) => {
                  const config = JOB_STATUS_CONFIG[job.status as string] ?? JOB_STATUS_CONFIG.PENDING
                  const StatusIcon = config.icon
                  const preview =
                    job.inputContent
                      ? job.inputContent.slice(0, 60) + (job.inputContent.length > 60 ? '…' : '')
                      : job.inputUrl
                        ? job.inputUrl
                        : job.inputType

                  return (
                    <div key={job.id} className="flex items-start gap-3 rounded-lg border p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <StatusIcon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium">{preview}</p>
                          <Badge variant={config.variant} className="shrink-0 text-xs">
                            {config.label}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {job.targetPlatforms.join(', ')} &mdash;{' '}
                          {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New user tips */}
      {isNewUser && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Getting Started Tips</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">1</span>
                <span>
                  <strong>Create a voice profile</strong> — teach the AI how you write so your content sounds authentically you.{' '}
                  <Link href="/voice/new" className="text-primary underline">
                    Create now
                  </Link>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">2</span>
                <span>
                  <strong>Connect a social account</strong> — link LinkedIn, X, or Instagram to publish directly from the platform.{' '}
                  <Link href="/accounts" className="text-primary underline">
                    Connect now
                  </Link>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">3</span>
                <span>
                  <strong>Repurpose your first piece</strong> — paste an article, video transcript, or podcast and generate posts for multiple platforms.{' '}
                  <Link href="/repurpose" className="text-primary underline">
                    Start repurposing
                  </Link>
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
