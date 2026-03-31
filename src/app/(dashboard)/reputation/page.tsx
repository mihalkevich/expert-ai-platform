'use client'

import { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { MonitorCard } from '@/components/reputation/monitor-card'
import { MonitorForm } from '@/components/reputation/monitor-form'
import { PostCard } from '@/components/reputation/post-card'
import { ReputationStats } from '@/components/reputation/reputation-stats'
import { Plus, FlaskConical, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface TopicMonitor {
  id: string
  name: string
  keywords: string[]
  niche: string | null
  commentTone: string | null
  isActive: boolean
  createdAt: string
  _count?: { monitoredPosts: number }
}

interface MonitoredPost {
  id: string
  platform: string | null
  authorName: string | null
  authorHandle: string | null
  postContent: string | null
  postUrl: string | null
  relevanceScore: number
  status: 'PENDING' | 'COMMENTED' | 'SKIPPED' | 'FAILED'
  aiComment: string | null
  commentedAt: string | null
  topicMonitor?: { name: string; niche: string | null; commentTone: string | null }
}

export default function ReputationPage() {
  const [tab, setTab] = useState('monitors')
  const [monitors, setMonitors] = useState<TopicMonitor[]>([])
  const [posts, setPosts] = useState<MonitoredPost[]>([])
  const [monitorsLoading, setMonitorsLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [activeMonitorId, setActiveMonitorId] = useState<string | null>(null)

  const fetchMonitors = useCallback(async () => {
    setMonitorsLoading(true)
    try {
      const res = await fetch('/api/reputation/monitors')
      const data = await res.json()
      if (res.ok) setMonitors(data)
    } catch {
      toast.error('Failed to load monitors')
    } finally {
      setMonitorsLoading(false)
    }
  }, [])

  const fetchPosts = useCallback(async (monitorId?: string) => {
    setPostsLoading(true)
    try {
      const params = new URLSearchParams()
      if (monitorId) params.set('monitorId', monitorId)
      const res = await fetch(`/api/reputation/posts?${params.toString()}`)
      const data = await res.json()
      if (res.ok) setPosts(data)
    } catch {
      toast.error('Failed to load posts')
    } finally {
      setPostsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMonitors()
  }, [fetchMonitors])

  useEffect(() => {
    if (tab === 'posts') {
      fetchPosts(activeMonitorId ?? undefined)
    }
  }, [tab, fetchPosts, activeMonitorId])

  function handleViewPosts(monitorId: string) {
    setActiveMonitorId(monitorId)
    setTab('posts')
  }

  async function handleSeed() {
    setSeeding(true)
    try {
      const res = await fetch('/api/reputation/seed', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Seed failed')
      toast.success(`Seeded: 1 monitor + ${data.postsCreated} posts`)
      await fetchMonitors()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Seed failed')
    } finally {
      setSeeding(false)
    }
  }

  const pendingPosts = posts.filter((p) => p.status === 'PENDING' || p.status === 'FAILED')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reputation Builder</h1>
          <p className="text-muted-foreground">
            Monitor conversations and post expert comments to grow your authority.
          </p>
        </div>
        {process.env.NODE_ENV !== 'production' && (
          <Button variant="outline" size="sm" onClick={handleSeed} disabled={seeding}>
            {seeding ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FlaskConical className="mr-2 h-4 w-4" />
            )}
            Seed Test Data
          </Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="monitors">Monitors</TabsTrigger>
          <TabsTrigger value="posts">
            Pending Posts
            {pendingPosts.length > 0 && (
              <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                {pendingPosts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        {/* Monitors Tab */}
        <TabsContent value="monitors" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Monitor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>New Topic Monitor</DialogTitle>
                </DialogHeader>
                <MonitorForm
                  onSuccess={() => {
                    setAddOpen(false)
                    fetchMonitors()
                  }}
                  onCancel={() => setAddOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          {monitorsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <Skeleton key={n} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : monitors.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
              <p className="text-muted-foreground">No monitors yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a monitor to start tracking conversations.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {monitors.map((monitor) => (
                <MonitorCard
                  key={monitor.id}
                  monitor={monitor}
                  onViewPosts={handleViewPosts}
                  onDeleted={fetchMonitors}
                  onUpdated={fetchMonitors}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {activeMonitorId
                ? `Showing posts for selected monitor`
                : 'All pending posts across monitors'}
            </p>
            {activeMonitorId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActiveMonitorId(null)
                  fetchPosts(undefined)
                }}
              >
                Clear filter
              </Button>
            )}
          </div>

          {postsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <Skeleton key={n} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
              <p className="text-muted-foreground">No posts found.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Use &quot;Seed Test Data&quot; to add sample posts for testing.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onUpdated={() => fetchPosts(activeMonitorId ?? undefined)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="mt-4">
          <ReputationStats />
        </TabsContent>
      </Tabs>
    </div>
  )
}
