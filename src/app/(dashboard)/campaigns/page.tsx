'use client'

import { useEffect, useState } from 'react'
import { Plus, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CampaignCard } from '@/components/campaigns/campaign-card'
import { CampaignForm } from '@/components/campaigns/campaign-form'

interface Campaign {
  id: string
  name: string
  description: string | null
  startDate: string | null
  endDate: string | null
  status: string
  _count: { posts: number }
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)

  async function fetchCampaigns() {
    try {
      const res = await fetch('/api/campaigns')
      if (res.ok) {
        const data = await res.json() as Campaign[]
        setCampaigns(data)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Promo Campaigns</h1>
          <p className="text-muted-foreground">
            Plan and track your promotional campaigns.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center gap-4">
          <Megaphone className="h-12 w-12 text-muted-foreground/40" />
          <div>
            <h3 className="font-semibold text-lg">No campaigns yet</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Create your first promotional campaign to coordinate content across your AI employees.
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onDeleted={fetchCampaigns}
              onUpdated={fetchCampaigns}
            />
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Campaign</DialogTitle>
          </DialogHeader>
          <CampaignForm
            onSaved={() => {
              setAddOpen(false)
              fetchCampaigns()
            }}
            onCancel={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
