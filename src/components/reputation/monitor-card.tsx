'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Trash2, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface TopicMonitor {
  id: string
  name: string
  keywords: string[]
  niche: string | null
  commentTone: string | null
  isActive: boolean
  createdAt: string
  _count?: { monitoredPosts: number }
}

interface MonitorCardProps {
  monitor: TopicMonitor
  onViewPosts: (monitorId: string) => void
  onDeleted: () => void
  onUpdated: () => void
}

const toneLabelMap: Record<string, string> = {
  helpful: 'Helpful',
  provocative: 'Provocative',
  educational: 'Educational',
}

export function MonitorCard({ monitor, onViewPosts, onDeleted, onUpdated }: MonitorCardProps) {
  const [isActive, setIsActive] = useState(monitor.isActive)
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleToggle(value: boolean) {
    setToggling(true)
    try {
      const res = await fetch(`/api/reputation/monitors/${monitor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: value }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setIsActive(value)
      onUpdated()
    } catch {
      toast.error('Failed to update monitor')
    } finally {
      setToggling(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    try {
      const res = await fetch(`/api/reputation/monitors/${monitor.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Monitor deleted')
      onDeleted()
    } catch {
      toast.error('Failed to delete monitor')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold leading-tight">{monitor.name}</p>
            {monitor.niche && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{monitor.niche}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Switch
              checked={isActive}
              onCheckedChange={handleToggle}
              disabled={toggling}
              className="scale-90"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        {/* Keywords */}
        <div className="flex flex-wrap gap-1">
          {monitor.keywords.map((kw) => (
            <Badge key={kw} variant="outline" className="text-xs">
              {kw}
            </Badge>
          ))}
        </div>

        {/* Tone + status badges */}
        <div className="flex flex-wrap gap-2">
          {monitor.commentTone && (
            <Badge variant="secondary" className="text-xs">
              {toneLabelMap[monitor.commentTone] ?? monitor.commentTone}
            </Badge>
          )}
          <Badge variant={isActive ? 'default' : 'outline'} className="text-xs">
            {isActive ? 'Active' : 'Paused'}
          </Badge>
        </div>

        {/* Stats */}
        <p className="text-xs text-muted-foreground">
          {monitor._count?.monitoredPosts ?? 0} posts found
        </p>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 pt-2">
          <Button
            size="sm"
            variant="secondary"
            className="flex-1 gap-1"
            onClick={() => onViewPosts(monitor.id)}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Posts
          </Button>
          <Button
            size="sm"
            variant={confirmDelete ? 'destructive' : 'ghost'}
            className="gap-1"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            {confirmDelete ? 'Confirm?' : ''}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
