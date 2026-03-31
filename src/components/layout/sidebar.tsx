'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard,
  Wand2,
  Clock,
  Mic,
  Inbox,
  Star,
  Trophy,
  Bot,
  BarChart3,
  Users,
  Megaphone,
  Building2,
  Link as LinkIcon,
  Settings,
  CreditCard,
  Zap,
  Sun,
  Moon,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'CONTENT',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Repurpose', href: '/repurpose', icon: Wand2 },
      { label: 'History', href: '/history', icon: Clock },
      { label: 'Voice', href: '/voice', icon: Mic },
    ],
  },
  {
    title: 'COMMUNITY',
    items: [
      { label: 'Inbox', href: '/inbox', icon: Inbox, badge: 3 },
      { label: 'Reputation', href: '/reputation', icon: Star },
    ],
  },
  {
    title: 'GROW',
    items: [
      { label: 'Challenges', href: '/challenges', icon: Trophy },
      { label: 'Avatar', href: '/avatar', icon: Bot },
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'COMPANY',
    items: [
      { label: 'Employees', href: '/employees', icon: Users },
      { label: 'Campaigns', href: '/campaigns', icon: Megaphone },
      { label: 'Company', href: '/company', icon: Building2 },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { label: 'Accounts', href: '/accounts', icon: LinkIcon },
      { label: 'Settings', href: '/settings', icon: Settings },
      { label: 'Billing', href: '/billing', icon: CreditCard },
    ],
  },
]

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <Badge
          variant={isActive ? 'secondary' : 'default'}
          className="ml-auto h-5 min-w-5 px-1 text-xs"
        >
          {item.badge}
        </Badge>
      )}
    </Link>
  )
}

interface SidebarContentProps {
  onNavigate?: () => void
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()

  const user = session?.user

  function getInitials(name: string | null | undefined): string {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  function isActive(href: string): boolean {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Zap className="h-4 w-4" />
        </div>
        <span className="text-lg font-bold">ExpertAI</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <div key={item.href} onClick={onNavigate}>
                  <NavLink item={item} isActive={isActive(item.href)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: theme toggle + user */}
      <div className="border-t px-3 py-3 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-4 w-4" />
              <span className="text-sm">Light mode</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              <span className="text-sm">Dark mode</span>
            </>
          )}
        </Button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? 'User'} />
                <AvatarFallback className="text-xs">{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 truncate text-left">
                <p className="truncate text-sm font-medium leading-none">{user?.name ?? 'User'}</p>
                <p className="truncate text-xs text-muted-foreground mt-0.5">{user?.email}</p>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 text-destructive focus:text-destructive"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
