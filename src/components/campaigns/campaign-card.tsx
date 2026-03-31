'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Trash2, Pencil, Calendar, Megaphone } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CampaignForm } from './campaign-form'

interface Campaign {
  id: string
  name: string
  description: string | null
  startDate: string | Date | null
  endDate: string | Date | null
  status: string
  _count?: { posts: number }
}

interface CampaignCardProps {
  campaign: Campaign
  onDeleted?: () => void
  onUpdated?: () => void
}

const STATUS_STYLES: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT: { label: 'Draft', variant: 'secondary' },
  ACTIVE: { label: 'Active', variant: 'default' },
  COMPLETED: { label: 'Completed', variant: 'outline' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
}

export function CampaignCard({ campaign, onDeleted, onUpdated }: CampaignCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const statusInfo = STATUS_STYLES[campaign.status] ?? { label: campaign.status, variant: 'secondary' as const }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Campaign deleted')
      setDeleteOpen(false)
      onDeleted?.()
    } catch {
      toast.error('Failed to delete campaign')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Megaphone className="h-4 w-4 text-muted-foreground shrink-0" />
                <h3 className="font-semibold truncate">{campaign.name}</h3>
                <Badge variant={statusInfo.variant} className="text-xs">
                  {statusInfo.label}
                </Badge>
              </div>
              {campaign.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {campaign.description}
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Date range */}
          {(campaign.startDate || campaign.endDate) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {campaign.startDate ? format(new Date(campaign.startDate), 'MMM d, yyyy') : '?'}
                {' — '}
                {campaign.endDate ? format(new Date(campaign.endDate), 'MMM d, yyyy') : 'ongoing'}
              </span>
            </div>
          )}

          {/* Posts count */}
          <p className="text-xs text-muted-foreground">
            {campaign._count?.posts ?? 0} posts
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{campaign.name}&quot;? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
          </DialogHeader>
          <CampaignForm
            initialData={campaign}
            onSaved={() => {
              setEditOpen(false)
              onUpdated?.()
            }}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
