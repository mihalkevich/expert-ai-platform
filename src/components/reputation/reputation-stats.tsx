'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageSquare, Heart, Users, TrendingUp } from 'lucide-react'

interface ReputationTotals {
  commentsPosted: number
  mentionsReceived: number
  newFollowers: number
  avgSentiment: number
}

interface StatsData {
  totals: ReputationTotals
}

export function ReputationStats() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/reputation/metrics')
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load metrics')
        setLoading(false)
      })
  }, [])

  const stats = [
    {
      label: 'Comments Posted',
      value: data?.totals.commentsPosted ?? 0,
      icon: MessageSquare,
      description: 'Last 30 days',
    },
    {
      label: 'Mentions Received',
      value: data?.totals.mentionsReceived ?? 0,
      icon: Heart,
      description: 'Last 30 days',
    },
    {
      label: 'New Followers',
      value: data?.totals.newFollowers ?? 0,
      icon: Users,
      description: 'Last 30 days',
    },
    {
      label: 'Avg Sentiment',
      value: data ? `${Math.round(data.totals.avgSentiment * 100)}%` : '0%',
      icon: TrendingUp,
      description: 'Positive sentiment score',
    },
  ]

  if (error) {
    return (
      <p className="text-sm text-destructive">{error}</p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <p className="text-2xl font-bold">{stat.value}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
