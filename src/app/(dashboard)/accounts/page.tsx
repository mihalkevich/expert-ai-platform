'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { CheckCircle, Link as LinkIcon, Loader2, Unlink } from 'lucide-react'
import { toast } from 'sonner'

interface SocialAccount {
  id: string
  platform: string
  username: string | null
  avatarUrl: string | null
  isActive: boolean
  connectedAt: string
}

interface PlatformDef {
  id: string
  label: string
  icon: React.ReactNode
  description: string
  permissions: string[]
}

const PLATFORM_DEFS: PlatformDef[] = [
  {
    id: 'LINKEDIN',
    label: 'LinkedIn',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-[#0A66C2]">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    description: 'Post updates, articles, and engage with your professional network.',
    permissions: ['Read your profile', 'Post on your behalf', 'Access your connections'],
  },
  {
    id: 'TWITTER',
    label: 'X / Twitter',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-foreground">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 5.895zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    description: 'Share tweets, threads, and engage with followers in real time.',
    permissions: ['Read your profile', 'Post tweets', 'Read your timeline'],
  },
  {
    id: 'INSTAGRAM',
    label: 'Instagram',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        <defs>
          <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f09433" />
            <stop offset="25%" stopColor="#e6683c" />
            <stop offset="50%" stopColor="#dc2743" />
            <stop offset="75%" stopColor="#cc2366" />
            <stop offset="100%" stopColor="#bc1888" />
          </linearGradient>
        </defs>
        <path
          fill="url(#ig-grad)"
          d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"
        />
      </svg>
    ),
    description: 'Share posts, reels, and stories with your Instagram followers.',
    permissions: ['Read your profile', 'Post content', 'Access insights'],
  },
]

export default function ConnectedAccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [disconnectId, setDisconnectId] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/social')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setAccounts(data)
    } catch {
      toast.error('Failed to load connected accounts.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const handleDisconnect = async () => {
    if (!disconnectId) return
    setDisconnecting(true)
    try {
      const res = await fetch(`/api/social/${disconnectId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error ?? 'Failed to disconnect account.')
        return
      }
      toast.success('Account disconnected.')
      setAccounts((prev) => prev.filter((a) => a.id !== disconnectId))
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setDisconnecting(false)
      setDisconnectId(null)
    }
  }

  const connectedByPlatform = Object.fromEntries(
    accounts.map((a) => [a.platform, a]),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Connected Accounts</h1>
        <p className="text-muted-foreground">
          Link your social platforms to publish repurposed content directly.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORM_DEFS.map((platform) => {
          const connected = connectedByPlatform[platform.id]

          return (
            <Card key={platform.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {platform.icon}
                    <CardTitle className="text-base">{platform.label}</CardTitle>
                  </div>
                  {loading ? (
                    <Skeleton className="h-5 w-20" />
                  ) : connected ? (
                    <Badge variant="secondary" className="gap-1 text-xs text-green-700 dark:text-green-400">
                      <CheckCircle className="h-3 w-3" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      Not connected
                    </Badge>
                  )}
                </div>
                {connected && (
                  <CardDescription className="text-xs">
                    @{connected.username ?? 'unknown'} &mdash; connected{' '}
                    {new Date(connected.connectedAt).toLocaleDateString()}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="flex flex-1 flex-col justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{platform.description}</p>
                  <div className="mt-2 space-y-0.5">
                    <p className="text-xs font-medium text-muted-foreground">Permissions:</p>
                    {platform.permissions.map((p) => (
                      <p key={p} className="text-xs text-muted-foreground">• {p}</p>
                    ))}
                  </div>
                </div>

                {loading ? (
                  <Skeleton className="h-9 w-full" />
                ) : connected ? (
                  <Dialog
                    open={disconnectId === connected.id}
                    onOpenChange={(open) => !open && setDisconnectId(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-destructive hover:bg-destructive/10"
                        onClick={() => setDisconnectId(connected.id)}
                      >
                        <Unlink className="mr-2 h-3.5 w-3.5" />
                        Disconnect
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Disconnect {platform.label}?</DialogTitle>
                        <DialogDescription>
                          This will remove your {platform.label} connection. You can reconnect at any
                          time. Scheduled posts may fail if not yet published.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setDisconnectId(null)}
                          disabled={disconnecting}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDisconnect}
                          disabled={disconnecting}
                        >
                          {disconnecting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Disconnecting…
                            </>
                          ) : (
                            'Disconnect'
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => toast.info(`${platform.label} OAuth coming soon.`)}
                  >
                    <LinkIcon className="mr-2 h-3.5 w-3.5" />
                    Connect {platform.label}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">About permissions</p>
        <p className="mt-1">
          We only request the minimum permissions needed to post on your behalf. We never read your
          direct messages or access contacts. You can revoke access at any time from your social
          platform&rsquo;s app settings.
        </p>
      </div>
    </div>
  )
}
