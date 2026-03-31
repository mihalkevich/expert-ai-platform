'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Copy,
  Check,
  Pencil,
  Save,
  X,
  RefreshCw,
  Loader2,
  Globe,
  X as XIcon,
  AtSign,
  Mail,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PLATFORM_LABELS, PLATFORM_CHAR_LIMITS, type Platform } from '@/lib/constants'

export interface Output {
  id: string
  platform: Platform
  content: string
  editedContent?: string | null
  isEdited?: boolean
  charCount: number
  version: number
  createdAt: string
}

interface OutputCardProps {
  output: Output
  onUpdate: (updated: Output) => void
}

const PLATFORM_ICONS: Record<Platform, React.ComponentType<{ className?: string }>> = {
  LINKEDIN: Globe,
  TWITTER: XIcon,
  INSTAGRAM: AtSign,
  NEWSLETTER: Mail,
  BLOG: BookOpen,
}

const PLATFORM_COLORS: Record<Platform, string> = {
  LINKEDIN: 'text-blue-600 dark:text-blue-400',
  TWITTER: 'text-foreground',
  INSTAGRAM: 'text-pink-600 dark:text-pink-400',
  NEWSLETTER: 'text-orange-600 dark:text-orange-400',
  BLOG: 'text-green-600 dark:text-green-400',
}

export function OutputCard({ output, onUpdate }: OutputCardProps) {
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(output.editedContent ?? output.content)
  const [saving, setSaving] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  const displayContent = output.isEdited && output.editedContent ? output.editedContent : output.content
  const charLimit = PLATFORM_CHAR_LIMITS[output.platform]
  const charCount = displayContent.length
  const overLimit = charCount > charLimit

  const Icon = PLATFORM_ICONS[output.platform]

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayContent)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEditToggle = () => {
    if (editing) {
      setEditValue(displayContent)
    } else {
      setEditValue(displayContent)
    }
    setEditing(!editing)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/outputs/${output.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editValue }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Save failed')
      onUpdate({ ...output, editedContent: editValue, isEdited: true })
      setEditing(false)
      toast.success('Changes saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    try {
      const res = await fetch(`/api/outputs/${output.id}/regenerate`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Regeneration failed')
      onUpdate({ ...output, ...data.output })
      setEditValue(data.output.content)
      toast.success('Content regenerated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to regenerate')
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', PLATFORM_COLORS[output.platform])} />
          <span className="font-semibold text-sm">{PLATFORM_LABELS[output.platform]}</span>
          {output.version > 1 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              v{output.version}
            </Badge>
          )}
          {output.isEdited && (
            <Badge variant="outline" className="h-5 px-1.5 text-xs">
              Edited
            </Badge>
          )}
        </div>
        <Badge
          variant={overLimit ? 'destructive' : 'secondary'}
          className="h-5 px-1.5 text-xs"
        >
          {charCount.toLocaleString()} / {charLimit.toLocaleString()}
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        {editing ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[160px] resize-y text-sm"
            autoFocus
          />
        ) : (
          <div className="min-h-[160px] rounded-md border bg-muted/30 p-3">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{displayContent}</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={handleCopy}
            disabled={regenerating}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={handleEditToggle}
            disabled={regenerating || saving}
          >
            {editing ? (
              <>
                <X className="h-3.5 w-3.5" />
                Cancel
              </>
            ) : (
              <>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </>
            )}
          </Button>

          {editing && (
            <Button
              size="sm"
              className="h-8 gap-1.5"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-8 gap-1.5"
            onClick={handleRegenerate}
            disabled={regenerating || saving || editing}
          >
            {regenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {regenerating ? 'Regenerating...' : 'Regenerate'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
