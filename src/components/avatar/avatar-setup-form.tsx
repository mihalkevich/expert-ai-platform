'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

interface AvatarData {
  id: string
  name: string
  greeting: string | null
  boundaries: string | null
  isActive: boolean
  avatarUrl: string | null
}

interface AvatarSetupFormProps {
  avatar?: AvatarData
  onSuccess: (avatar: AvatarData) => void
}

export function AvatarSetupForm({ avatar, onSuccess }: AvatarSetupFormProps) {
  const isEditing = !!avatar

  const [name, setName] = useState(avatar?.name ?? '')
  const [greeting, setGreeting] = useState(avatar?.greeting ?? '')
  const [boundaries, setBoundaries] = useState(avatar?.boundaries ?? '')
  const [isActive, setIsActive] = useState(avatar?.isActive ?? false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Avatar name is required')
      return
    }

    setLoading(true)
    try {
      const url = isEditing ? `/api/avatar/${avatar.id}` : '/api/avatar'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          greeting: greeting.trim() || null,
          boundaries: boundaries.trim() || null,
          isActive,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to save avatar')
      }

      const saved = await res.json()
      toast.success(isEditing ? 'Avatar updated' : 'Avatar created')
      onSuccess(saved)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save avatar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="avatar-name">Avatar Name</Label>
        <Input
          id="avatar-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Alex, Support Bot..."
          disabled={loading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatar-greeting">Greeting / Persona</Label>
        <Textarea
          id="avatar-greeting"
          value={greeting}
          onChange={(e) => setGreeting(e.target.value)}
          placeholder="How should this avatar introduce itself? What tone should it use?"
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatar-boundaries">Boundaries & Constraints</Label>
        <Textarea
          id="avatar-boundaries"
          value={boundaries}
          onChange={(e) => setBoundaries(e.target.value)}
          placeholder="What topics should the avatar avoid? Any rules it must follow?"
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="avatar-active"
          checked={isActive}
          onCheckedChange={setIsActive}
          disabled={loading}
        />
        <Label htmlFor="avatar-active" className="cursor-pointer">
          Active (avatar responds to visitors)
        </Label>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        {isEditing ? 'Save Changes' : 'Create Avatar'}
      </Button>
    </form>
  )
}
