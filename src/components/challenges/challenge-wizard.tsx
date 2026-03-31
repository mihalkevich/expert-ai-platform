'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Wand2, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface WizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
  initialValues?: {
    title?: string
    description?: string
    duration?: number
    platforms?: string[]
  }
}

interface GeneratedDay {
  id: string
  dayNumber: number
  topic: string | null
  contentDraft: string | null
}

const PLATFORMS = [
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'TWITTER', label: 'Twitter' },
  { value: 'INSTAGRAM', label: 'Instagram' },
]

const STEPS = ['Basics', 'AI Generation', 'Confirm']

export function ChallengeWizard({ open, onOpenChange, onCreated, initialValues }: WizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [duration, setDuration] = useState<number>(initialValues?.duration ?? 30)
  const [platforms, setPlatforms] = useState<string[]>(initialValues?.platforms ?? ['LINKEDIN'])
  const [generating, setGenerating] = useState(false)
  const [creating, setCreating] = useState(false)
  const [generatedDays, setGeneratedDays] = useState<GeneratedDay[]>([])
  const [challengeId, setChallengeId] = useState<string | null>(null)

  function reset() {
    setStep(0)
    setTitle(initialValues?.title ?? '')
    setDescription(initialValues?.description ?? '')
    setDuration(initialValues?.duration ?? 30)
    setPlatforms(initialValues?.platforms ?? ['LINKEDIN'])
    setGenerating(false)
    setCreating(false)
    setGeneratedDays([])
    setChallengeId(null)
  }

  function handleClose(val: boolean) {
    if (!val) reset()
    onOpenChange(val)
  }

  function togglePlatform(value: string) {
    setPlatforms((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value],
    )
  }

  async function handleCreateChallenge() {
    setCreating(true)
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, duration, platforms }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create challenge')
      setChallengeId(data.id)
      setStep(1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create challenge')
    } finally {
      setCreating(false)
    }
  }

  async function handleGenerate() {
    if (!challengeId) return
    setGenerating(true)
    try {
      const res = await fetch(`/api/challenges/${challengeId}/generate`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate')
      setGeneratedDays(data.days ?? [])
      toast.success('Plan generated!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate plan')
    } finally {
      setGenerating(false)
    }
  }

  async function handleFinish() {
    if (!challengeId) return
    toast.success('Challenge created!')
    handleClose(false)
    onCreated?.()
    router.push(`/challenges/${challengeId}`)
  }

  const canProceedStep0 = title.trim().length > 0 && platforms.length > 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>New Challenge</DialogTitle>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-1 text-sm">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  i < step
                    ? 'bg-primary text-primary-foreground'
                    : i === step
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span className={i === step ? 'font-medium' : 'text-muted-foreground'}>{s}</span>
              {i < STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex-1 overflow-y-auto">
          {/* Step 0: Basics */}
          {step === 0 && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="title">Challenge Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. 30 Days of LinkedIn Content"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What is this challenge about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Duration</Label>
                <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Platforms</Label>
                {PLATFORMS.map((p) => (
                  <div key={p.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`platform-${p.value}`}
                      checked={platforms.includes(p.value)}
                      onCheckedChange={() => togglePlatform(p.value)}
                    />
                    <label htmlFor={`platform-${p.value}`} className="text-sm cursor-pointer">
                      {p.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: AI Generation */}
          {step === 1 && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                Use AI to generate a full {duration}-day content plan for &quot;{title}&quot;.
              </p>

              <Button
                className="w-full gap-2"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Generating plan...</>
                ) : (
                  <><Wand2 className="h-4 w-4" /> Generate Plan</>
                )}
              </Button>

              {generatedDays.length > 0 && (
                <ScrollArea className="h-60 rounded border">
                  <div className="p-3 space-y-2">
                    {generatedDays.map((day) => (
                      <div key={day.id} className="rounded-md bg-muted/50 p-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            Day {day.dayNumber}
                          </Badge>
                          <span className="text-sm font-medium">{day.topic}</span>
                        </div>
                        {day.contentDraft && (
                          <p className="text-xs text-muted-foreground">{day.contentDraft}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}

          {/* Step 2: Confirm */}
          {step === 2 && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Title</p>
                  <p className="font-medium">{title}</p>
                </div>
                {description && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Description</p>
                    <p className="text-sm">{description}</p>
                  </div>
                )}
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Duration</p>
                    <Badge variant="outline">{duration} days</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Platforms</p>
                    <div className="flex gap-1">
                      {platforms.map((p) => (
                        <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {generatedDays.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Plan</p>
                    <p className="text-sm">{generatedDays.length} days generated</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="flex justify-between pt-2 border-t">
          <Button
            variant="outline"
            onClick={() => step === 0 ? handleClose(false) : setStep(step - 1)}
            disabled={creating}
          >
            {step === 0 ? 'Cancel' : <><ChevronLeft className="h-4 w-4" /> Back</>}
          </Button>

          {step === 0 && (
            <Button onClick={handleCreateChallenge} disabled={!canProceedStep0 || creating}>
              {creating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating...</> : <>Next <ChevronRight className="h-4 w-4 ml-1" /></>}
            </Button>
          )}
          {step === 1 && (
            <Button onClick={() => setStep(2)}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
          {step === 2 && (
            <Button onClick={handleFinish}>
              <Check className="h-4 w-4 mr-1.5" /> Create Challenge
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
