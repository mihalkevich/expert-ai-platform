'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Building2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const INDUSTRIES = ['Tech', 'Marketing', 'Finance', 'Healthcare', 'E-commerce', 'Other']

interface CompanyFormData {
  companyName: string
  industry: string
  products: string
  brandGuidelines: string
}

interface CompanySetupFormProps {
  initialData?: {
    id?: string
    companyName?: string
    industry?: string | null
    products?: unknown
    brandGuidelines?: string | null
  }
  onSaved?: () => void
}

export function CompanySetupForm({ initialData, onSaved }: CompanySetupFormProps) {
  const [form, setForm] = useState<CompanyFormData>({
    companyName: initialData?.companyName ?? '',
    industry: initialData?.industry ?? '',
    products: Array.isArray(initialData?.products)
      ? (initialData.products as string[]).join(', ')
      : typeof initialData?.products === 'string'
        ? initialData.products
        : '',
    brandGuidelines: initialData?.brandGuidelines ?? '',
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.companyName.trim()) {
      toast.error('Company name is required')
      return
    }

    setSaving(true)
    try {
      const productsArray = form.products
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)

      const payload = {
        companyName: form.companyName,
        industry: form.industry || undefined,
        products: productsArray,
        brandGuidelines: form.brandGuidelines || undefined,
      }

      let res: Response
      if (initialData?.id) {
        res = await fetch(`/api/company/${initialData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed to save')
      }

      toast.success('Company profile saved')
      onSaved?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {initialData?.id ? 'Edit Company Profile' : 'Set Up Company Profile'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              value={form.companyName}
              onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
              placeholder="Acme Corp"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select
              value={form.industry}
              onValueChange={(v) => setForm((f) => ({ ...f, industry: v }))}
            >
              <SelectTrigger id="industry">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="products">Products / Services</Label>
            <Textarea
              id="products"
              value={form.products}
              onChange={(e) => setForm((f) => ({ ...f, products: e.target.value }))}
              placeholder="SaaS platform, consulting services, ... (comma-separated)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brandGuidelines">Brand Guidelines</Label>
            <Textarea
              id="brandGuidelines"
              value={form.brandGuidelines}
              onChange={(e) => setForm((f) => ({ ...f, brandGuidelines: e.target.value }))}
              placeholder="Tone, values, do's and don'ts..."
              rows={4}
            />
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData?.id ? 'Save Changes' : 'Create Company Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
