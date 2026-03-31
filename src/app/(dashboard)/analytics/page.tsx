'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PeriodSelector } from '@/components/analytics/period-selector'
import { OverviewCards } from '@/components/analytics/overview-cards'
import { RepurposeTrendChart } from '@/components/analytics/repurpose-trend-chart'
import { PlatformBreakdown } from '@/components/analytics/platform-breakdown'
import { RecentJobsTable } from '@/components/analytics/recent-jobs-table'
import { Download } from 'lucide-react'

type Period = '7d' | '30d' | '90d'

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30d')

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-sm">Track your content repurposing performance</p>
        </div>
        <div className="flex items-center gap-3">
          <PeriodSelector value={period} onChange={setPeriod} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.location.href = '/api/analytics/export'
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <OverviewCards period={period} />

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <RepurposeTrendChart period={period} />
        </div>
        <div className="col-span-1">
          <PlatformBreakdown period={period} />
        </div>
      </div>

      {/* Recent Jobs */}
      <RecentJobsTable period={period} />
    </div>
  )
}
