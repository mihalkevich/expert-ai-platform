'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ContentPlan {
  id: string
  title: string
  content: string | null
  platform: string | null
  status: string
  createdAt: string | Date
}

interface ContentPlanListProps {
  employeeId: string
  plans: ContentPlan[]
  onUpdated?: () => void
}

const STATUS_FLOW: Record<string, string> = {
  DRAFT: 'PLANNED',
  PLANNED: 'APPROVED',
  APPROVED: 'POSTED',
}

const STATUS_STYLES: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT: { label: 'Draft', variant: 'secondary' },
  PLANNED: { label: 'Planned', variant: 'outline' },
  APPROVED: { label: 'Approved', variant: 'default' },
  POSTED: { label: 'Posted', variant: 'default' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
}

const PLATFORM_LABELS: Record<string, string> = {
  LINKEDIN: 'LinkedIn',
  TWITTER: 'Twitter',
  INSTAGRAM: 'Instagram',
  NEWSLETTER: 'Newsletter',
  BLOG: 'Blog',
}

export function ContentPlanList({ employeeId, plans, onUpdated }: ContentPlanListProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function handleStatusChange(plan: ContentPlan, newStatus: string) {
    setUpdatingId(plan.id)
    try {
      const res = await fetch(`/api/employees/${employeeId}/content-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update')
      toast.success('Status updated')
      onUpdated?.()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleReject(plan: ContentPlan) {
    await handleStatusChange(plan, 'REJECTED')
  }

  if (plans.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No content plans yet. Generate your first post!
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {plans.map((plan) => {
        const statusInfo = STATUS_STYLES[plan.status] ?? { label: plan.status, variant: 'secondary' as const }
        const nextStatus = STATUS_FLOW[plan.status]
        const preview = plan.content ? plan.content.slice(0, 100) + (plan.content.length > 100 ? '...' : '') : ''

        return (
          <Card key={plan.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(plan.createdAt), 'MMM d, yyyy')}
                    </span>
                    {plan.platform && (
                      <Badge variant="outline" className="text-xs">
                        {PLATFORM_LABELS[plan.platform] ?? plan.platform}
                      </Badge>
                    )}
                    <Badge variant={statusInfo.variant} className="text-xs">
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{preview}</p>
                </div>

                <div className="flex gap-1 shrink-0">
                  {nextStatus && plan.status !== 'POSTED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingId === plan.id}
                      onClick={() => handleStatusChange(plan, nextStatus)}
                    >
                      {nextStatus.charAt(0) + nextStatus.slice(1).toLowerCase()}
                    </Button>
                  )}
                  {plan.status !== 'REJECTED' && plan.status !== 'POSTED' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={updatingId === plan.id}
                      onClick={() => handleReject(plan)}
                      className="text-destructive hover:text-destructive"
                    >
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
