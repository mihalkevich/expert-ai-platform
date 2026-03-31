'use client'

import { useState, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

interface MonitorFormProps {
  onSuccess: () => void
  onCancel?: () => void
}

export function MonitorForm({ onSuccess, onCancel }: MonitorFormProps) {
  const [name, setName] = useState('')
  const [niche, setNiche] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  const [commentTone, setCommentTone] = useState('helpful')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)

  function addKeyword() {
    const kw = keywordInput.trim()
    if (kw && !keywords.includes(kw)) {
      setKeywords((prev) => [...prev, kw])
    }
    setKeywordInput('')
  }

  function handleKeywordKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword()
    }
  }

  function removeKeyword(kw: string) {
    setKeywords((prev) => prev.filter((k) => k !== kw))
  }

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error('Monitor name is required')
      return
    }
    if (keywords.length === 0) {
      toast.error('Add at least one keyword')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/reputation/monitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, keywords, niche, commentTone, isActive }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create monitor')
      toast.success('Monitor created')
      onSuccess()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="monitor-name">Monitor Name</Label>
        <Input
          id="monitor-name"
          placeholder="e.g. AI & SaaS Growth"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="monitor-niche">Niche</Label>
        <Input
          id="monitor-niche"
          placeholder="e.g. AI-powered SaaS tools"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="monitor-keywords">Keywords</Label>
        <div className="flex gap-2">
          <Input
            id="monitor-keywords"
            placeholder="Type keyword and press Enter"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={handleKeywordKeyDown}
          />
          <Button type="button" variant="secondary" onClick={addKeyword}>
            Add
          </Button>
        </div>
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {keywords.map((kw) => (
              <Badge key={kw} variant="secondary" className="gap-1">
                {kw}
                <button
                  type="button"
                  onClick={() => removeKeyword(kw)}
                  className="ml-1 rounded-full outline-none hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="monitor-tone">Comment Tone</Label>
        <Select value={commentTone} onValueChange={setCommentTone}>
          <SelectTrigger id="monitor-tone">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="helpful">Helpful</SelectItem>
            <SelectItem value="provocative">Provocative</SelectItem>
            <SelectItem value="educational">Educational</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <Switch id="monitor-active" checked={isActive} onCheckedChange={setIsActive} />
        <Label htmlFor="monitor-active">Active</Label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Monitor'
          )}
        </Button>
      </div>
    </div>
  )
}
