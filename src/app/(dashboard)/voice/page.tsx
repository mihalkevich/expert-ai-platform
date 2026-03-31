import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Mic, SlidersHorizontal } from 'lucide-react'

export default async function VoiceProfilesPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  const profiles = await prisma.voiceProfile.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Voice Profiles</h1>
          <p className="text-muted-foreground">
            Capture your unique writing style so AI can generate content that sounds like you.
          </p>
        </div>
        <Button asChild>
          <Link href="/voice/new">
            <Plus className="mr-2 h-4 w-4" />
            Create New Profile
          </Link>
        </Button>
      </div>

      {/* Grid */}
      {profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <Mic className="mb-4 h-10 w-10 text-muted-foreground" />
          <h2 className="text-lg font-semibold">No voice profiles yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Create your first voice profile to teach the AI how you write. Add writing samples and
            tone preferences for the most accurate results.
          </p>
          <Button asChild className="mt-6">
            <Link href="/voice/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Profile
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <Link key={profile.id} href={`/voice/${profile.id}`} className="group block">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">{profile.name}</CardTitle>
                    {profile.industry && (
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {profile.industry}
                      </Badge>
                    )}
                  </div>
                  {profile.targetAudience && (
                    <CardDescription className="line-clamp-1 text-xs">
                      Audience: {profile.targetAudience}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Tone preview bars */}
                  <div className="space-y-1.5">
                    {(
                      [
                        ['Formality', profile.formalityCasual],
                        ['Energy', profile.seriousFun],
                        ['Complexity', profile.technicalSimple],
                        ['Brevity', profile.conciseVerbose],
                      ] as [string, number][]
                    ).map(([label, value]) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className="w-20 shrink-0 text-xs text-muted-foreground">{label}</span>
                        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <SlidersHorizontal className="h-3 w-3" />
                    <span>{profile.sampleTexts.length} writing sample{profile.sampleTexts.length !== 1 ? 's' : ''}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
