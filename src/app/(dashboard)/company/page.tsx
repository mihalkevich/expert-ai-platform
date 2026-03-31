'use client'

import { useEffect, useState } from 'react'
import { Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CompanySetupForm } from '@/components/employees/company-setup-form'

interface CompanyProfile {
  id: string
  companyName: string
  industry: string | null
  products: unknown
  brandGuidelines: string | null
  website: string | null
  createdAt: string
}

export default function CompanyPage() {
  const [company, setCompany] = useState<CompanyProfile | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchCompany() {
    try {
      const res = await fetch('/api/company')
      if (res.ok) {
        const data = await res.json() as CompanyProfile | null
        setCompany(data)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompany()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Company Profile</h1>
        <p className="text-muted-foreground">
          Set up your company information to power your AI employees.
        </p>
      </div>

      {!company ? (
        <div className="space-y-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">No company profile yet</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Create your company profile to start building AI employees.
                </p>
              </div>
            </CardContent>
          </Card>
          <CompanySetupForm onSaved={fetchCompany} />
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">{company.companyName}</h2>
                {company.industry && (
                  <p className="text-sm text-muted-foreground">{company.industry}</p>
                )}
              </div>
            </CardContent>
          </Card>
          <CompanySetupForm initialData={company} onSaved={fetchCompany} />
        </div>
      )}
    </div>
  )
}
