'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface PlanFeature {
  label: string
  included: boolean
}

interface PlanDef {
  id: string
  name: string
  price: string
  description: string
  features: PlanFeature[]
  highlighted?: boolean
  priceLabel?: string
}

const PLANS: PlanDef[] = [
  {
    id: 'FREE',
    name: 'Free',
    price: '$0',
    description: 'Try the basics — no credit card required.',
    features: [
      { label: '5 repurposes / month', included: true },
      { label: 'No social accounts', included: false },
      { label: 'Voice learning', included: false },
      { label: 'Inbox', included: false },
      { label: 'Analytics', included: false },
    ],
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: '$29',
    description: 'For solo creators who publish consistently.',
    features: [
      { label: '100 repurposes / month', included: true },
      { label: '3 social accounts', included: true },
      { label: 'Voice learning', included: true },
      { label: 'Inbox', included: true },
      { label: 'Analytics', included: true },
    ],
  },
  {
    id: 'EXPERT',
    name: 'Expert',
    price: '$79',
    description: 'Unlimited repurposing for serious thought leaders.',
    highlighted: true,
    features: [
      { label: 'Unlimited repurposes', included: true },
      { label: 'All platforms', included: true },
      { label: 'Reputation builder', included: true },
      { label: 'Challenges', included: true },
      { label: 'AI avatar', included: true },
    ],
  },
  {
    id: 'BUSINESS',
    name: 'Business',
    price: '$199',
    description: 'AI employees working around the clock for your brand.',
    features: [
      { label: '5 AI employees', included: true },
      { label: 'API access', included: true },
      { label: 'Teams', included: true },
      { label: 'Unlimited repurposes', included: true },
      { label: 'Priority support', included: true },
    ],
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: '$499',
    description: 'Custom scale with unlimited employees and dedicated support.',
    features: [
      { label: 'Unlimited AI employees', included: true },
      { label: 'Campaign management', included: true },
      { label: 'Dedicated support', included: true },
      { label: 'Custom integrations', included: true },
      { label: 'SLA guarantee', included: true },
    ],
  },
]

interface PricingCardsProps {
  currentPlan: string
}

export function PricingCards({ currentPlan }: PricingCardsProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleCheckout = async (planId: string) => {
    if (planId === 'FREE' || planId === currentPlan) return

    setLoadingPlan(planId)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error ?? 'Failed to start checkout.')
        return
      }

      const { url } = await res.json()
      if (url) {
        window.location.href = url
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {PLANS.map((plan) => {
        const isCurrent = plan.id === currentPlan
        const isLoading = loadingPlan === plan.id
        const isFree = plan.id === 'FREE'
        const isHigher =
          ['FREE', 'PRO', 'EXPERT', 'BUSINESS', 'ENTERPRISE'].indexOf(plan.id) >
          ['FREE', 'PRO', 'EXPERT', 'BUSINESS', 'ENTERPRISE'].indexOf(currentPlan)

        return (
          <Card
            key={plan.id}
            className={cn(
              'relative flex flex-col',
              plan.highlighted && 'border-primary shadow-lg',
              isCurrent && 'ring-2 ring-primary',
            )}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="px-3 py-0.5 text-xs">Most Popular</Badge>
              </div>
            )}

            <CardHeader className="pb-4">
              <CardTitle className="text-base">{plan.name}</CardTitle>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                {!isFree && <span className="text-sm text-muted-foreground">/mo</span>}
              </div>
              <CardDescription className="text-xs">{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 pb-4">
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature.label} className="flex items-start gap-2">
                    <Check
                      className={cn(
                        'mt-0.5 h-3.5 w-3.5 shrink-0',
                        feature.included ? 'text-primary' : 'text-muted-foreground/30',
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs',
                        feature.included ? 'text-foreground' : 'text-muted-foreground/50 line-through',
                      )}
                    >
                      {feature.label}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              {isCurrent ? (
                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : isFree ? (
                <Button variant="outline" className="w-full" disabled>
                  Free
                </Button>
              ) : (
                <Button
                  className={cn('w-full', plan.highlighted && 'bg-primary')}
                  variant={isHigher ? 'default' : 'outline'}
                  disabled={isLoading}
                  onClick={() => handleCheckout(plan.id)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Loading…
                    </>
                  ) : isHigher ? (
                    <>
                      <Zap className="mr-2 h-3.5 w-3.5" />
                      Upgrade
                    </>
                  ) : (
                    'Downgrade'
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
