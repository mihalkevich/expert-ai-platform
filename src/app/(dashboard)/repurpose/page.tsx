'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ContentInputForm } from '@/components/repurpose/content-input-form'
import { PlatformSelector } from '@/components/repurpose/platform-selector'
import { VoiceSelector } from '@/components/repurpose/voice-selector'
import { UsageMeter } from '@/components/billing/usage-meter'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Wand2, Loader2 } from 'lucide-react'

export default function RepurposePage() {
  const router = useRouter()

  const [content, setContent] = useState('')
  const [title, setTitle] = useState<string | undefined>()
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['LINKEDIN', 'TWITTER'])
  const [voiceProfileId, setVoiceProfileId] = useState<string | undefined>()
  const [submitting, setSubmitting] = useState(false)

  const handleContentReady = (c: string, t?: string) => {
    setContent(c)
    if (t) setTitle(t)
  }

  const canSubmit = content.trim().length >= 100 && selectedPlatforms.length > 0

  const handleSubmit = async () => {
    if (!canSubmit) {
      if (content.trim().length < 100) {
        toast.error('Please provide at least 100 characters of content')
      } else {
        toast.error('Please select at least one platform')
      }
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          rawContent: content,
          targetPlatforms: selectedPlatforms,
          voiceProfileId: voiceProfileId ?? null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to start repurpose job')
      router.push(`/repurpose/${data.jobId ?? data.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Repurpose</h1>
        <p className="text-muted-foreground">
          Transform your content for multiple platforms with AI.
        </p>
      </div>

      <UsageMeter />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left — Content Input (3/5 width on lg) */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content Source</CardTitle>
            </CardHeader>
            <CardContent>
              <ContentInputForm onContentReady={handleContentReady} />
            </CardContent>
          </Card>
        </div>

        {/* Right — Settings (2/5 width on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <PlatformSelector
                selected={selectedPlatforms}
                onChange={setSelectedPlatforms}
              />

              <Separator />

              <VoiceSelector
                voiceProfileId={voiceProfileId}
                onChange={setVoiceProfileId}
              />
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="w-full gap-2"
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate Content
              </>
            )}
          </Button>

          {!canSubmit && (
            <p className="text-center text-xs text-muted-foreground">
              {content.trim().length < 100
                ? 'Add content above to continue'
                : 'Select at least one platform'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
