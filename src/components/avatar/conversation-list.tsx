'use client'

import { Badge } from '@/components/ui/badge'
import { MessageSquare, User } from 'lucide-react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

interface Conversation {
  id: string
  visitorName: string | null
  messages: unknown
  startedAt: string | Date
}

interface ConversationListProps {
  conversations: Conversation[]
}

function parseMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return []
  return raw as ChatMessage[]
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ConversationList({ conversations }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
        <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-sm font-medium">No conversations yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Conversations will appear here once visitors start chatting with your avatar.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {conversations.map((convo) => {
        const msgs = parseMessages(convo.messages)
        const userMessages = msgs.filter((m) => m.role === 'user')
        const preview = userMessages[0]?.content

        return (
          <div key={convo.id} className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {convo.visitorName ?? 'Anonymous Visitor'}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(convo.startedAt)}</p>
                </div>
              </div>
              <Badge variant="secondary" className="shrink-0 text-xs">
                {msgs.length} message{msgs.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            {preview && (
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground pl-10">{preview}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
