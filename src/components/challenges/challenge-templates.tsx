import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface Template {
  id: string
  title: string
  description: string
  duration: 7 | 14 | 30
  platforms: string[]
}

const TEMPLATES: Template[] = [
  {
    id: '30-days-content',
    title: '#30DaysOfContent',
    description: 'Create and share valuable content every day for 30 days to grow your audience and establish authority in your niche.',
    duration: 30,
    platforms: ['LINKEDIN', 'TWITTER'],
  },
  {
    id: '7-day-linkedin',
    title: '#7DayLinkedInChallenge',
    description: 'Transform your LinkedIn presence in one week with daily posts, engagement strategies, and profile optimization tips.',
    duration: 7,
    platforms: ['LINKEDIN'],
  },
  {
    id: '14-day-personal-brand',
    title: '#14DayPersonalBrand',
    description: 'Build a compelling personal brand in 14 days with a structured content plan covering your story, expertise, and values.',
    duration: 14,
    platforms: ['LINKEDIN', 'INSTAGRAM'],
  },
  {
    id: '30-days-code',
    title: '#30DaysOfCode',
    description: 'Share your coding journey daily for 30 days — learnings, projects, tips, and code snippets to inspire other developers.',
    duration: 30,
    platforms: ['TWITTER', 'LINKEDIN'],
  },
  {
    id: '7-day-thread',
    title: '#7DayThreadChallenge',
    description: 'Write one high-value Twitter thread per day for a week to rapidly grow your following and demonstrate expertise.',
    duration: 7,
    platforms: ['TWITTER'],
  },
]

const PLATFORM_LABELS: Record<string, string> = {
  LINKEDIN: 'LinkedIn',
  TWITTER: 'Twitter',
  INSTAGRAM: 'Instagram',
}

interface ChallengeTemplatesProps {
  onUseTemplate?: (template: { title: string; description: string; duration: number; platforms: string[] }) => void
}

export function ChallengeTemplates({ onUseTemplate }: ChallengeTemplatesProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {TEMPLATES.map((template) => (
        <Card key={template.id} className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{template.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            <p className="text-sm text-muted-foreground">{template.description}</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-xs">
                {template.duration} days
              </Badge>
              {template.platforms.map((p) => (
                <Badge key={p} variant="secondary" className="text-xs">
                  {PLATFORM_LABELS[p] ?? p}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              size="sm"
              className="w-full"
              onClick={() =>
                onUseTemplate?.({
                  title: template.title,
                  description: template.description,
                  duration: template.duration,
                  platforms: template.platforms,
                })
              }
            >
              Use Template
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
