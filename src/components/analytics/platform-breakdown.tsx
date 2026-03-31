'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PlatformCount {
  platform: string
  count: number
}

interface PlatformBreakdownProps {
  period: string
}

const PLATFORM_COLORS: Record<string, string> = {
  LINKEDIN: 'bg-blue-500',
  TWITTER: 'bg-sky-400',
  INSTAGRAM: 'bg-pink-500',
  NEWSLETTER: 'bg-green-500',
  BLOG: 'bg-orange-500',
}

const PLATFORM_LABELS: Record<string, string> = {
  LINKEDIN: 'LinkedIn',
  TWITTER: 'Twitter / X',
  INSTAGRAM: 'Instagram',
  NEWSLETTER: 'Newsletter',
  BLOG: 'Blog',
}

export function PlatformBreakdown({ period }: PlatformBreakdownProps) {
  const [data, setData] = useState<PlatformCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/analytics/overview?period=${period}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d.repurposesByPlatform ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [period])

  const total = data.reduce((sum, p) => sum + p.count, 0)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Platform Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
            No data for this period
          </div>
        ) : (
          <div className="space-y-3">
            {data
              .sort((a, b) => b.count - a.count)
              .map((item) => {
                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
                const color = PLATFORM_COLORS[item.platform] ?? 'bg-muted-foreground'
                const label = PLATFORM_LABELS[item.platform] ?? item.platform
                return (
                  <div key={item.platform} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{label}</span>
                      <span className="text-muted-foreground">
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`${color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
