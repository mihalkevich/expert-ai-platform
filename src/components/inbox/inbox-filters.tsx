'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export interface InboxFilters {
  status: string
  type: string
  platform: string
}

interface InboxFiltersProps {
  filters: InboxFilters
  onChange: (filters: InboxFilters) => void
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'AI_DRAFTED', label: 'AI Drafted' },
  { value: 'REPLIED', label: 'Replied' },
  { value: 'IGNORED', label: 'Ignored' },
]

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'COMMENT', label: 'Comment' },
  { value: 'DM', label: 'Direct Message' },
  { value: 'MENTION', label: 'Mention' },
]

const PLATFORM_OPTIONS = [
  { value: 'all', label: 'All Platforms' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'TWITTER', label: 'Twitter' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'NEWSLETTER', label: 'Newsletter' },
  { value: 'BLOG', label: 'Blog' },
]

export function InboxFilters({ filters, onChange }: InboxFiltersProps) {
  const hasActiveFilters =
    filters.status !== 'all' || filters.type !== 'all' || filters.platform !== 'all'

  function clearFilters() {
    onChange({ status: 'all', type: 'all', platform: 'all' })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={filters.status}
        onValueChange={(value) => onChange({ ...filters, status: value })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.type}
        onValueChange={(value) => onChange({ ...filters, type: value })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          {TYPE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.platform}
        onValueChange={(value) => onChange({ ...filters, platform: value })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Platform" />
        </SelectTrigger>
        <SelectContent>
          {PLATFORM_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  )
}
