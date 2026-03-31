'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Job {
  id: string
  inputType: string
  inputUrl: string | null
  inputContent: string | null
  status: string
  targetPlatforms: string[]
  createdAt: string
  _count: { outputs: number }
}

interface RecentJobsTableProps {
  period: string
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  COMPLETED: 'default',
  PENDING: 'secondary',
  EXTRACTING: 'secondary',
  GENERATING: 'secondary',
  FAILED: 'destructive',
  PARTIALLY_FAILED: 'outline',
}

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: 'Completed',
  PENDING: 'Pending',
  EXTRACTING: 'Extracting',
  GENERATING: 'Generating',
  FAILED: 'Failed',
  PARTIALLY_FAILED: 'Partial',
}

const INPUT_TYPE_LABELS: Record<string, string> = {
  RAW_TEXT: 'Text',
  BLOG_URL: 'Blog URL',
  YOUTUBE_URL: 'YouTube',
  AUDIO_UPLOAD: 'Audio',
  VIDEO_UPLOAD: 'Video',
}

const PLATFORM_LABELS: Record<string, string> = {
  LINKEDIN: 'LI',
  TWITTER: 'TW',
  INSTAGRAM: 'IG',
  NEWSLETTER: 'NL',
  BLOG: 'BL',
}

const PAGE_SIZE = 10

export function RecentJobsTable({ period }: RecentJobsTableProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setOffset(0)
  }, [period])

  useEffect(() => {
    setLoading(true)
    fetch(`/api/analytics/content?period=${period}&limit=${PAGE_SIZE}&offset=${offset}`)
      .then((r) => r.json())
      .then((d) => {
        setJobs(d.jobs ?? [])
        setTotal(d.total ?? 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [period, offset])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Recent Jobs</CardTitle>
        <span className="text-xs text-muted-foreground">{total} total</span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            No jobs found for this period
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Date</th>
                    <th className="pb-2 pr-4 font-medium">Type</th>
                    <th className="pb-2 pr-4 font-medium">Content</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 pr-4 font-medium">Platforms</th>
                    <th className="pb-2 font-medium">Outputs</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => {
                    const preview = job.inputUrl
                      ? job.inputUrl.slice(0, 40) + (job.inputUrl.length > 40 ? '…' : '')
                      : job.inputContent
                        ? job.inputContent.slice(0, 40) + (job.inputContent.length > 40 ? '…' : '')
                        : '—'
                    return (
                      <tr key={job.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-2 pr-4 whitespace-nowrap text-muted-foreground">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2 pr-4 whitespace-nowrap">
                          {INPUT_TYPE_LABELS[job.inputType] ?? job.inputType}
                        </td>
                        <td className="py-2 pr-4 max-w-[180px] truncate">
                          <Link
                            href={`/repurpose/${job.id}`}
                            className="hover:underline text-foreground"
                          >
                            {preview}
                          </Link>
                        </td>
                        <td className="py-2 pr-4">
                          <Badge variant={STATUS_VARIANTS[job.status] ?? 'secondary'}>
                            {STATUS_LABELS[job.status] ?? job.status}
                          </Badge>
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex gap-1 flex-wrap">
                            {job.targetPlatforms.map((p) => (
                              <span
                                key={p}
                                className="text-xs bg-muted rounded px-1.5 py-0.5 font-medium"
                              >
                                {PLATFORM_LABELS[p] ?? p}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-2 text-muted-foreground">{job._count.outputs}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={offset === 0}
                    onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={offset + PAGE_SIZE >= total}
                    onClick={() => setOffset(offset + PAGE_SIZE)}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
