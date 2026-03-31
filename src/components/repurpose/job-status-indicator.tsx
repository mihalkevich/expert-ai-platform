'use client'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  Globe,
  X,
  AtSign,
  Mail,
  BookOpen,
  Clock,
  Download,
  Wand2,
} from 'lucide-react'
import type { Platform } from '@/lib/constants'
import { PLATFORM_LABELS } from '@/lib/constants'

type JobStatus = 'PENDING' | 'EXTRACTING' | 'GENERATING' | 'COMPLETED' | 'PARTIALLY_FAILED' | 'FAILED'

interface JobStatusIndicatorProps {
  status: JobStatus | string
  targetPlatforms: string[]
  completedPlatforms?: string[]
}

const STATUS_CONFIG: Record<string, { label: string; progress: number; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING: { label: 'Queued...', progress: 5, icon: Clock },
  EXTRACTING: { label: 'Extracting content...', progress: 30, icon: Download },
  GENERATING: { label: 'Generating with AI...', progress: 65, icon: Wand2 },
  COMPLETED: { label: 'Complete!', progress: 100, icon: Wand2 },
  PARTIALLY_FAILED: { label: 'Partially complete', progress: 100, icon: Wand2 },
  FAILED: { label: 'Failed', progress: 100, icon: Wand2 },
}

const PLATFORM_ICONS: Record<Platform, React.ComponentType<{ className?: string }>> = {
  LINKEDIN: Globe,
  TWITTER: X,
  INSTAGRAM: AtSign,
  NEWSLETTER: Mail,
  BLOG: BookOpen,
}

export function JobStatusIndicator({
  status,
  targetPlatforms,
  completedPlatforms = [],
}: JobStatusIndicatorProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, progress: 50, icon: Wand2 }
  const StatusIcon = config.icon
  const isPulse = status === 'PENDING' || status === 'EXTRACTING' || status === 'GENERATING'

  return (
    <div className="space-y-4 rounded-lg border bg-card p-6">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full',
            isPulse ? 'bg-primary/10' : 'bg-muted',
          )}
        >
          <StatusIcon
            className={cn('h-5 w-5', isPulse ? 'text-primary animate-pulse' : 'text-muted-foreground')}
          />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{config.label}</p>
          <p className="text-xs text-muted-foreground">
            {status === 'GENERATING'
              ? `Working on ${targetPlatforms.length} platform${targetPlatforms.length === 1 ? '' : 's'}...`
              : 'Please wait while we process your content'}
          </p>
        </div>
        <span className="text-sm font-medium text-muted-foreground">{config.progress}%</span>
      </div>

      <Progress value={config.progress} className="h-2" />

      {targetPlatforms.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-1">
          {targetPlatforms.map((platform) => {
            const p = platform as Platform
            const Icon = PLATFORM_ICONS[p]
            const isComplete = completedPlatforms.includes(platform)

            if (!Icon) return null

            return (
              <div
                key={platform}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all',
                  isComplete
                    ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400'
                    : status === 'GENERATING'
                      ? 'bg-primary/10 text-primary animate-pulse'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                <Icon className="h-3 w-3" />
                {PLATFORM_LABELS[p]}
                {isComplete && <span className="ml-0.5">✓</span>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
