'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Users, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmployeeCard } from '@/components/employees/employee-card'
import { EmployeeForm } from '@/components/employees/employee-form'

interface Employee {
  id: string
  name: string
  role: string
  personality: Record<string, unknown>
  avatarUrl: string | null
  isActive: boolean
  _count: { contentPlans: number }
}

interface CompanyProfile {
  id: string
  companyName: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [company, setCompany] = useState<CompanyProfile | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)

  async function fetchData() {
    try {
      const [empRes, compRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/company'),
      ])

      if (empRes.ok) {
        const data = await empRes.json() as Employee[]
        setEmployees(data)
      }

      if (compRes.ok) {
        const data = await compRes.json() as CompanyProfile | null
        setCompany(data)
      } else {
        setCompany(null)
      }
    } catch {
      setCompany(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Employees</h1>
          <p className="text-muted-foreground">Manage your AI-powered team members.</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center gap-4">
          <Building2 className="h-12 w-12 text-muted-foreground/40" />
          <div>
            <h3 className="font-semibold text-lg">Set up your company first</h3>
            <p className="text-muted-foreground text-sm mt-1">
              You need a company profile before adding AI employees.
            </p>
          </div>
          <Button asChild>
            <Link href="/company">Go to Company Setup</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Employees</h1>
          <p className="text-muted-foreground">
            Manage AI-powered team members for {company.companyName}.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center gap-4">
          <Users className="h-12 w-12 text-muted-foreground/40" />
          <div>
            <h3 className="font-semibold text-lg">No employees yet</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Create your first AI employee to start generating content.
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {employees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              onDeleted={fetchData}
              onUpdated={fetchData}
            />
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <EmployeeForm
            onSaved={() => {
              setAddOpen(false)
              fetchData()
            }}
            onCancel={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
