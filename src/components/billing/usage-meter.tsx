'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { TrendingUp, Zap } from 'lucide-react'
import type { UsageStats } from '@/types/api'

export function UsageMeter() {
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await fetch('/api/usage')
        if (!res.ok) throw new Error('Failed to fetch usage')
        const data = await res.json()
        setUsage(data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchUsage()
  }, [])

  if (loading) {
    return (
      <div className="space-y-2 rounded-lg border bg-card p-4">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    )
  }

  if (error || !usage) return null

  const isUnlimited = usage.repurposesLimit === -1
  const pct = isUnlimited ? 0 : Math.min((usage.repurposesUsed / usage.repurposesLimit) * 100, 100)
  const isWarning = !isUnlimited && pct >= 50 && pct < 80
  const isDanger = !isUnlimited && pct >= 80
  const showUpgrade = !isUnlimited && pct >= 70

  const barColor = isDanger
    ? 'bg-destructive'
    : isWarning
      ? 'bg-yellow-500'
      : 'bg-green-500'

  return (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Monthly Usage</span>
        </div>
        {showUpgrade && (
          <Link
            href="/billing"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Zap className="h-3 w-3" />
            Upgrade
          </Link>
        )}
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn('h-full rounded-full transition-all', barColor)}
          style={{ width: isUnlimited ? '100%' : `${pct}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {isUnlimited ? (
          'Unlimited repurposes'
        ) : (
          <>
            <span
              className={cn(
                'font-medium',
                isDanger ? 'text-destructive' : isWarning ? 'text-yellow-600 dark:text-yellow-400' : 'text-foreground',
              )}
            >
              {usage.repurposesUsed}
            </span>
            {' / '}
            {usage.repurposesLimit} repurposes used this month
          </>
        )}
      </p>
    </div>
  )
}
