'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Repeat2, BarChart3, Share2, Mic, Rss, Zap } from 'lucide-react'

interface OverviewData {
  totalRepurposes: number
  periodRepurposes: number
  totalOutputs: number
  connectedAccounts: number
  voiceProfiles: number
  activeMonitors: number
}

interface OverviewCardsProps {
  period: string
}

const PERIOD_LABEL: Record<string, string> = {
  '7d': '7 Days',
  '30d': '30 Days',
  '90d': '90 Days',
}

export function OverviewCards({ period }: OverviewCardsProps) {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/analytics/overview?period=${period}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [period])

  const cards = [
    {
      title: 'Total Repurposes',
      value: data?.totalRepurposes ?? 0,
      icon: Repeat2,
      description: 'All time',
    },
    {
      title: `This Period`,
      value: data?.periodRepurposes ?? 0,
      icon: BarChart3,
      description: `Last ${PERIOD_LABEL[period] ?? period}`,
    },
    {
      title: 'Total Outputs',
      value: data?.totalOutputs ?? 0,
      icon: Zap,
      description: 'Generated content pieces',
    },
    {
      title: 'Connected Accounts',
      value: data?.connectedAccounts ?? 0,
      icon: Share2,
      description: 'Active social accounts',
    },
    {
      title: 'Voice Profiles',
      value: data?.voiceProfiles ?? 0,
      icon: Mic,
      description: 'Custom voice profiles',
    },
    {
      title: 'Active Monitors',
      value: data?.activeMonitors ?? 0,
      icon: Rss,
      description: 'Topic monitors running',
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
