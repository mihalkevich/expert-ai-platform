'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ContentPlanList } from '@/components/employees/content-plan-list'
import { EmployeeForm } from '@/components/employees/employee-form'
import { GeneratePostDialog } from '@/components/employees/generate-post-dialog'

interface ContentPlan {
  id: string
  title: string
  content: string | null
  platform: string | null
  status: string
  createdAt: string
}

interface Employee {
  id: string
  name: string
  role: string
  personality: Record<string, unknown>
  background: Record<string, unknown>
  writingStyle: Record<string, unknown>
  avatarUrl: string | null
  isActive: boolean
  contentPlans: ContentPlan[]
}

const ROLE_LABELS: Record<string, string> = {
  AMBASSADOR: 'Ambassador',
  SALES: 'Sales',
  SUPPORT: 'Support',
  THOUGHT_LEADER: 'Thought Leader',
}

const AVATAR_COLORS = [
  'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400',
  'bg-teal-400', 'bg-blue-400', 'bg-indigo-400', 'bg-purple-400', 'bg-pink-400',
]

function getAvatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function getInitials(name: string): string {
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2)
}

export default function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [generateOpen, setGenerateOpen] = useState(false)

  async function fetchEmployee() {
    try {
      const res = await fetch(`/api/employees/${params.id}`)
      if (res.ok) {
        const data = await res.json() as Employee
        setEmployee(data)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  async function fetchPlans() {
    if (!employee) return
    try {
      const res = await fetch(`/api/employees/${params.id}/content-plans`)
      if (res.ok) {
        const plans = await res.json() as ContentPlan[]
        setEmployee((e) => e ? { ...e, contentPlans: plans } : e)
      }
    } catch {
      // silent
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchEmployee()
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Employee not found.</p>
        <Button asChild className="mt-4">
          <Link href="/employees">Back to Employees</Link>
        </Button>
      </div>
    )
  }

  const personalityEntries = Object.entries(employee.personality)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/employees" className="hover:text-foreground transition-colors">
          Employees
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{employee.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-white font-semibold text-lg ${
              employee.avatarUrl ? '' : getAvatarColor(employee.name)
            }`}
            style={employee.avatarUrl ? { backgroundImage: `url(${employee.avatarUrl})`, backgroundSize: 'cover' } : undefined}
          >
            {!employee.avatarUrl && getInitials(employee.name)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{employee.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{ROLE_LABELS[employee.role] ?? employee.role}</Badge>
              {!employee.isActive && (
                <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
              )}
            </div>
          </div>
        </div>

        <Button onClick={() => setGenerateOpen(true)} className="gap-2 shrink-0">
          <Wand2 className="h-4 w-4" />
          Generate New Post
        </Button>
      </div>

      {/* Personality summary */}
      {personalityEntries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {personalityEntries.map(([k, v]) => (
            <Badge key={k} variant="outline" className="text-xs">
              {k}: {String(v)}
            </Badge>
          ))}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans">
            Content Plans ({employee.contentPlans.length})
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-4">
          <ContentPlanList
            employeeId={employee.id}
            plans={employee.contentPlans}
            onUpdated={fetchPlans}
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-4 max-w-2xl">
          <EmployeeForm
            initialData={employee}
            onSaved={fetchEmployee}
          />
        </TabsContent>
      </Tabs>

      <GeneratePostDialog
        employeeId={employee.id}
        employeeName={employee.name}
        open={generateOpen}
        onOpenChange={(open) => {
          setGenerateOpen(open)
          if (!open) fetchPlans()
        }}
      />
    </div>
  )
}
