'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
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

const ROLES = [
  { value: 'AMBASSADOR', label: 'Ambassador' },
  { value: 'SALES', label: 'Sales' },
  { value: 'SUPPORT', label: 'Support' },
  { value: 'THOUGHT_LEADER', label: 'Thought Leader' },
]

interface EmployeeFormData {
  name: string
  role: string
  avatarUrl: string
  energy: string
  friendliness: string
  expertise: string
  hobbies: string
  writingTone: string
  useEmoji: string
  contentFocus: string
}

interface EmployeeFormProps {
  initialData?: {
    id?: string
    name?: string
    role?: string
    avatarUrl?: string | null
    personality?: Record<string, unknown>
    background?: Record<string, unknown>
    writingStyle?: Record<string, unknown>
  }
  onSaved?: () => void
  onCancel?: () => void
}

export function EmployeeForm({ initialData, onSaved, onCancel }: EmployeeFormProps) {
  const personality = initialData?.personality ?? {}
  const background = initialData?.background ?? {}
  const writingStyle = initialData?.writingStyle ?? {}

  const [form, setForm] = useState<EmployeeFormData>({
    name: initialData?.name ?? '',
    role: initialData?.role ?? '',
    avatarUrl: initialData?.avatarUrl ?? '',
    energy: String(personality.energy ?? ''),
    friendliness: String(personality.friendliness ?? ''),
    expertise: String(background.expertise ?? ''),
    hobbies: String(background.hobbies ?? ''),
    writingTone: String(writingStyle.tone ?? ''),
    useEmoji: String(writingStyle.useEmoji ?? 'no'),
    contentFocus: String(writingStyle.contentFocus ?? ''),
  })
  const [saving, setSaving] = useState(false)

  function setField(field: keyof EmployeeFormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.role) {
      toast.error('Name and role are required')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name,
        role: form.role,
        avatarUrl: form.avatarUrl || undefined,
        personality: {
          energy: form.energy,
          friendliness: form.friendliness,
        },
        background: {
          expertise: form.expertise,
          hobbies: form.hobbies,
        },
        writingStyle: {
          tone: form.writingTone,
          useEmoji: form.useEmoji,
          contentFocus: form.contentFocus,
        },
      }

      let res: Response
      if (initialData?.id) {
        res = await fetch(`/api/employees/${initialData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed to save')
      }

      toast.success(initialData?.id ? 'Employee updated' : 'Employee created')
      onSaved?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Basic Info
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="Alex Johnson"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={form.role} onValueChange={(v) => setField('role', v)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="avatarUrl">Avatar URL (optional)</Label>
          <Input
            id="avatarUrl"
            value={form.avatarUrl}
            onChange={(e) => setField('avatarUrl', e.target.value)}
            placeholder="https://..."
            type="url"
          />
        </div>
      </div>

      {/* Personality */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Personality
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="energy">Energy Level</Label>
            <Input
              id="energy"
              value={form.energy}
              onChange={(e) => setField('energy', e.target.value)}
              placeholder="e.g. high energy, calm, balanced"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="friendliness">Friendliness</Label>
            <Input
              id="friendliness"
              value={form.friendliness}
              onChange={(e) => setField('friendliness', e.target.value)}
              placeholder="e.g. nerdy, friendly, formal"
            />
          </div>
        </div>
      </div>

      {/* Writing style */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Writing Style
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="writingTone">Tone</Label>
            <Select value={form.writingTone} onValueChange={(v) => setField('writingTone', v)}>
              <SelectTrigger id="writingTone">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="inspirational">Inspirational</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="useEmoji">Use Emojis</Label>
            <Select value={form.useEmoji} onValueChange={(v) => setField('useEmoji', v)}>
              <SelectTrigger id="useEmoji">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="sparingly">Sparingly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contentFocus">Content Focus</Label>
          <Input
            id="contentFocus"
            value={form.contentFocus}
            onChange={(e) => setField('contentFocus', e.target.value)}
            placeholder="e.g. thought leadership, product demos, customer stories"
          />
        </div>
      </div>

      {/* Background */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Background
        </h3>

        <div className="space-y-2">
          <Label htmlFor="expertise">Expertise</Label>
          <Textarea
            id="expertise"
            value={form.expertise}
            onChange={(e) => setField('expertise', e.target.value)}
            placeholder="10 years in SaaS, former engineer, MBA..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hobbies">Hobbies / Interests</Label>
          <Input
            id="hobbies"
            value={form.hobbies}
            onChange={(e) => setField('hobbies', e.target.value)}
            placeholder="hiking, podcasts, cooking (comma-separated)"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={saving} className="flex-1">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData?.id ? 'Save Changes' : 'Create Employee'}
        </Button>
      </div>
    </form>
  )
}
