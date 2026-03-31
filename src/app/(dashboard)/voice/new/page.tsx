'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { VoiceProfileForm } from '@/components/voice/voice-profile-form'
import { ChevronRight } from 'lucide-react'

export default function NewVoiceProfilePage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/voice" className="hover:text-foreground hover:underline">
          Voice Profiles
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">New Profile</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Voice Profile</h1>
        <p className="text-muted-foreground">
          Define your unique writing style so AI generates content that sounds authentically like you.
        </p>
      </div>

      <div className="max-w-2xl">
        <VoiceProfileForm onSuccess={() => router.push('/voice')} />
      </div>
    </div>
  )
}
