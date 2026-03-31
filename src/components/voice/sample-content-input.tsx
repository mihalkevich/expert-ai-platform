'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { X, Plus } from 'lucide-react'

const MAX_SAMPLES = 10

interface SampleContentInputProps {
  samples: string[]
  onChange: (samples: string[]) => void
}

export function SampleContentInput({ samples, onChange }: SampleContentInputProps) {
  const [draft, setDraft] = useState('')

  const handleAdd = () => {
    const trimmed = draft.trim()
    if (!trimmed || samples.length >= MAX_SAMPLES) return
    onChange([...samples, trimmed])
    setDraft('')
  }

  const handleRemove = (index: number) => {
    onChange(samples.filter((_, i) => i !== index))
  }

  const canAdd = draft.trim().length > 0 && samples.length < MAX_SAMPLES

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Writing Samples</Label>

      {samples.length > 0 && (
        <div className="space-y-2">
          {samples.map((sample, index) => (
            <div
              key={index}
              className="flex items-start gap-2 rounded-md border bg-muted/40 p-3"
            >
              <p className="flex-1 text-sm text-muted-foreground line-clamp-2">
                {sample.length > 100 ? `${sample.slice(0, 100)}…` : sample}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemove(index)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove sample</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      {samples.length < MAX_SAMPLES ? (
        <div className="space-y-2">
          <Textarea
            placeholder="Paste an example of your writing here (a blog post, LinkedIn post, newsletter, etc.)…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            className="resize-none text-sm"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {samples.length}/{MAX_SAMPLES} samples added
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!canAdd}
              onClick={handleAdd}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Sample
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Maximum of {MAX_SAMPLES} samples reached.
        </p>
      )}
    </div>
  )
}
