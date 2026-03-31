import type { PlanName } from '@/lib/constants'

// ---------------------------------------------------------------------------
// Plan definition
// ---------------------------------------------------------------------------
export interface PlanFeature {
  label: string
  included: boolean
  limit?: number | 'unlimited'
}

export interface Plan {
  id: PlanName
  name: string
  description: string
  monthlyPrice: number | null // null = contact sales
  yearlyPrice: number | null
  features: PlanFeature[]
  highlighted?: boolean
}

export const PLANS: Plan[] = [
  {
    id: 'FREE',
    name: 'Free',
    description: 'Try the basics — no credit card required.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { label: 'Repurposes per month', included: true, limit: 5 },
      { label: 'Social accounts', included: false, limit: 0 },
      { label: 'Voice profiles', included: false, limit: 0 },
      { label: 'AI Employees', included: false, limit: 0 },
      { label: 'Analytics', included: false },
      { label: 'Priority support', included: false },
    ],
  },
  {
    id: 'PRO',
    name: 'Pro',
    description: 'For solo creators who publish consistently.',
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: [
      { label: 'Repurposes per month', included: true, limit: 100 },
      { label: 'Social accounts', included: true, limit: 3 },
      { label: 'Voice profiles', included: true, limit: 5 },
      { label: 'AI Employees', included: false, limit: 0 },
      { label: 'Analytics', included: true },
      { label: 'Priority support', included: false },
    ],
  },
  {
    id: 'EXPERT',
    name: 'Expert',
    description: 'Unlimited repurposing for serious thought leaders.',
    monthlyPrice: 99,
    yearlyPrice: 79,
    highlighted: true,
    features: [
      { label: 'Repurposes per month', included: true, limit: 'unlimited' },
      { label: 'Social accounts', included: true, limit: 10 },
      { label: 'Voice profiles', included: true, limit: 'unlimited' },
      { label: 'AI Employees', included: false, limit: 0 },
      { label: 'Analytics', included: true },
      { label: 'Priority support', included: true },
    ],
  },
  {
    id: 'BUSINESS',
    name: 'Business',
    description: 'AI employees that work around the clock.',
    monthlyPrice: 299,
    yearlyPrice: 249,
    features: [
      { label: 'Repurposes per month', included: true, limit: 'unlimited' },
      { label: 'Social accounts', included: true, limit: 'unlimited' },
      { label: 'Voice profiles', included: true, limit: 'unlimited' },
      { label: 'AI Employees', included: true, limit: 5 },
      { label: 'Analytics', included: true },
      { label: 'Priority support', included: true },
    ],
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    description: 'Custom contracts for large teams.',
    monthlyPrice: null,
    yearlyPrice: null,
    features: [
      { label: 'Repurposes per month', included: true, limit: 'unlimited' },
      { label: 'Social accounts', included: true, limit: 'unlimited' },
      { label: 'Voice profiles', included: true, limit: 'unlimited' },
      { label: 'AI Employees', included: true, limit: 'unlimited' },
      { label: 'Analytics', included: true },
      { label: 'Dedicated support', included: true },
    ],
  },
]

// ---------------------------------------------------------------------------
// Stripe webhook event types we handle
// ---------------------------------------------------------------------------
export type StripeWebhookEventType =
  | 'checkout.session.completed'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'

// ---------------------------------------------------------------------------
// Subscription state stored in DB
// ---------------------------------------------------------------------------
export interface SubscriptionState {
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripePriceId: string | null
  plan: PlanName
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | null
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
}
