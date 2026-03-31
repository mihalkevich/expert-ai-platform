'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const PLATFORMS = [
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'TWITTER', label: 'Twitter' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'NEWSLETTER', label: 'Newsletter' },
  { value: 'BLOG', label: 'Blog' },
]

interface GeneratePostDialogProps {
  employeeId: string
  employeeName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GeneratePostDialog({
  employeeId,
  employeeName,
  open,
  onOpenChange,
}: GeneratePostDialogProps) {
  const [platform, setPlatform] = useState('')
  const [topic, setTopic] = useState('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [planId, setPlanId] = useState<string | null>(null)

  async function handleGenerate() {
    if (!platform || !topic.trim()) {
      toast.error('Please select a platform and enter a topic')
      return
    }

    setGenerating(true)
    setGeneratedContent('')
    setPlanId(null)

    try {
      const res = await fetch(`/api/employees/${employeeId}/generate-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, topic }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed to generate')
      }

      const data = await res.json() as { content: string; planId: string }
      setGeneratedContent(data.content)
      setPlanId(data.planId)
      toast.success('Content generated!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate content')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSaveToPlan() {
    if (!planId || !generatedContent.trim()) return

    setSaving(true)
    try {
      const res = await fetch(`/api/employees/${employeeId}/content-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, status: 'PLANNED' }),
      })

      if (!res.ok) throw new Error('Failed to save')
      toast.success('Saved to content plans')
      onOpenChange(false)
    } catch {
      toast.error('Failed to save to plans')
    } finally {
      setSaving(false)
    }
  }

  function handleClose(open: boolean) {
    if (!open) {
      setPlatform('')
      setTopic('')
      setGeneratedContent('')
      setPlanId(null)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Generate Post for {employeeName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Topic</Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. AI trends in 2025, product launch tips..."
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating || !platform || !topic.trim()}
            className="w-full gap-2"
          >
            {generating && <Loader2 className="h-4 w-4 animate-spin" />}
            {generating ? 'Generating...' : 'Generate'}
          </Button>

          {generatedContent && (
            <>
              <div className="space-y-2">
                <Label>Generated Content</Label>
                <Textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </Button>
                <Button
                  onClick={handleSaveToPlan}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? 'Saving...' : 'Save to Plans'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
