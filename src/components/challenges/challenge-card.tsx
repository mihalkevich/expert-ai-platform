'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Trash2, Eye, Play, Pause, Calendar, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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

interface ChallengeCardProps {
  challenge: ChallengeWithCount
  onDeleted?: () => void
  onStatusChanged?: () => void
}

const STATUS_STYLES: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT: { label: 'Draft', variant: 'secondary' },
  ACTIVE: { label: 'Active', variant: 'default' },
  PAUSED: { label: 'Paused', variant: 'outline' },
  COMPLETED: { label: 'Completed', variant: 'default' },
  ABANDONED: { label: 'Abandoned', variant: 'destructive' },
}

const PLATFORM_LABELS: Record<string, string> = {
  LINKEDIN: 'LinkedIn',
  TWITTER: 'Twitter',
  INSTAGRAM: 'Instagram',
  NEWSLETTER: 'Newsletter',
  BLOG: 'Blog',
}

export function ChallengeCard({ challenge, onDeleted, onStatusChanged }: ChallengeCardProps) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [updating, setUpdating] = useState(false)

  const statusConfig = STATUS_STYLES[challenge.status] ?? { label: challenge.status, variant: 'secondary' as const }
  const totalDays = challenge.duration
  const plannedDays = challenge._count.days

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/challenges/${challenge.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Challenge deleted')
      setDeleteOpen(false)
      onDeleted?.()
    } catch {
      toast.error('Failed to delete challenge')
    } finally {
      setDeleting(false)
    }
  }

  async function handleToggleStatus() {
    const newStatus = challenge.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    setUpdating(true)
    try {
      const res = await fetch(`/api/challenges/${challenge.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update')
      toast.success(`Challenge ${newStatus === 'ACTIVE' ? 'activated' : 'paused'}`)
      onStatusChanged?.()
    } catch {
      toast.error('Failed to update challenge')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{challenge.name}</h3>
              {challenge.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{challenge.description}</p>
              )}
            </div>
            <Badge variant={statusConfig.variant} className="shrink-0">
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-4">
          {/* Badges row */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-xs">
              {challenge.duration} days
            </Badge>
            {challenge.platforms.map((p) => (
              <Badge key={p} variant="secondary" className="text-xs">
                {PLATFORM_LABELS[p] ?? p}
              </Badge>
            ))}
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{plannedDays} / {totalDays} days planned</span>
              <span>{Math.round((plannedDays / totalDays) * 100)}%</span>
            </div>
            <Progress value={(plannedDays / totalDays) * 100} className="h-1.5" />
          </div>

          {/* Date */}
          {challenge.startDate && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Started {format(new Date(challenge.startDate), 'MMM d, yyyy')}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Created {format(new Date(challenge.createdAt), 'MMM d, yyyy')}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto pt-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={() => router.push(`/challenges/${challenge.id}`)}
            >
              <Eye className="h-3.5 w-3.5" />
              View
            </Button>

            {(challenge.status === 'ACTIVE' || challenge.status === 'DRAFT' || challenge.status === 'PAUSED') && (
              <Button
                size="sm"
                variant={challenge.status === 'ACTIVE' ? 'outline' : 'default'}
                className="flex-1 gap-1.5"
                onClick={handleToggleStatus}
                disabled={updating}
              >
                {challenge.status === 'ACTIVE' ? (
                  <><Pause className="h-3.5 w-3.5" /> Pause</>
                ) : (
                  <><Play className="h-3.5 w-3.5" /> Activate</>
                )}
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Challenge</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{challenge.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
