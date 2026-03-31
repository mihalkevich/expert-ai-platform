'use client'

import { useState, useEffect, useCallback } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { InboxItemCard, InboxItemData } from './inbox-item-card'
import type { InboxFilters } from './inbox-filters'
import { toast } from 'sonner'

interface InboxListProps {
  filters: InboxFilters
}

export function InboxList({ filters }: InboxListProps) {
  const [items, setItems] = useState<InboxItemData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status !== 'all') params.set('status', filters.status)
      if (filters.type !== 'all') params.set('type', filters.type)
      if (filters.platform !== 'all') params.set('platform', filters.platform)

      const res = await fetch(`/api/inbox?${params.toString()}`)
      const data = await res.json() as InboxItemData[] | { error: string }
      if (!res.ok) throw new Error((data as { error: string }).error ?? 'Failed to load')
      setItems(data as InboxItemData[])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load inbox')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <Skeleton key={n} className="h-40 rounded-xl" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <p className="text-muted-foreground">No inbox items found.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Use &quot;Seed Test Data&quot; to add sample items for testing.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <InboxItemCard key={item.id} item={item} onUpdated={fetchItems} />
      ))}
    </div>
  )
}
