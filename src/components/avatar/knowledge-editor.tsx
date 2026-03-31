'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type KnowledgeType = 'FAQ' | 'PRODUCT' | 'BIO' | 'CUSTOM'

interface KnowledgeItem {
  id: string
  type: KnowledgeType
  title: string | null
  content: string
  isActive: boolean
}

interface KnowledgeEditorProps {
  avatarId: string
  items: KnowledgeItem[]
  onItemsChange: (items: KnowledgeItem[]) => void
}

const TYPE_LABELS: Record<KnowledgeType, string> = {
  FAQ: 'FAQ',
  PRODUCT: 'Product',
  BIO: 'Bio',
  CUSTOM: 'Custom',
}

const TYPE_VARIANTS: Record<KnowledgeType, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  FAQ: 'default',
  PRODUCT: 'secondary',
  BIO: 'outline',
  CUSTOM: 'outline',
}

const EMPTY_FORM = { type: 'FAQ' as KnowledgeType, title: '', content: '' }

export function KnowledgeEditor({ avatarId, items, onItemsChange }: KnowledgeEditorProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const openAdd = () => {
    setEditingItem(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (item: KnowledgeItem) => {
    setEditingItem(item)
    setForm({ type: item.type, title: item.title ?? '', content: item.content })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.content.trim()) {
      toast.error('Content is required')
      return
    }

    setLoading(true)
    try {
      const isEditing = !!editingItem
      const url = isEditing
        ? `/api/avatar/${avatarId}/knowledge/${editingItem.id}`
        : `/api/avatar/${avatarId}/knowledge`
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          title: form.title.trim() || null,
          content: form.content.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to save item')
      }

      const saved: KnowledgeItem = await res.json()
      if (isEditing) {
        onItemsChange(items.map((i) => (i.id === saved.id ? saved : i)))
      } else {
        onItemsChange([...items, saved])
      }
      toast.success(isEditing ? 'Item updated' : 'Item added')
      setDialogOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save item')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (item: KnowledgeItem) => {
    setDeletingId(item.id)
    try {
      const res = await fetch(`/api/avatar/${avatarId}/knowledge/${item.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to delete item')
      }
      onItemsChange(items.filter((i) => i.id !== item.id))
      toast.success('Item deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete item')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length} knowledge item{items.length !== 1 ? 's' : ''}
        </p>
        <Button size="sm" onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
          <p className="text-sm font-medium">No knowledge items yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add FAQs, product info, bio, or custom context for your avatar.
          </p>
          <Button size="sm" className="mt-4" onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add First Item
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg border p-3"
            >
              <Badge variant={TYPE_VARIANTS[item.type]} className="shrink-0 text-xs">
                {TYPE_LABELS[item.type]}
              </Badge>
              <div className="min-w-0 flex-1">
                {item.title && (
                  <p className="truncate text-sm font-medium">{item.title}</p>
                )}
                <p className="line-clamp-2 text-xs text-muted-foreground">{item.content}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => openEdit(item)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(item)}
                  disabled={deletingId === item.id}
                >
                  {deletingId === item.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Knowledge Item' : 'Add Knowledge Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((prev) => ({ ...prev, type: v as KnowledgeType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FAQ">FAQ</SelectItem>
                  <SelectItem value="PRODUCT">Product</SelectItem>
                  <SelectItem value="BIO">Bio</SelectItem>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-title">Title (optional)</Label>
              <Input
                id="item-title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. What are your pricing plans?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-content">Content</Label>
              <Textarea
                id="item-content"
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Enter the knowledge content..."
                rows={5}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
