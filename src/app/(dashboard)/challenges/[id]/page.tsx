'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChallengeDetail } from '@/components/challenges/challenge-detail'

interface ChallengeDay {
  id: string
  challengeId: string
  dayNumber: number
  topic: string | null
  contentDraft: string | null
  status: string
  publishedAt: Date | string | null
}

interface BacklogItem {
  id: string
  challengeId: string
  title: string
  description: string | null
  kanbanStatus: string
  order: number
}

interface ChallengeDetailData {
  id: string
  name: string
  description: string | null
  duration: number
  status: string
  platforms: string[]
  startDate: Date | string | null
  days: ChallengeDay[]
  backlogItems: BacklogItem[]
}

const STATUS_STYLES: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT: { label: 'Draft', variant: 'secondary' },
  ACTIVE: { label: 'Active', variant: 'default' },
  PAUSED: { label: 'Paused', variant: 'outline' },
  COMPLETED: { label: 'Completed', variant: 'default' },
  ABANDONED: { label: 'Abandoned', variant: 'destructive' },
}

export default function ChallengeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [challenge, setChallenge] = useState<ChallengeDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/challenges/${id}`)
        if (res.status === 404 || res.status === 403) {
          setNotFound(true)
          return
        }
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        setChallenge(data)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (notFound || !challenge) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold">Challenge not found</p>
        <p className="text-muted-foreground text-sm mt-1 mb-4">This challenge may have been deleted.</p>
        <Button asChild variant="outline">
          <Link href="/challenges">Back to Challenges</Link>
        </Button>
      </div>
    )
  }

  const statusConfig = STATUS_STYLES[challenge.status] ?? { label: challenge.status, variant: 'secondary' as const }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button variant="ghost" size="sm" className="gap-1.5 h-7 px-2" onClick={() => router.push('/challenges')}>
          <ChevronLeft className="h-3.5 w-3.5" />
          Challenges
        </Button>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-[200px]">{challenge.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight truncate">{challenge.name}</h1>
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            <Badge variant="outline">{challenge.duration} days</Badge>
          </div>
          {challenge.description && (
            <p className="text-muted-foreground mt-1">{challenge.description}</p>
          )}
        </div>
      </div>

      {/* Detail tabs */}
      <ChallengeDetail
        challenge={challenge}
        onUpdated={(updated) => setChallenge(updated)}
      />
    </div>
  )
}
