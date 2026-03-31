'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, CheckCheck, EyeOff, Send, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'

type InboxStatus = 'NEW' | 'AI_DRAFTED' | 'REPLIED' | 'IGNORED'
type InboxType = 'COMMENT' | 'DM' | 'MENTION'

export interface InboxItemData {
  id: string
  type: InboxType
  status: InboxStatus
  sentiment: string | null
  priority: number
  authorName: string | null
  authorHandle: string | null
  authorAvatarUrl: string | null
  content: string
  aiDraftReply: string | null
  repliedAt: string | null
  createdAt: string
  socialAccount?: {
    platform: string
    username: string | null
  } | null
}

interface InboxItemCardProps {
  item: InboxItemData
  onUpdated: () => void
}

const statusVariant: Record<InboxStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  NEW: 'default',
  AI_DRAFTED: 'secondary',
  REPLIED: 'outline',
  IGNORED: 'destructive',
}

const statusLabel: Record<InboxStatus, string> = {
  NEW: 'New',
  AI_DRAFTED: 'AI Drafted',
  REPLIED: 'Replied',
  IGNORED: 'Ignored',
}

const typeLabel: Record<InboxType, string> = {
  COMMENT: 'Comment',
  DM: 'DM',
  MENTION: 'Mention',
}

function platformColor(platform: string | null | undefined) {
  switch (platform) {
    case 'LINKEDIN':
      return 'bg-blue-600 text-white'
    case 'TWITTER':
      return 'bg-sky-400 text-white'
    case 'INSTAGRAM':
      return 'bg-pink-500 text-white'
    case 'NEWSLETTER':
      return 'bg-purple-500 text-white'
    case 'BLOG':
      return 'bg-orange-500 text-white'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

function sentimentColor(sentiment: string | null) {
  switch (sentiment) {
    case 'positive':
      return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
    case 'negative':
      return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

function getInitials(name: string | null, handle: string | null) {
  const src = name ?? handle ?? '?'
  return src.replace('@', '').slice(0, 2).toUpperCase()
}

export function InboxItemCard({ item, onUpdated }: InboxItemCardProps) {
  const [status, setStatus] = useState<InboxStatus>(item.status)
  const [draft, setDraft] = useState<string>(item.aiDraftReply ?? '')
  const [expanded, setExpanded] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [replying, setReplying] = useState(false)
  const [ignoring, setIgnoring] = useState(false)

  const platform = item.socialAccount?.platform ?? null

  async function handleDraftReply() {
    setGenerating(true)
    try {
      const res = await fetch(`/api/inbox/${item.id}/draft`, { method: 'POST' })
      const data = await res.json() as { draft?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate draft')
      setDraft(data.draft ?? '')
      setStatus('AI_DRAFTED')
      setExpanded(true)
      toast.success('Reply drafted')
      onUpdated()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate draft')
    } finally {
      setGenerating(false)
    }
  }

  async function handleMarkReplied() {
    setReplying(true)
    try {
      const res = await fetch(`/api/inbox/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REPLIED' }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to update')
      setStatus('REPLIED')
      toast.success('Marked as replied')
      onUpdated()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setReplying(false)
    }
  }

  async function handleSendReply() {
    setReplying(true)
    try {
      const res = await fetch(`/api/inbox/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REPLIED', aiDraftReply: draft }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to send')
      setStatus('REPLIED')
      toast.success('Reply sent')
      onUpdated()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reply')
    } finally {
      setReplying(false)
    }
  }

  async function handleIgnore() {
    setIgnoring(true)
    try {
      const res = await fetch(`/api/inbox/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IGNORED' }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to ignore')
      setStatus('IGNORED')
      toast.success('Ignored')
      onUpdated()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to ignore')
    } finally {
      setIgnoring(false)
    }
  }

  const isIgnored = status === 'IGNORED'
  const isReplied = status === 'REPLIED'
  const truncatedContent =
    item.content.length > 220 ? item.content.slice(0, 220) + '...' : item.content

  return (
    <Card className={isIgnored ? 'opacity-60' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {/* Avatar */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
              {item.authorAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.authorAvatarUrl}
                  alt={item.authorName ?? 'avatar'}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                getInitials(item.authorName, item.authorHandle)
              )}
            </div>
            <div>
              <p className="text-sm font-medium leading-none">
                {item.authorName ?? item.authorHandle ?? 'Unknown'}
              </p>
              {item.authorHandle && item.authorName && (
                <p className="mt-0.5 text-xs text-muted-foreground">{item.authorHandle}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 justify-end">
            {platform && (
              <span
                className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${platformColor(platform)}`}
              >
                {platform}
              </span>
            )}
            <Badge variant="outline" className="text-xs">
              {typeLabel[item.type]}
            </Badge>
            {item.sentiment && (
              <span
                className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${sentimentColor(item.sentiment)}`}
              >
                {item.sentiment}
              </span>
            )}
            <Badge variant={statusVariant[status]} className="text-xs">
              {statusLabel[status]}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">{truncatedContent}</p>

        {item.content.length > 220 && (
          <button
            className="text-xs text-primary hover:underline"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? (
              <span className="inline-flex items-center gap-1">
                <ChevronUp className="h-3 w-3" /> Show less
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <ChevronDown className="h-3 w-3" /> Show more
              </span>
            )}
          </button>
        )}

        {expanded && item.content.length > 220 && (
          <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
        )}

        {/* AI Draft section */}
        {(status === 'AI_DRAFTED' || expanded) && draft && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">AI Draft Reply:</p>
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              className="text-sm"
              disabled={isReplied || isIgnored}
            />
          </div>
        )}

        {isReplied && item.repliedAt && (
          <p className="text-xs text-muted-foreground">
            Replied {new Date(item.repliedAt).toLocaleDateString()}
          </p>
        )}

        {/* Actions */}
        {!isReplied && !isIgnored && (
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDraftReply}
              disabled={generating}
              className="gap-1"
            >
              {generating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Draft Reply
            </Button>

            {status === 'AI_DRAFTED' && draft && (
              <Button
                size="sm"
                onClick={handleSendReply}
                disabled={replying}
                className="gap-1"
              >
                {replying ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Send Reply
              </Button>
            )}

            <Button
              size="sm"
              variant="secondary"
              onClick={handleMarkReplied}
              disabled={replying}
              className="gap-1"
            >
              {replying && status !== 'AI_DRAFTED' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5" />
              )}
              Mark Replied
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleIgnore}
              disabled={ignoring}
              className="gap-1"
            >
              {ignoring ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
              Ignore
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
