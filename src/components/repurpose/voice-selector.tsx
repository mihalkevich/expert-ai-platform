'use client'

import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Mic, Plus } from 'lucide-react'

interface VoiceProfileOption {
  id: string
  name: string
  description?: string | null
}

interface VoiceSelectorProps {
  voiceProfileId?: string
  onChange: (id: string | undefined) => void
}

export function VoiceSelector({ voiceProfileId, onChange }: VoiceSelectorProps) {
  const [profiles, setProfiles] = useState<VoiceProfileOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await fetch('/api/voice-profiles')
        if (!res.ok) throw new Error('Failed to load voice profiles')
        const data = await res.json()
        setProfiles(data.profiles ?? data ?? [])
      } catch {
        setError('Could not load voice profiles')
      } finally {
        setLoading(false)
      }
    }
    fetchProfiles()
  }, [])

  const handleChange = (value: string) => {
    onChange(value === 'default' ? undefined : value)
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium">Voice Profile</p>
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Voice Profile</p>

      <Select value={voiceProfileId ?? 'default'} onValueChange={handleChange}>
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Select a voice profile" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">
            <div className="flex flex-col">
              <span className="font-medium">Default (Generic)</span>
              <span className="text-xs text-muted-foreground">Standard AI writing style</span>
            </div>
          </SelectItem>

          {error && (
            <SelectItem value="__error__" disabled>
              <span className="text-destructive text-xs">{error}</span>
            </SelectItem>
          )}

          {!error && profiles.length === 0 && (
            <SelectItem value="__empty__" disabled>
              <span className="text-xs text-muted-foreground">No profiles yet</span>
            </SelectItem>
          )}

          {profiles.map((profile) => (
            <SelectItem key={profile.id} value={profile.id}>
              <div className="flex flex-col">
                <span className="font-medium">{profile.name}</span>
                {profile.description && (
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {profile.description}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Link
        href="/voice"
        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
      >
        <Plus className="h-3 w-3" />
        Create new voice profile
      </Link>
    </div>
  )
}
