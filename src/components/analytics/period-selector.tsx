'use client'

type Period = '7d' | '30d' | '90d'

interface PeriodSelectorProps {
  value: Period
  onChange: (period: Period) => void
}

const PERIODS: { label: string; value: Period }[] = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
]

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex rounded-md border border-border overflow-hidden">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={[
            'px-3 py-1.5 text-sm font-medium transition-colors',
            value === p.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-muted-foreground hover:bg-muted',
          ].join(' ')}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
