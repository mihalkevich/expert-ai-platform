'use client'

import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AvatarSetupForm } from '@/components/avatar/avatar-setup-form'
import { KnowledgeEditor } from '@/components/avatar/knowledge-editor'
import { TestChat } from '@/components/avatar/test-chat'
import { ConversationList } from '@/components/avatar/conversation-list'
import { Bot, Loader2 } from 'lucide-react'

interface KnowledgeItem {
  id: string
  type: 'FAQ' | 'PRODUCT' | 'BIO' | 'CUSTOM'
  title: string | null
  content: string
  isActive: boolean
}

interface Conversation {
  id: string
  visitorName: string | null
  messages: unknown
  startedAt: string
}

interface AvatarData {
  id: string
  name: string
  greeting: string | null
  boundaries: string | null
  isActive: boolean
  avatarUrl: string | null
  knowledge: KnowledgeItem[]
  conversations: Conversation[]
}

export default function AvatarPage() {
  const [avatar, setAvatar] = useState<AvatarData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAvatar = useCallback(async () => {
    try {
      // First fetch the summary (with id)
      const listRes = await fetch('/api/avatar')
      if (!listRes.ok) return
      const summary = await listRes.json()
      if (!summary) {
        setAvatar(null)
        return
      }

      // Then fetch full details
      const detailRes = await fetch(`/api/avatar/${summary.id}`)
      if (!detailRes.ok) return
      const full: AvatarData = await detailRes.json()
      setAvatar(full)
    } catch {
      // silently ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchAvatar()
  }, [fetchAvatar])

  const handleAvatarCreated = async (created: { id: string; name: string; greeting: string | null; boundaries: string | null; isActive: boolean; avatarUrl: string | null }) => {
    // Fetch full details after creation
    try {
      const res = await fetch(`/api/avatar/${created.id}`)
      if (res.ok) {
        const full: AvatarData = await res.json()
        setAvatar(full)
      }
    } catch {
      // fallback to basic data
      setAvatar({ ...created, knowledge: [], conversations: [] })
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Empty state — no avatar yet
  if (!avatar) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Avatar</h1>
          <p className="text-muted-foreground">
            Create an AI avatar that can respond to visitor questions on your behalf.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <Bot className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">No avatar yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Create your AI avatar and teach it about yourself, your products, and how to answer
            common questions.
          </p>
        </div>

        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <CardTitle>Create Your Avatar</CardTitle>
            <CardDescription>Set up the basics to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <AvatarSetupForm onSuccess={handleAvatarCreated} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{avatar.name}</h1>
            <Badge variant={avatar.isActive ? 'default' : 'secondary'}>
              {avatar.isActive ? 'Active' : 'Offline'}
            </Badge>
          </div>
          <p className="text-muted-foreground">Manage your AI avatar settings and knowledge base.</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="setup">
        <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:inline-grid">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="test">Test Chat</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="mt-6">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Avatar Setup</CardTitle>
              <CardDescription>Configure your avatar&apos;s name, persona, and behavior.</CardDescription>
            </CardHeader>
            <CardContent>
              <AvatarSetupForm
                avatar={avatar}
                onSuccess={(updated) =>
                  setAvatar((prev) =>
                    prev ? { ...prev, ...updated } : null,
                  )
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>
                Teach your avatar facts, FAQs, and product information it can use when responding.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KnowledgeEditor
                avatarId={avatar.id}
                items={avatar.knowledge}
                onItemsChange={(items) => setAvatar((prev) => prev ? { ...prev, knowledge: items } : null)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Chat</CardTitle>
              <CardDescription>
                Try chatting with your avatar. Test conversations are not saved.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TestChat avatarId={avatar.id} avatarName={avatar.name} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
              <CardDescription>
                View the last 20 conversations visitors have had with your avatar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConversationList conversations={avatar.conversations} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
