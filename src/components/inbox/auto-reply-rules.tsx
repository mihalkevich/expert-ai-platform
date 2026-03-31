'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AutoReplyRule {
  id: string
  name: string
  isActive: boolean
  triggerKeywords: string[]
  platform: string | null
  replyTemplate: string
  tone: string | null
  createdAt: string
}

const EMPTY_FORM = {
  name: '',
  triggerKeywords: '',
  replyTemplate: '',
  tone: '',
  platform: '',
}

export function AutoReplyRules() {
  const [rules, setRules] = useState<AutoReplyRule[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchRules = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/inbox/rules')
      const data = await res.json() as AutoReplyRule[] | { error: string }
      if (!res.ok) throw new Error((data as { error: string }).error ?? 'Failed to load')
      setRules(data as AutoReplyRule[])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load rules')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  async function handleCreate() {
    if (!form.name.trim() || !form.replyTemplate.trim()) {
      toast.error('Name and reply template are required')
      return
    }

    setSaving(true)
    try {
      const keywords = form.triggerKeywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)

      const res = await fetch('/api/inbox/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          triggerKeywords: keywords,
          replyTemplate: form.replyTemplate.trim(),
          tone: form.tone.trim() || undefined,
          platform: form.platform || undefined,
        }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to create')
      toast.success('Rule created')
      setForm(EMPTY_FORM)
      setShowForm(false)
      await fetchRules()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create rule')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/inbox/rules/${id}`, { method: 'DELETE' })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to delete')
      toast.success('Rule deleted')
      setRules((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete rule')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleToggle(rule: AutoReplyRule) {
    setTogglingId(rule.id)
    try {
      const res = await fetch(`/api/inbox/rules/${rule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !rule.isActive }),
      })
      const data = await res.json() as { error?: string; isActive?: boolean }
      if (!res.ok) throw new Error(data.error ?? 'Failed to update')
      setRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, isActive: !rule.isActive } : r)),
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update rule')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Auto-Reply Rules</CardTitle>
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => setShowForm((v) => !v)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Rule
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Inline Add Form */}
        {showForm && (
          <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Rule Name *</label>
                <Input
                  placeholder="e.g. Thank positive comments"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Trigger Keywords (comma-separated)</label>
                <Input
                  placeholder="e.g. thanks, great, love"
                  value={form.triggerKeywords}
                  onChange={(e) => setForm({ ...form, triggerKeywords: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Reply Template *</label>
              <Textarea
                placeholder="Thank you so much for your kind words! ..."
                rows={3}
                value={form.replyTemplate}
                onChange={(e) => setForm({ ...form, replyTemplate: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Tone (optional)</label>
                <Input
                  placeholder="e.g. friendly, professional"
                  value={form.tone}
                  onChange={(e) => setForm({ ...form, tone: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} disabled={saving} className="gap-1">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Save Rule
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowForm(false)
                  setForm(EMPTY_FORM)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Rules List */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((n) => (
              <Skeleton key={n} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : rules.length === 0 && !showForm ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No auto-reply rules yet. Add one to automate replies.
          </p>
        ) : (
          <div className="space-y-2">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-start justify-between gap-3 rounded-lg border p-3"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{rule.name}</p>
                    {rule.platform && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        {rule.platform}
                      </Badge>
                    )}
                  </div>
                  {rule.triggerKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {rule.triggerKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-xs"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground truncate">{rule.replyTemplate}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={() => handleToggle(rule)}
                    disabled={togglingId === rule.id}
                    aria-label="Toggle rule active"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(rule.id)}
                    disabled={deletingId === rule.id}
                  >
                    {deletingId === rule.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
