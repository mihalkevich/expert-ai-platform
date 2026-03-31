'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Trash2, Eye, Wand2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GeneratePostDialog } from './generate-post-dialog'

interface Employee {
  id: string
  name: string
  role: string
  personality: Record<string, unknown>
  avatarUrl: string | null
  isActive: boolean
  _count?: { contentPlans: number }
}

interface EmployeeCardProps {
  employee: Employee
  onDeleted?: () => void
  onUpdated?: () => void
}

const ROLE_LABELS: Record<string, string> = {
  AMBASSADOR: 'Ambassador',
  SALES: 'Sales',
  SUPPORT: 'Support',
  THOUGHT_LEADER: 'Thought Leader',
}

const ROLE_COLORS: Record<string, string> = {
  AMBASSADOR: 'bg-blue-100 text-blue-800',
  SALES: 'bg-green-100 text-green-800',
  SUPPORT: 'bg-orange-100 text-orange-800',
  THOUGHT_LEADER: 'bg-purple-100 text-purple-800',
}

const AVATAR_COLORS = [
  'bg-red-400',
  'bg-orange-400',
  'bg-yellow-400',
  'bg-green-400',
  'bg-teal-400',
  'bg-blue-400',
  'bg-indigo-400',
  'bg-purple-400',
  'bg-pink-400',
]

function getAvatarColor(name: string): string {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function EmployeeCard({ employee, onDeleted, onUpdated }: EmployeeCardProps) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)

  const personalityTraits = Object.entries(employee.personality)
    .slice(0, 3)
    .map(([, v]) => String(v))

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/employees/${employee.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Employee deleted')
      setDeleteOpen(false)
      onDeleted?.()
    } catch {
      toast.error('Failed to delete employee')
    } finally {
      setDeleting(false)
    }
  }

  async function handleToggleActive(checked: boolean) {
    setToggling(true)
    try {
      const res = await fetch(`/api/employees/${employee.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: checked }),
      })
      if (!res.ok) throw new Error('Failed to update')
      onUpdated?.()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setToggling(false)
    }
  }

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white font-semibold text-sm ${
                employee.avatarUrl ? '' : getAvatarColor(employee.name)
              }`}
              style={employee.avatarUrl ? { backgroundImage: `url(${employee.avatarUrl})`, backgroundSize: 'cover' } : undefined}
            >
              {!employee.avatarUrl && getInitials(employee.name)}
            </div>

            {/* Name + role */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{employee.name}</h3>
              <span
                className={`inline-block mt-1 rounded px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[employee.role] ?? 'bg-gray-100 text-gray-800'}`}
              >
                {ROLE_LABELS[employee.role] ?? employee.role}
              </span>
            </div>

            {/* Active toggle */}
            <Switch
              checked={employee.isActive}
              onCheckedChange={handleToggleActive}
              disabled={toggling}
              aria-label="Active"
            />
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 flex-1">
          {/* Personality traits */}
          {personalityTraits.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {personalityTraits.map((trait, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {trait}
                </Badge>
              ))}
            </div>
          )}

          {/* Stats */}
          <p className="text-xs text-muted-foreground">
            {employee._count?.contentPlans ?? 0} content plans
          </p>

          {/* Actions */}
          <div className="flex gap-2 mt-auto pt-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1 gap-1"
              onClick={() => setGenerateOpen(true)}
            >
              <Wand2 className="h-3 w-3" />
              Generate Post
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/employees/${employee.id}`)}
            >
              <Eye className="h-4 w-4" />
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
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {employee.name}? This cannot be undone.
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

      {/* Generate post dialog */}
      <GeneratePostDialog
        employeeId={employee.id}
        employeeName={employee.name}
        open={generateOpen}
        onOpenChange={setGenerateOpen}
      />
    </>
  )
}
