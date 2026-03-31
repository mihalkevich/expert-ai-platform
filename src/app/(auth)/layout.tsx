import type { Metadata } from 'next'
import { Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'ExpertAI - Sign In',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
      {/* Brand */}
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Zap className="h-5 w-5" />
        </div>
        <span className="text-2xl font-bold text-white">ExpertAI</span>
      </div>

      {/* Card container */}
      <div className="w-full max-w-md rounded-xl border border-slate-700 bg-white p-8 shadow-2xl dark:bg-slate-900 dark:border-slate-700">
        {children}
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-slate-400">
        &copy; {new Date().getFullYear()} ExpertAI. All rights reserved.
      </p>
    </div>
  )
}
