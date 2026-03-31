'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface CampaignFormData {
  name: string
  description: string
  startDate: string
  endDate: string
}

interface CampaignFormProps {
  initialData?: {
    id?: string
    name?: string
    description?: string | null
    startDate?: string | Date | null
    endDate?: string | Date | null
  }
  onSaved?: () => void
  onCancel?: () => void
}

function toDateInput(val: string | Date | null | undefined): string {
  if (!val) return ''
  const d = new Date(val)
  return d.toISOString().slice(0, 10)
}

export function CampaignForm({ initialData, onSaved, onCancel }: CampaignFormProps) {
  const [form, setForm] = useState<CampaignFormData>({
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    startDate: toDateInput(initialData?.startDate),
    endDate: toDateInput(initialData?.endDate),
  })
  const [saving, setSaving] = useState(false)

  function setField(field: keyof CampaignFormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Campaign name is required')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      }

      let res: Response
      if (initialData?.id) {
        res = await fetch(`/api/campaigns/${initialData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed to save')
      }

      toast.success(initialData?.id ? 'Campaign updated' : 'Campaign created')
      onSaved?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Campaign Name *</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          placeholder="Q1 Product Launch"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          placeholder="Campaign goals and overview..."
          rows={3}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={form.startDate}
            onChange={(e) => setField('startDate', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={form.endDate}
            onChange={(e) => setField('endDate', e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={saving} className="flex-1">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData?.id ? 'Save Changes' : 'Create Campaign'}
        </Button>
      </div>
    </form>
  )
}
