import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const PLAN_COLORS: Record<string, string> = {
  FREE: 'bg-secondary text-secondary-foreground hover:bg-secondary',
  PRO: 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300',
  EXPERT: 'bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300',
  BUSINESS: 'bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300',
  ENTERPRISE: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300',
}

const PLAN_LABELS: Record<string, string> = {
  FREE: 'Free',
  PRO: 'Pro',
  EXPERT: 'Expert',
  BUSINESS: 'Business',
  ENTERPRISE: 'Enterprise',
}

interface PlanBadgeProps {
  plan: string
  className?: string
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  const colorClass = PLAN_COLORS[plan] ?? PLAN_COLORS.FREE
  const label = PLAN_LABELS[plan] ?? plan

  return (
    <Badge className={cn('font-semibold', colorClass, className)}>
      {label}
    </Badge>
  )
}
