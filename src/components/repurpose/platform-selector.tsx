'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PLATFORM_LABELS, PLATFORM_CHAR_LIMITS, type Platform } from '@/lib/constants'
import {
  X,
  Mail,
  BookOpen,
  AtSign,
  Globe,
} from 'lucide-react'

interface PlatformSelectorProps {
  selected: string[]
  onChange: (platforms: string[]) => void
}

const ALL_PLATFORMS: Platform[] = ['LINKEDIN', 'TWITTER', 'INSTAGRAM', 'NEWSLETTER', 'BLOG']

const PLATFORM_CONFIG: Record<
  Platform,
  { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
> = {
  LINKEDIN: {
    icon: Globe,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
  },
  TWITTER: {
    icon: X,
    color: 'text-foreground',
    bg: 'bg-zinc-100 dark:bg-zinc-800/60',
  },
  INSTAGRAM: {
    icon: AtSign,
    color: 'text-pink-600 dark:text-pink-400',
    bg: 'bg-pink-50 dark:bg-pink-950/40',
  },
  NEWSLETTER: {
    icon: Mail,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
  },
  BLOG: {
    icon: BookOpen,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/40',
  },
}

function formatCharLimit(limit: number): string {
  if (limit >= 1000) return `${(limit / 1000).toFixed(0)}k chars`
  return `${limit} chars`
}

export function PlatformSelector({ selected, onChange }: PlatformSelectorProps) {
  const allSelected = selected.length === ALL_PLATFORMS.length

  const toggle = (platform: Platform) => {
    if (selected.includes(platform)) {
      onChange(selected.filter((p) => p !== platform))
    } else {
      onChange([...selected, platform])
    }
  }

  const toggleAll = () => {
    if (allSelected) {
      onChange([])
    } else {
      onChange([...ALL_PLATFORMS])
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Platforms</p>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={toggleAll}
          type="button"
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </Button>
      </div>

      <div className="space-y-2">
        {ALL_PLATFORMS.map((platform) => {
          const config = PLATFORM_CONFIG[platform]
          const Icon = config.icon
          const isSelected = selected.includes(platform)

          return (
            <div
              key={platform}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                isSelected
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-border hover:border-primary/30 hover:bg-muted/40',
              )}
              onClick={() => toggle(platform)}
            >
              <Checkbox
                id={`platform-${platform}`}
                checked={isSelected}
                onCheckedChange={() => toggle(platform)}
                onClick={(e) => e.stopPropagation()}
              />
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                  config.bg,
                )}
              >
                <Icon className={cn('h-4 w-4', config.color)} />
              </div>
              <Label
                htmlFor={`platform-${platform}`}
                className="flex flex-1 cursor-pointer items-center justify-between"
                onClick={(e) => e.preventDefault()}
              >
                <span className="font-medium">{PLATFORM_LABELS[platform]}</span>
                <span className="text-xs text-muted-foreground">
                  {formatCharLimit(PLATFORM_CHAR_LIMITS[platform])}
                </span>
              </Label>
            </div>
          )
        })}
      </div>

      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selected.length} platform{selected.length === 1 ? '' : 's'} selected
        </p>
      )}
    </div>
  )
}
