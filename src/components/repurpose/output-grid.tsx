'use client'

import { Button } from '@/components/ui/button'
import { OutputCard, type Output } from '@/components/repurpose/output-card'
import { toast } from 'sonner'
import { Download, Copy } from 'lucide-react'
import { PLATFORM_LABELS } from '@/lib/constants'

interface OutputGridProps {
  outputs: Output[]
  onUpdate: (updated: Output) => void
}

export function OutputGrid({ outputs, onUpdate }: OutputGridProps) {
  const getContent = (output: Output) =>
    output.isEdited && output.editedContent ? output.editedContent : output.content

  const handleDownloadAll = () => {
    const lines: string[] = []
    for (const output of outputs) {
      const label = PLATFORM_LABELS[output.platform]
      lines.push(`=== ${label} ===`)
      lines.push(getContent(output))
      lines.push('')
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `repurposed-content-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded all content')
  }

  const handleCopyAll = async () => {
    const lines: string[] = []
    for (const output of outputs) {
      const label = PLATFORM_LABELS[output.platform]
      lines.push(`=== ${label} ===`)
      lines.push(getContent(output))
      lines.push('')
    }
    await navigator.clipboard.writeText(lines.join('\n'))
    toast.success('All content copied to clipboard')
  }

  if (outputs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">No outputs generated yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {outputs.length} platform{outputs.length === 1 ? '' : 's'} generated
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopyAll}>
            <Copy className="h-3.5 w-3.5" />
            Copy All
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownloadAll}>
            <Download className="h-3.5 w-3.5" />
            Download All
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {outputs.map((output) => (
          <OutputCard key={output.id} output={output} onUpdate={onUpdate} />
        ))}
      </div>
    </div>
  )
}
