'use client'

import { useState } from 'react'
import { InboxFilters, type InboxFilters as InboxFiltersType } from '@/components/inbox/inbox-filters'
import { InboxList } from '@/components/inbox/inbox-list'
import { AutoReplyRules } from '@/components/inbox/auto-reply-rules'
import { Button } from '@/components/ui/button'
import { FlaskConical, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'

const DEFAULT_FILTERS: InboxFiltersType = {
  status: 'all',
  type: 'all',
  platform: 'all',
}

export default function InboxPage() {
  const [filters, setFilters] = useState<InboxFiltersType>(DEFAULT_FILTERS)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [listKey, setListKey] = useState(0)

  async function handleSeed() {
    setSeeding(true)
    try {
      const res = await fetch('/api/inbox/seed', { method: 'POST' })
      const data = await res.json() as { created?: number; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Seed failed')
      toast.success(`Seeded ${data.created ?? 0} inbox items`)
      setListKey((k) => k + 1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Seed failed')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Inbox</h1>
          <p className="text-muted-foreground">
            Manage comments, DMs, and mentions with AI-generated replies.
          </p>
        </div>
        {process.env.NODE_ENV !== 'production' && (
          <Button variant="outline" size="sm" onClick={handleSeed} disabled={seeding}>
            {seeding ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FlaskConical className="mr-2 h-4 w-4" />
            )}
            Seed Test Data
          </Button>
        )}
      </div>

      {/* Filters */}
      <InboxFilters filters={filters} onChange={setFilters} />

      {/* Inbox List */}
      <InboxList key={listKey} filters={filters} />

      {/* Auto-Reply Rules (collapsible section) */}
      <div className="border-t pt-4">
        <button
          className="flex w-full items-center justify-between py-2 text-sm font-medium"
          onClick={() => setRulesOpen((v) => !v)}
        >
          <span>Auto-Reply Rules</span>
          {rulesOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {rulesOpen && (
          <div className="mt-2">
            <AutoReplyRules />
          </div>
        )}
      </div>
    </div>
  )
}
