'use client'

import { useEffect, useState } from 'react'
import { Plus, Trophy, Calendar, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ChallengeCard } from '@/components/challenges/challenge-card'
import { ChallengeWizard } from '@/components/challenges/challenge-wizard'
import { ChallengeTemplates } from '@/components/challenges/challenge-templates'

interface ChallengeWithCount {
  id: string
  name: string
  description: string | null
  duration: number
  status: string
  platforms: string[]
  startDate: Date | string | null
  createdAt: Date | string
  _count: { days: number }
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<ChallengeWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [templateValues, setTemplateValues] = useState<{
    title?: string
    description?: string
    duration?: number
    platforms?: string[]
  } | undefined>()

  async function fetchChallenges() {
    try {
      const res = await fetch('/api/challenges')
      if (res.ok) {
        const data = await res.json()
        setChallenges(data)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChallenges()
  }, [])

  function handleUseTemplate(template: { title: string; description: string; duration: number; platforms: string[] }) {
    setTemplateValues(template)
    setWizardOpen(true)
  }

  function handleWizardOpenChange(open: boolean) {
    setWizardOpen(open)
    if (!open) setTemplateValues(undefined)
  }

  const activeChallenges = challenges.filter((c) => c.status === 'ACTIVE').length
  const totalDays = challenges.reduce((sum, c) => sum + c._count.days, 0)
  const completedChallenges = challenges.filter((c) => c.status === 'COMPLETED').length

  const stats = [
    {
      label: 'Active Challenges',
      value: activeChallenges,
      icon: Trophy,
    },
    {
      label: 'Total Days Planned',
      value: totalDays,
      icon: Calendar,
    },
    {
      label: 'Completed',
      value: completedChallenges,
      icon: CheckCircle2,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Challenge Builder</h1>
          <p className="text-muted-foreground">
            Build content challenges and track your daily progress.
          </p>
        </div>
        <Button onClick={() => { setTemplateValues(undefined); setWizardOpen(true) }} className="gap-2">
          <Plus className="h-4 w-4" />
          New Challenge
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="my-challenges">
        <TabsList>
          <TabsTrigger value="my-challenges">My Challenges</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="my-challenges" className="mt-4">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : challenges.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="font-semibold text-lg">No challenges yet</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">
                Start your first content challenge to grow your audience consistently.
              </p>
              <Button onClick={() => setWizardOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                New Challenge
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {challenges.map((c) => (
                <ChallengeCard
                  key={c.id}
                  challenge={c}
                  onDeleted={fetchChallenges}
                  onStatusChanged={fetchChallenges}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <ChallengeTemplates onUseTemplate={handleUseTemplate} />
        </TabsContent>
      </Tabs>

      <ChallengeWizard
        open={wizardOpen}
        onOpenChange={handleWizardOpenChange}
        onCreated={fetchChallenges}
        initialValues={templateValues}
      />
    </div>
  )
}
