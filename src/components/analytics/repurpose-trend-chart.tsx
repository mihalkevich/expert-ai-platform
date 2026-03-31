'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface TrendPoint {
  date: string
  count: number
}

interface RepurposeTrendChartProps {
  period: string
}

export function RepurposeTrendChart({ period }: RepurposeTrendChartProps) {
  const [data, setData] = useState<TrendPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/analytics/overview?period=${period}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d.repurposeTrend ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [period])

  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Repurpose Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-48 bg-muted animate-pulse rounded" />
        ) : data.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            No data for this period
          </div>
        ) : (
          <div>
            {/* Recharts LineChart */}
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val: string) => {
                    const d = new Date(val)
                    return `${d.getMonth() + 1}/${d.getDate()}`
                  }}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  labelFormatter={(label) =>
                    typeof label === 'string' ? new Date(label).toLocaleDateString() : String(label)
                  }
                  formatter={(value) => [value, 'Repurposes']}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Fallback CSS bar chart (hidden when recharts renders) */}
            <noscript>
              <div className="flex items-end gap-1 h-32 mt-4">
                {data.map((point) => (
                  <div key={point.date} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-primary rounded-t"
                      style={{ height: `${(point.count / maxCount) * 100}%` }}
                    />
                    <span className="text-xs text-muted-foreground rotate-45 origin-left">
                      {point.date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            </noscript>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
