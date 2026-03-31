'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  FileText,
  Link,
  Video,
  Mic,
  Upload,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContentInputFormProps {
  onContentReady: (content: string, title?: string) => void
}

const MIN_CHARS = 100

export function ContentInputForm({ onContentReady }: ContentInputFormProps) {
  // Paste Text
  const [pasteText, setPasteText] = useState('')

  // Blog URL
  const [blogUrl, setBlogUrl] = useState('')
  const [blogExtracting, setBlogExtracting] = useState(false)
  const [blogPreview, setBlogPreview] = useState<{ title?: string; content: string } | null>(null)
  const [blogPreviewOpen, setBlogPreviewOpen] = useState(false)

  // YouTube
  const [ytUrl, setYtUrl] = useState('')
  const [ytExtracting, setYtExtracting] = useState(false)
  const [ytPreview, setYtPreview] = useState<string | null>(null)
  const [ytPreviewOpen, setYtPreviewOpen] = useState(false)

  // Audio
  const [audioFile, setAudioFile] = useState<File | null>(null)

  // --- Paste Text ---
  const handlePasteChange = (value: string) => {
    setPasteText(value)
    if (value.length >= MIN_CHARS) {
      onContentReady(value)
    }
  }

  // --- Blog URL ---
  const extractBlog = async () => {
    if (!blogUrl.trim()) {
      toast.error('Please enter a URL')
      return
    }
    setBlogExtracting(true)
    setBlogPreview(null)
    try {
      const res = await fetch('/api/content/extract?type=blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: blogUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Extraction failed')
      setBlogPreview({ title: data.title, content: data.content })
      setBlogPreviewOpen(true)
      onContentReady(data.content, data.title)
      toast.success('Content extracted successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to extract content')
    } finally {
      setBlogExtracting(false)
    }
  }

  // --- YouTube ---
  const extractYouTube = async () => {
    if (!ytUrl.trim()) {
      toast.error('Please enter a YouTube URL')
      return
    }
    setYtExtracting(true)
    setYtPreview(null)
    try {
      const res = await fetch('/api/content/extract?type=youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: ytUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Extraction failed')
      setYtPreview(data.transcript ?? data.content)
      setYtPreviewOpen(true)
      onContentReady(data.transcript ?? data.content, data.title)
      toast.success('Transcript extracted successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to extract transcript')
    } finally {
      setYtExtracting(false)
    }
  }

  // --- Audio Dropzone ---
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    setAudioFile(file)
    onContentReady('', file.name)
    toast.success(`File ready: ${file.name}`)
  }, [onContentReady])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/mpeg': ['.mp3'],
      'audio/mp4': ['.mp4', '.m4a'],
      'audio/wav': ['.wav'],
    },
    maxFiles: 1,
  })

  return (
    <Tabs defaultValue="paste" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="paste" className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Paste Text</span>
        </TabsTrigger>
        <TabsTrigger value="blog" className="flex items-center gap-1.5">
          <Link className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Blog URL</span>
        </TabsTrigger>
        <TabsTrigger value="youtube" className="flex items-center gap-1.5">
          <Video className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">YouTube</span>
        </TabsTrigger>
        <TabsTrigger value="audio" className="flex items-center gap-1.5">
          <Mic className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Upload Audio</span>
        </TabsTrigger>
      </TabsList>

      {/* Paste Text */}
      <TabsContent value="paste" className="space-y-2">
        <Textarea
          placeholder="Paste your content here (minimum 100 characters)..."
          className="min-h-[200px] resize-y"
          value={pasteText}
          onChange={(e) => handlePasteChange(e.target.value)}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {pasteText.length < MIN_CHARS
              ? `${MIN_CHARS - pasteText.length} more characters needed`
              : 'Ready to repurpose'}
          </span>
          <span className={cn(pasteText.length < MIN_CHARS ? 'text-destructive' : 'text-green-600 dark:text-green-400')}>
            {pasteText.length} chars
          </span>
        </div>
        {pasteText.length >= MIN_CHARS && (
          <Card className="mt-2 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
            <CardContent className="p-3">
              <p className="line-clamp-3 text-sm text-muted-foreground">{pasteText.slice(0, 300)}{pasteText.length > 300 ? '...' : ''}</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Blog URL */}
      <TabsContent value="blog" className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://yourblog.com/your-post"
            value={blogUrl}
            onChange={(e) => setBlogUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && extractBlog()}
            className="flex-1"
          />
          <Button onClick={extractBlog} disabled={blogExtracting || !blogUrl.trim()}>
            {blogExtracting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting...
              </>
            ) : (
              'Extract Content'
            )}
          </Button>
        </div>

        {blogExtracting && (
          <Card>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
        )}

        {blogPreview && (
          <Card>
            <CardContent className="p-0">
              <button
                type="button"
                className="flex w-full items-center justify-between p-4 text-left"
                onClick={() => setBlogPreviewOpen(!blogPreviewOpen)}
              >
                <div>
                  {blogPreview.title && (
                    <p className="font-medium text-sm">{blogPreview.title}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {blogPreview.content.length.toLocaleString()} characters extracted
                  </p>
                </div>
                {blogPreviewOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {blogPreviewOpen && (
                <div className="border-t px-4 pb-4">
                  <p className="mt-3 line-clamp-6 text-sm text-muted-foreground whitespace-pre-wrap">
                    {blogPreview.content.slice(0, 600)}{blogPreview.content.length > 600 ? '...' : ''}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* YouTube */}
      <TabsContent value="youtube" className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={ytUrl}
            onChange={(e) => setYtUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && extractYouTube()}
            className="flex-1"
          />
          <Button onClick={extractYouTube} disabled={ytExtracting || !ytUrl.trim()}>
            {ytExtracting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting...
              </>
            ) : (
              'Extract Transcript'
            )}
          </Button>
        </div>

        {ytExtracting && (
          <Card>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
        )}

        {ytPreview && (
          <Card>
            <CardContent className="p-0">
              <button
                type="button"
                className="flex w-full items-center justify-between p-4 text-left"
                onClick={() => setYtPreviewOpen(!ytPreviewOpen)}
              >
                <p className="text-sm font-medium">Transcript Preview</p>
                {ytPreviewOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {ytPreviewOpen && (
                <div className="border-t px-4 pb-4">
                  <p className="mt-3 line-clamp-6 text-sm text-muted-foreground whitespace-pre-wrap">
                    {ytPreview.slice(0, 600)}{ytPreview.length > 600 ? '...' : ''}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Upload Audio */}
      <TabsContent value="audio" className="space-y-3">
        <div
          {...getRootProps()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center transition-colors',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30',
          )}
        >
          <input {...getInputProps()} />
          <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-sm font-medium">Drop the file here...</p>
          ) : (
            <>
              <p className="text-sm font-medium">Drag & drop an audio file, or click to browse</p>
              <p className="mt-1 text-xs text-muted-foreground">.mp3, .mp4, .m4a, .wav supported</p>
            </>
          )}
        </div>

        {audioFile && (
          <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
            <CardContent className="flex items-center gap-3 p-3">
              <Mic className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium">{audioFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}
