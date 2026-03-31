'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { VoiceProfileForm } from '@/components/voice/voice-profile-form'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ChevronRight, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface VoiceProfile {
  id: string
  name: string
  industry: string | null
  targetAudience: string | null
  customInstructions: string | null
  sampleTexts: string[]
  formalityCasual: number
  seriousFun: number
  technicalSimple: number
  conciseVerbose: number
}

export default function VoiceProfileEditorPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id

  const [profile, setProfile] = useState<VoiceProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/voice/${id}`)
        if (!res.ok) {
          toast.error('Voice profile not found.')
          router.push('/voice')
          return
        }
        const data = await res.json()
        setProfile(data)
      } catch {
        toast.error('Failed to load voice profile.')
        router.push('/voice')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [id, router])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/voice/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error ?? 'Failed to delete profile.')
        return
      }
      toast.success('Voice profile deleted.')
      router.push('/voice')
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/voice" className="hover:text-foreground hover:underline">
          Voice Profiles
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">
          {loading ? 'Loading…' : (profile?.name ?? 'Edit Profile')}
        </span>
      </nav>

      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {loading ? <Skeleton className="h-7 w-48" /> : 'Edit Voice Profile'}
          </h1>
        </div>
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete voice profile?</DialogTitle>
              <DialogDescription>
                This will permanently delete &ldquo;{profile?.name}&rdquo;. Any repurpose jobs using
                this profile will no longer have a voice profile associated.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  'Delete Profile'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Form */}
      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : profile ? (
        <VoiceProfileForm
          profile={profile}
          onSuccess={() => router.push('/voice')}
        />
      ) : null}
    </div>
  )
}
