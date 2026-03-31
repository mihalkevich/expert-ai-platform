'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ExternalLink, Loader2, Sparkles, CheckCheck, SkipForward, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

type PostStatus = 'PENDING' | 'COMMENTED' | 'SKIPPED' | 'FAILED'

interface MonitoredPost {
  id: string
  platform: string | null
  authorName: string | null
  authorHandle: string | null
  postContent: string | null
  postUrl: string | null
  relevanceScore: number
  status: PostStatus
  aiComment: string | null
  commentedAt: string | null
  topicMonitor?: {
    name: string
    niche: string | null
    commentTone: string | null
  }
}

interface PostCardProps {
  post: MonitoredPost
  onUpdated: () => void
}

const statusVariant: Record<PostStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  PENDING: 'default',
  COMMENTED: 'secondary',
  SKIPPED: 'outline',
  FAILED: 'destructive',
}

const statusLabel: Record<PostStatus, string> = {
  PENDING: 'Pending',
  COMMENTED: 'Commented',
  SKIPPED: 'Skipped',
  FAILED: 'Failed',
}

function platformColor(platform: string | null) {
  switch (platform) {
    case 'LINKEDIN':
      return 'bg-blue-600 text-white'
    case 'TWITTER':
      return 'bg-sky-400 text-white'
    case 'INSTAGRAM':
      return 'bg-pink-500 text-white'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export function PostCard({ post, onUpdated }: PostCardProps) {
  const [status, setStatus] = useState<PostStatus>(post.status)
  const [aiComment, setAiComment] = useState<string>(post.aiComment ?? '')
  const [commentedAt, setCommentedAt] = useState<string | null>(post.commentedAt)
  const [generating, setGenerating] = useState(false)
  const [approving, setApproving] = useState(false)
  const [skipping, setSkipping] = useState(false)

  const hasComment = aiComment.trim().length > 0
  const isDraftReady = status === 'PENDING' && hasComment

  async function handleDraft() {
    setGenerating(true)
    try {
      const res = await fetch(`/api/reputation/posts/${post.id}/draft`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate')
      setAiComment(data.aiComment ?? '')
      setStatus(data.status)
      toast.success('Comment drafted')
      onUpdated()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate comment')
    } finally {
      setGenerating(false)
    }
  }

  async function handleApprove() {
    setApproving(true)
    try {
      const res = await fetch(`/api/reputation/posts/${post.id}/approve`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to post')
      setStatus('COMMENTED')
      setCommentedAt(data.commentedAt ?? new Date().toISOString())
      toast.success('Comment posted')
      onUpdated()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to post comment')
    } finally {
      setApproving(false)
    }
  }

  async function handleSkip() {
    setSkipping(true)
    try {
      const res = await fetch(`/api/reputation/posts/${post.id}/skip`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to skip')
      setStatus('SKIPPED')
      toast.success('Post skipped')
      onUpdated()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to skip')
    } finally {
      setSkipping(false)
    }
  }

  async function handleRestore() {
    setSkipping(true)
    try {
      const patchRes = await fetch(`/api/reputation/posts/${post.id}/draft`, { method: 'POST' })
      if (!patchRes.ok) {
        setStatus('PENDING')
        setAiComment('')
        toast.success('Post restored')
        onUpdated()
        return
      }
      const data = await patchRes.json()
      setStatus('PENDING')
      setAiComment(data.aiComment ?? '')
      toast.success('Post restored with new draft')
      onUpdated()
    } catch {
      toast.error('Failed to restore post')
    } finally {
      setSkipping(false)
    }
  }

  const truncatedContent = post.postContent
    ? post.postContent.length > 200
      ? post.postContent.slice(0, 200) + '...'
      : post.postContent
    : ''

  const isSkipped = status === 'SKIPPED'

  return (
    <Card className={isSkipped ? 'opacity-60' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${platformColor(post.platform)}`}
            >
              {post.platform ?? 'Unknown'}
            </span>
            <span className="text-sm font-medium">
              {post.authorName ?? post.authorHandle ?? 'Unknown'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {Math.round(post.relevanceScore * 100)}% match
            </Badge>
            <Badge variant={statusVariant[status]} className="text-xs">
              {statusLabel[status]}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Post content */}
        <p className="text-sm text-muted-foreground leading-relaxed">{truncatedContent}</p>

        {post.postUrl && (
          <a
            href={post.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            View original post
          </a>
        )}

        {/* AI Comment section */}
        {isDraftReady && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Generated comment:</p>
            <Textarea
              value={aiComment}
              onChange={(e) => setAiComment(e.target.value)}
              rows={3}
              className="text-sm"
            />
          </div>
        )}

        {status === 'COMMENTED' && aiComment && (
          <div className="rounded-md bg-muted p-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Comment posted:</p>
            <p className="text-sm">{aiComment}</p>
            {commentedAt && (
              <p className="text-xs text-muted-foreground">
                {new Date(commentedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-1">
          {status === 'PENDING' && !hasComment && (
            <Button size="sm" onClick={handleDraft} disabled={generating} className="gap-1">
              {generating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Generate Comment
            </Button>
          )}

          {isDraftReady && (
            <>
              <Button size="sm" onClick={handleApprove} disabled={approving} className="gap-1">
                {approving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCheck className="h-3.5 w-3.5" />
                )}
                Post Comment
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSkip}
                disabled={skipping}
                className="gap-1"
              >
                {skipping ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <SkipForward className="h-3.5 w-3.5" />
                )}
                Skip
              </Button>
            </>
          )}

          {isSkipped && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRestore}
              disabled={skipping}
              className="gap-1"
            >
              {skipping ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" />
              )}
              Restore
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
