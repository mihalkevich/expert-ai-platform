import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import {
  Eye,
  FileText,
  Link as LinkIcon,
  Video,
  Mic,
  Globe,
  X,
  AtSign,
  Mail,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  History,
} from 'lucide-react'
import { DeleteJobButton } from './delete-job-button'

const PAGE_SIZE = 20

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  COMPLETED: 'default',
  PARTIALLY_FAILED: 'secondary',
  FAILED: 'destructive',
  PENDING: 'outline',
  EXTRACTING: 'outline',
  GENERATING: 'outline',
}

const INPUT_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  RAW_TEXT: FileText,
  BLOG_URL: LinkIcon,
  YOUTUBE_URL: Video,
  AUDIO_UPLOAD: Mic,
  VIDEO_UPLOAD: Mic,
}

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LINKEDIN: Globe,
  TWITTER: X,
  INSTAGRAM: AtSign,
  NEWSLETTER: Mail,
  BLOG: BookOpen,
}

interface PageProps {
  searchParams: { page?: string }
}

export default async function HistoryPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const page = Math.max(1, Number(searchParams.page ?? '1'))
  const skip = (page - 1) * PAGE_SIZE

  const [jobs, total] = await Promise.all([
    prisma.repurposeJob.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE,
      include: {
        outputs: {
          select: { platform: true },
        },
      },
    }),
    prisma.repurposeJob.count({ where: { userId: session.user.id } }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">History</h1>
          <p className="text-muted-foreground">All your repurposed content jobs.</p>
        </div>
        <Button asChild>
          <Link href="/repurpose">New Repurpose</Link>
        </Button>
      </div>

      {/* Empty state */}
      {jobs.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <History className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">No history yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your repurposed content jobs will appear here.
              </p>
            </div>
            <Button asChild>
              <Link href="/repurpose">Create your first repurpose</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {jobs.length > 0 && (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Showing {skip + 1}–{Math.min(skip + PAGE_SIZE, total)} of {total} jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead className="hidden md:table-cell">Platforms</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => {
                    const InputIcon = INPUT_TYPE_ICONS[job.inputType] ?? FileText
                    const preview =
                      job.inputContent
                        ? job.inputContent.slice(0, 80)
                        : job.inputUrl ?? 'No preview'
                    const statusVariant = STATUS_VARIANTS[job.status] ?? 'outline'

                    return (
                      <TableRow key={job.id}>
                        {/* Title / preview */}
                        <TableCell className="max-w-[200px]">
                          <p className="truncate text-sm font-medium">
                            {job.inputUrl
                              ? new URL(job.inputUrl).hostname
                              : preview}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {job.inputContent ? `${job.inputContent.slice(0, 60)}...` : job.inputUrl}
                          </p>
                        </TableCell>

                        {/* Input type */}
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-1.5">
                            <InputIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {job.inputType.replace('_', ' ')}
                            </span>
                          </div>
                        </TableCell>

                        {/* Platforms */}
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {job.outputs.slice(0, 5).map(({ platform }) => {
                              const PlatformIcon = PLATFORM_ICONS[platform]
                              if (!PlatformIcon) return null
                              return (
                                <div
                                  key={platform}
                                  className="flex h-6 w-6 items-center justify-center rounded-full bg-muted"
                                  title={platform}
                                >
                                  <PlatformIcon className="h-3 w-3 text-muted-foreground" />
                                </div>
                              )
                            })}
                            {job.outputs.length === 0 && (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Date */}
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge variant={statusVariant} className="text-xs">
                            {job.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <Link href={`/repurpose/${job.id}`}>
                                <Eye className="h-3.5 w-3.5" />
                                <span className="sr-only">View</span>
                              </Link>
                            </Button>
                            <DeleteJobButton jobId={job.id} />
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={page <= 1}
              asChild={page > 1}
            >
              {page > 1 ? (
                <Link href={`/history?page=${page - 1}`}>
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </Link>
              ) : (
                <>
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={page >= totalPages}
              asChild={page < totalPages}
            >
              {page < totalPages ? (
                <Link href={`/history?page=${page + 1}`}>
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
