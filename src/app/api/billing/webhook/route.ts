export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { STRIPE_PRICE_IDS } from '@/lib/constants'
import type { PlanName } from '@/lib/constants'

// Map a Stripe price ID to the plan name
function planFromPriceId(priceId: string): PlanName {
  const entry = Object.entries(STRIPE_PRICE_IDS).find(([, id]) => id === priceId)
  return (entry?.[0] as PlanName) ?? 'FREE'
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const priceId = subscription.items.data[0]?.price.id ?? ''
  const plan = planFromPriceId(priceId)

  await prisma.user.update({
    where: { stripeCustomerId: customerId },
    data: {
      planStatus: plan,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
    },
  })
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // subscription.updated handles plan changes; invoice.paid confirms payment succeeded.
  // Log for observability.
  const customerId = invoice.customer as string
  console.info('[webhook] invoice.paid for customer:', customerId)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const priceId = subscription.items.data[0]?.price.id ?? ''
  const plan = planFromPriceId(priceId)

  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      planStatus: plan,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
    },
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      planStatus: 'FREE',
      stripeSubscriptionId: null,
      stripePriceId: null,
    },
  })
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (error) {
    console.error('[webhook] signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Return 200 immediately; process async
  ;(async () => {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
          break
        case 'invoice.paid':
          await handleInvoicePaid(event.data.object as Stripe.Invoice)
          break
        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
          break
        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
          break
        default:
          // Unhandled event type — ignore
          break
      }
    } catch (error) {
      console.error(`[webhook] error handling ${event.type}:`, error)
    }
  })()

  return NextResponse.json({ received: true })
}
