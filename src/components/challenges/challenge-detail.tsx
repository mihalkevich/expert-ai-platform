'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Save, Wand2, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChallengeDayList } from './challenge-day-list'
import { ChallengeKanban } from './challenge-kanban'

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

interface ChallengeDetailProps {
  challenge: ChallengeDetailData
  onUpdated?: (updated: ChallengeDetailData) => void
}

const PLATFORMS = [
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'TWITTER', label: 'Twitter' },
  { value: 'INSTAGRAM', label: 'Instagram' },
]

const STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ABANDONED', label: 'Abandoned' },
]

export function ChallengeDetail({ challenge, onUpdated }: ChallengeDetailProps) {
  const [days, setDays] = useState<ChallengeDay[]>(challenge.days)
  const [generating, setGenerating] = useState(false)

  // Settings form state
  const [title, setTitle] = useState(challenge.name)
  const [description, setDescription] = useState(challenge.description ?? '')
  const [status, setStatus] = useState(challenge.status)
  const [startDate, setStartDate] = useState(
    challenge.startDate ? new Date(challenge.startDate).toISOString().split('T')[0] : '',
  )
  const [platforms, setPlatforms] = useState<string[]>(challenge.platforms)
  const [savingSettings, setSavingSettings] = useState(false)

  function togglePlatform(value: string) {
    setPlatforms((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value],
    )
  }

  async function handleSaveSettings() {
    setSavingSettings(true)
    try {
      const res = await fetch(`/api/challenges/${challenge.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || null,
          status,
          startDate: startDate || null,
          platforms,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to save')
      }
      const updated = await res.json()
      toast.success('Settings saved')
      onUpdated?.({ ...challenge, ...updated, days, backlogItems: challenge.backlogItems })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSavingSettings(false)
    }
  }

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch(`/api/challenges/${challenge.id}/generate`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to generate')
      }
      const data = await res.json()
      setDays(data.days ?? [])
      toast.success(`Generated ${data.count} day plan!`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate plan')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Tabs defaultValue="plan">
      <TabsList>
        <TabsTrigger value="plan">Daily Plan</TabsTrigger>
        <TabsTrigger value="backlog">Backlog</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="plan" className="mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {days.length} / {challenge.duration} days planned
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerate}
            disabled={generating}
            className="gap-2"
          >
            {generating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
            ) : (
              <><Wand2 className="h-4 w-4" /> {days.length > 0 ? 'Regenerate Plan' : 'Generate Plan'}</>
            )}
          </Button>
        </div>
        <ChallengeDayList challengeId={challenge.id} days={days} onUpdated={(d) => setDays((prev) => prev.map((p) => (p.id === d.id ? d : p)))} />
      </TabsContent>

      <TabsContent value="backlog" className="mt-4">
        <ChallengeKanban challengeId={challenge.id} items={challenge.backlogItems} />
      </TabsContent>

      <TabsContent value="settings" className="mt-4">
        <div className="max-w-lg space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="settings-title">Title</Label>
            <Input
              id="settings-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="settings-desc">Description</Label>
            <Textarea
              id="settings-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="settings-start">Start Date</Label>
            <Input
              id="settings-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Platforms</Label>
            {PLATFORMS.map((p) => (
              <div key={p.value} className="flex items-center gap-2">
                <Checkbox
                  id={`settings-platform-${p.value}`}
                  checked={platforms.includes(p.value)}
                  onCheckedChange={() => togglePlatform(p.value)}
                />
                <label htmlFor={`settings-platform-${p.value}`} className="text-sm cursor-pointer">
                  {p.label}
                </label>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleSaveSettings} disabled={savingSettings} className="gap-2">
              <Save className="h-4 w-4" />
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </Button>
            <div className="flex gap-1">
              {platforms.map((p) => (
                <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
              ))}
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
