'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { JobStatusIndicator } from '@/components/repurpose/job-status-indicator'
import { OutputGrid } from '@/components/repurpose/output-grid'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  ChevronRight,
  Share2,
  AlertCircle,
  RefreshCw,
  Loader2,
  FileText,
} from 'lucide-react'
import type { Output } from '@/components/repurpose/output-card'

type JobStatus = 'PENDING' | 'EXTRACTING' | 'GENERATING' | 'COMPLETED' | 'FAILED' | 'PARTIALLY_FAILED'

interface JobData {
  id: string
  status: JobStatus
  inputType: string
  inputContent?: string | null
  inputUrl?: string | null
  extractedText?: string | null
  targetPlatforms: string[]
  errorMessage?: string | null
  outputs: Output[]
  createdAt: string
}

const POLLING_STATUSES: JobStatus[] = ['PENDING', 'EXTRACTING', 'GENERATING']

export default function RepurposeResultsPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [job, setJob] = useState<JobData | null>(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)

  const fetchJob = useCallback(async () => {
    try {
      const res = await fetch(`/api/repurpose/${jobId}`)
      if (res.status === 404) {
        router.replace('/repurpose')
        return
      }
      if (!res.ok) throw new Error('Failed to fetch job')
      const data: JobData = await res.json()
      setJob(data)
      return data
    } catch {
      // silently fail on poll errors
    }
  }, [jobId, router])

  // Initial load + polling
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    const init = async () => {
      const data = await fetchJob()
      setLoading(false)
      if (data && POLLING_STATUSES.includes(data.status)) {
        interval = setInterval(async () => {
          const updated = await fetchJob()
          if (updated && !POLLING_STATUSES.includes(updated.status)) {
            if (interval) clearInterval(interval)
          }
        }, 2000)
      }
    }

    init()
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [fetchJob])

  const handleOutputUpdate = (updated: Output) => {
    setJob((prev) =>
      prev
        ? { ...prev, outputs: prev.outputs.map((o) => (o.id === updated.id ? updated : o)) }
        : prev,
    )
  }

  const handleRetry = async () => {
    setRetrying(true)
    try {
      const res = await fetch(`/api/repurpose/${jobId}/retry`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Retry failed')
      setJob((prev) => prev ? { ...prev, status: 'PENDING', outputs: [] } : prev)
      toast.success('Job requeued')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Retry failed')
    } finally {
      setRetrying(false)
    }
  }

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard')
  }

  // ---- Loading skeleton ----
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-32 w-full rounded-lg" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!job) return null

  const isProcessing = POLLING_STATUSES.includes(job.status as JobStatus)
  const isFailed = job.status === 'FAILED'
  const isComplete = job.status === 'COMPLETED' || job.status === 'PARTIALLY_FAILED'

  const sourceText = job.extractedText ?? job.inputContent ?? job.inputUrl ?? ''

  return (
    <div className="space-y-6">
      {/* Breadcrumb + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/repurpose" className="hover:text-foreground transition-colors">
            Repurpose
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">Results</span>
        </nav>

        <div className="flex items-center gap-2">
          <Badge
            variant={
              job.status === 'COMPLETED'
                ? 'default'
                : job.status === 'FAILED'
                  ? 'destructive'
                  : 'secondary'
            }
          >
            {job.status.replace('_', ' ')}
          </Badge>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleShare}>
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
        </div>
      </div>

      {/* Processing state */}
      {isProcessing && (
        <div className="space-y-4">
          <JobStatusIndicator
            status={job.status}
            targetPlatforms={job.targetPlatforms}
            completedPlatforms={job.outputs.map((o) => o.platform)}
          />

          {sourceText && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Source Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                  {sourceText}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Failed state */}
      {isFailed && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div>
              <p className="font-semibold">Generation Failed</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {job.errorMessage ?? 'An unexpected error occurred. Please try again.'}
              </p>
            </div>
            <Button onClick={handleRetry} disabled={retrying} className="gap-2">
              {retrying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Completed state */}
      {isComplete && (
        <div className="space-y-4">
          {job.status === 'PARTIALLY_FAILED' && (
            <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
              <CardContent className="flex items-center gap-3 py-3">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  Some platforms failed to generate. The results below are partial.
                </p>
              </CardContent>
            </Card>
          )}

          <OutputGrid outputs={job.outputs} onUpdate={handleOutputUpdate} />
        </div>
      )}
    </div>
  )
}
