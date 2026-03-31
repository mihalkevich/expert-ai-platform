'use client'

import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

interface ToneSlidersProps {
  values: Record<string, number>
  onChange: (key: string, value: number) => void
}

interface SliderConfig {
  key: string
  leftLabel: string
  rightLabel: string
  getLabel: (value: number) => string
}

function getToneLabel(value: number, leftLabel: string, rightLabel: string): string {
  if (value < 20) return `Very ${leftLabel}`
  if (value < 40) return `Slightly ${leftLabel}`
  if (value >= 40 && value <= 60) return 'Balanced'
  if (value < 80) return `Slightly ${rightLabel}`
  return `Very ${rightLabel}`
}

const SLIDERS: SliderConfig[] = [
  {
    key: 'formalityCasual',
    leftLabel: 'Formal',
    rightLabel: 'Casual',
    getLabel: (v) => getToneLabel(v, 'Formal', 'Casual'),
  },
  {
    key: 'seriousFun',
    leftLabel: 'Serious',
    rightLabel: 'Fun',
    getLabel: (v) => getToneLabel(v, 'Serious', 'Fun'),
  },
  {
    key: 'technicalSimple',
    leftLabel: 'Technical',
    rightLabel: 'Simple',
    getLabel: (v) => getToneLabel(v, 'Technical', 'Simple'),
  },
  {
    key: 'conciseVerbose',
    leftLabel: 'Concise',
    rightLabel: 'Verbose',
    getLabel: (v) => getToneLabel(v, 'Concise', 'Verbose'),
  },
]

export function ToneSliders({ values, onChange }: ToneSlidersProps) {
  return (
    <div className="space-y-6">
      {SLIDERS.map((slider) => {
        const value = values[slider.key] ?? 50
        return (
          <div key={slider.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                {slider.leftLabel} ↔ {slider.rightLabel}
              </Label>
              <span className="text-xs text-muted-foreground font-medium">
                {slider.getLabel(value)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-right text-xs text-muted-foreground">
                {slider.leftLabel}
              </span>
              <Slider
                value={[value]}
                onValueChange={([v]) => onChange(slider.key, v)}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="w-20 shrink-0 text-xs text-muted-foreground">
                {slider.rightLabel}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
