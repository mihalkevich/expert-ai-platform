'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ToneSliders } from '@/components/voice/tone-sliders'
import { SampleContentInput } from '@/components/voice/sample-content-input'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

const INDUSTRY_SUGGESTIONS = [
  'SaaS',
  'Healthcare',
  'Education',
  'Finance',
  'Marketing',
  'E-commerce',
  'Real Estate',
  'Legal',
  'Consulting',
  'Technology',
]

interface VoiceProfileData {
  id: string
  name: string
  industry?: string | null
  targetAudience?: string | null
  customInstructions?: string | null
  sampleTexts: string[]
  formalityCasual: number
  seriousFun: number
  technicalSimple: number
  conciseVerbose: number
}

interface VoiceProfileFormProps {
  profile?: VoiceProfileData
  onSuccess: () => void
}

interface FormState {
  name: string
  description: string
  industry: string
  targetAudience: string
  customInstructions: string
  samples: string[]
  isDefault: boolean
  tones: Record<string, number>
}

export function VoiceProfileForm({ profile, onSuccess }: VoiceProfileFormProps) {
  const isEditing = !!profile

  const [form, setForm] = useState<FormState>({
    name: profile?.name ?? '',
    description: '',
    industry: profile?.industry ?? '',
    targetAudience: profile?.targetAudience ?? '',
    customInstructions: profile?.customInstructions ?? '',
    samples: profile?.sampleTexts ?? [],
    isDefault: false,
    tones: {
      formalityCasual: profile?.formalityCasual ?? 50,
      seriousFun: profile?.seriousFun ?? 50,
      technicalSimple: profile?.technicalSimple ?? 50,
      conciseVerbose: profile?.conciseVerbose ?? 50,
    },
  })

  const [loading, setLoading] = useState(false)
  const [showIndustrySuggestions, setShowIndustrySuggestions] = useState(false)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name.trim()) {
      toast.error('Profile name is required.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        industry: form.industry.trim() || undefined,
        targetAudience: form.targetAudience.trim() || undefined,
        customInstructions: form.customInstructions.trim() || undefined,
        samples: form.samples,
        ...form.tones,
      }

      const url = isEditing ? `/api/voice/${profile.id}` : '/api/voice'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error ?? 'Failed to save voice profile.')
        return
      }

      toast.success(isEditing ? 'Voice profile updated.' : 'Voice profile created.')
      onSuccess()
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g. LinkedIn Thought Leader"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          required
          maxLength={100}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe when you use this voice profile…"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={2}
          maxLength={500}
          className="resize-none"
        />
      </div>

      <Separator />

      {/* Tone sliders */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Tone Settings</h3>
          <p className="text-xs text-muted-foreground">
            Adjust these sliders to capture your writing style.
          </p>
        </div>
        <ToneSliders
          values={form.tones}
          onChange={(key, value) =>
            setForm((prev) => ({ ...prev, tones: { ...prev.tones, [key]: value } }))
          }
        />
      </div>

      <Separator />

      {/* Industry */}
      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <div className="relative">
          <Input
            id="industry"
            placeholder="e.g. SaaS, Healthcare, Finance…"
            value={form.industry}
            onChange={(e) => set('industry', e.target.value)}
            onFocus={() => setShowIndustrySuggestions(true)}
            onBlur={() => setTimeout(() => setShowIndustrySuggestions(false), 150)}
            maxLength={100}
          />
          {showIndustrySuggestions && (
            <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
              <div className="flex flex-wrap gap-1 p-1">
                {INDUSTRY_SUGGESTIONS.filter(
                  (s) =>
                    !form.industry ||
                    s.toLowerCase().includes(form.industry.toLowerCase()),
                ).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="rounded-sm bg-muted px-2 py-0.5 text-xs hover:bg-accent"
                    onMouseDown={() => set('industry', s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Target Audience */}
      <div className="space-y-2">
        <Label htmlFor="targetAudience">Target Audience</Label>
        <Input
          id="targetAudience"
          placeholder="e.g. B2B founders, developers, HR professionals…"
          value={form.targetAudience}
          onChange={(e) => set('targetAudience', e.target.value)}
          maxLength={200}
        />
      </div>

      <Separator />

      {/* Writing Samples */}
      <SampleContentInput
        samples={form.samples}
        onChange={(samples) => set('samples', samples)}
      />

      <Separator />

      {/* Custom Instructions */}
      <div className="space-y-2">
        <Label htmlFor="customInstructions">Custom Instructions</Label>
        <Textarea
          id="customInstructions"
          placeholder="Any additional guidelines for AI generation (e.g. always use bullet points, never use jargon)…"
          value={form.customInstructions}
          onChange={(e) => set('customInstructions', e.target.value)}
          rows={3}
          maxLength={2000}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          {form.customInstructions.length}/2000 characters
        </p>
      </div>

      {/* isDefault toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="text-sm font-medium">Set as default profile</p>
          <p className="text-xs text-muted-foreground">
            New repurpose jobs will use this profile automatically.
          </p>
        </div>
        <Switch
          checked={form.isDefault}
          onCheckedChange={(checked) => set('isDefault', checked)}
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="min-w-32">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? 'Save Changes' : 'Create Profile'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
