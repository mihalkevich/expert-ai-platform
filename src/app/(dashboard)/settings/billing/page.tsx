'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { PlanBadge } from '@/components/billing/plan-badge'
import { PricingCards } from '@/components/billing/pricing-cards'
import { UsageMeter } from '@/components/billing/usage-meter'
import { ExternalLink, Loader2, Receipt } from 'lucide-react'
import { toast } from 'sonner'

export default function BillingSettingsPage() {
  const { data: session } = useSession()
  const plan = session?.user?.planStatus ?? 'FREE'

  const [portalLoading, setPortalLoading] = useState(false)

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error ?? 'Could not open billing portal.')
        return
      }
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing & Plans</h1>
        <p className="text-muted-foreground">Manage your subscription and usage.</p>
      </div>

      {/* Current plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Plan</CardTitle>
          <CardDescription>Your active subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Plan:</span>
              {session ? (
                <PlanBadge plan={plan} />
              ) : (
                <Skeleton className="h-5 w-16" />
              )}
            </div>
            {plan !== 'FREE' && (
              <Button
                variant="outline"
                size="sm"
                disabled={portalLoading}
                onClick={handleManageSubscription}
              >
                {portalLoading ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Opening…
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-3.5 w-3.5" />
                    Manage Subscription
                  </>
                )}
              </Button>
            )}
          </div>

          <UsageMeter />
        </CardContent>
      </Card>

      {/* Upgrade section */}
      {plan !== 'ENTERPRISE' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Upgrade Your Plan</h2>
            <p className="text-sm text-muted-foreground">
              Get more repurposes, social accounts, and powerful AI features.
            </p>
          </div>
          {session ? (
            <PricingCards currentPlan={plan} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))}
            </div>
          )}
        </div>
      )}

      <Separator />

      {/* Billing history placeholder */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Billing History</CardTitle>
          </div>
          <CardDescription>Your past invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          {plan === 'FREE' ? (
            <p className="text-sm text-muted-foreground">
              No billing history. You are on the free plan.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                View and download past invoices from the Stripe billing portal.
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled={portalLoading}
                onClick={handleManageSubscription}
              >
                {portalLoading ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="mr-2 h-3.5 w-3.5" />
                )}
                Open Billing Portal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
