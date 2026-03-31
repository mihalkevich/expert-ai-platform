'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface BacklogItem {
  id: string
  challengeId: string
  title: string
  description: string | null
  kanbanStatus: string
  order: number
}

interface ChallengeKanbanProps {
  challengeId: string
  items: BacklogItem[]
}

const COLUMNS = [
  { key: 'TODO', label: 'To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'DONE', label: 'Done' },
]

const NEXT_STATUS: Record<string, string | null> = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
  DONE: null,
}

const NEXT_LABEL: Record<string, string> = {
  TODO: 'Move to In Progress',
  IN_PROGRESS: 'Move to Done',
}

export function ChallengeKanban({ challengeId, items: initialItems }: ChallengeKanbanProps) {
  const [items, setItems] = useState<BacklogItem[]>(initialItems)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [addingItem, setAddingItem] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  async function moveItem(item: BacklogItem, newStatus: string) {
    const optimistic = items.map((i) => (i.id === item.id ? { ...i, kanbanStatus: newStatus } : i))
    setItems(optimistic)

    try {
      const res = await fetch(`/api/challenges/${challengeId}/backlog/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kanbanStatus: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to move')
      const updated: BacklogItem = await res.json()
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
    } catch {
      setItems(initialItems)
      toast.error('Failed to move item')
    }
  }

  async function deleteItem(id: string) {
    const previous = [...items]
    setItems((prev) => prev.filter((i) => i.id !== id))

    try {
      const res = await fetch(`/api/challenges/${challengeId}/backlog/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Item deleted')
    } catch {
      setItems(previous)
      toast.error('Failed to delete item')
    }
  }

  async function addItem() {
    if (!newTitle.trim()) return
    setAddingItem(true)
    try {
      const res = await fetch(`/api/challenges/${challengeId}/backlog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), description: newDescription.trim() || null }),
      })
      if (!res.ok) throw new Error('Failed to create')
      const created: BacklogItem = await res.json()
      setItems((prev) => [...prev, created])
      setNewTitle('')
      setNewDescription('')
      setShowAddForm(false)
      toast.success('Item added')
    } catch {
      toast.error('Failed to add item')
    } finally {
      setAddingItem(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map((col) => {
        const colItems = items.filter((i) => i.kanbanStatus === col.key)
        return (
          <div key={col.key} className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm">{col.label}</h3>
              <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                {colItems.length}
              </Badge>
            </div>

            <div className="space-y-2 min-h-[80px]">
              {colItems.map((item) => (
                <Card key={item.id} className="group">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                        onClick={() => deleteItem(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {NEXT_STATUS[item.kanbanStatus] && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-6 text-xs gap-1"
                        onClick={() => moveItem(item, NEXT_STATUS[item.kanbanStatus]!)}
                      >
                        <ArrowRight className="h-3 w-3" />
                        {NEXT_LABEL[item.kanbanStatus]}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add form only in TODO column */}
            {col.key === 'TODO' && (
              <div>
                {showAddForm ? (
                  <Card>
                    <CardContent className="p-3 space-y-2">
                      <Input
                        placeholder="Item title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && addItem()}
                      />
                      <Textarea
                        placeholder="Description (optional)"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        rows={2}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={addItem} disabled={addingItem || !newTitle.trim()}>
                          {addingItem ? 'Adding...' : 'Add'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setShowAddForm(false); setNewTitle(''); setNewDescription('') }}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full gap-1.5 text-muted-foreground"
                    onClick={() => setShowAddForm(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Item
                  </Button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
