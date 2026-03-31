'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Check, SkipForward, Edit2, X, Save } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'

interface ChallengeDay {
  id: string
  challengeId: string
  dayNumber: number
  topic: string | null
  contentDraft: string | null
  status: string
  publishedAt: Date | string | null
}

interface ChallengeDayListProps {
  challengeId: string
  days: ChallengeDay[]
  onUpdated?: (updatedDay: ChallengeDay) => void
}

const STATUS_STYLES: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'Pending', variant: 'secondary' },
  DRAFTED: { label: 'Drafted', variant: 'outline' },
  PUBLISHED: { label: 'Published', variant: 'default' },
  SKIPPED: { label: 'Skipped', variant: 'destructive' },
}

interface DayCardProps {
  day: ChallengeDay
  challengeId: string
  onUpdated: (updated: ChallengeDay) => void
}

function DayCard({ day, challengeId, onUpdated }: DayCardProps) {
  const [editing, setEditing] = useState(false)
  const [topic, setTopic] = useState(day.topic ?? '')
  const [contentDraft, setContentDraft] = useState(day.contentDraft ?? '')
  const [saving, setSaving] = useState(false)

  const statusConfig = STATUS_STYLES[day.status] ?? { label: day.status, variant: 'secondary' as const }

  async function patchDay(data: Record<string, unknown>) {
    const res = await fetch(`/api/challenges/${challengeId}/days/${day.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const body = await res.json()
      throw new Error(body.error ?? 'Failed to update')
    }
    return res.json() as Promise<ChallengeDay>
  }

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await patchDay({ topic, contentDraft })
      onUpdated(updated)
      setEditing(false)
      toast.success('Day updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleMarkPublished() {
    try {
      const updated = await patchDay({ status: 'PUBLISHED', publishedAt: new Date().toISOString() })
      onUpdated(updated)
      toast.success('Marked as published')
    } catch {
      toast.error('Failed to update status')
    }
  }

  async function handleSkip() {
    try {
      const updated = await patchDay({ status: 'SKIPPED' })
      onUpdated(updated)
      toast.success('Day skipped')
    } catch {
      toast.error('Failed to skip day')
    }
  }

  function cancelEdit() {
    setTopic(day.topic ?? '')
    setContentDraft(day.contentDraft ?? '')
    setEditing(false)
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Badge variant="outline" className="shrink-0 font-mono">
            D{day.dayNumber}
          </Badge>

          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2">
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Day topic"
                  className="text-sm"
                />
                <Textarea
                  value={contentDraft}
                  onChange={(e) => setContentDraft(e.target.value)}
                  placeholder="Content draft..."
                  rows={3}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1">
                    <Save className="h-3.5 w-3.5" />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEdit} className="gap-1">
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{day.topic ?? 'No topic set'}</p>
                  <Badge variant={statusConfig.variant} className="text-xs">
                    {statusConfig.label}
                  </Badge>
                </div>
                {day.contentDraft && (
                  <p className="text-xs text-muted-foreground line-clamp-3">{day.contentDraft}</p>
                )}
              </div>
            )}
          </div>

          {!editing && (
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => setEditing(true)}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>

              {(day.status === 'PENDING' || day.status === 'DRAFTED') && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-green-600 hover:text-green-600 hover:bg-green-50"
                  onClick={handleMarkPublished}
                  title="Mark as Published"
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
              )}

              {day.status === 'PENDING' && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-muted-foreground"
                  onClick={handleSkip}
                  title="Skip"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function ChallengeDayList({ challengeId, days: initialDays, onUpdated }: ChallengeDayListProps) {
  const [days, setDays] = useState<ChallengeDay[]>(initialDays)

  function handleDayUpdated(updated: ChallengeDay) {
    setDays((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
    onUpdated?.(updated)
  }

  if (days.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">No days generated yet. Use the Generate Plan feature to create your challenge plan.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {days.map((day) => (
        <DayCard key={day.id} day={day} challengeId={challengeId} onUpdated={handleDayUpdated} />
      ))}
    </div>
  )
}
