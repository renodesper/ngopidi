'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Users, MapPin, LayoutDashboard } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import { Button } from "@/components/ui/button"
import { SheetClose } from "@/components/ui/sheet"

const allNavItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, adminOnly: false },
  { href: '/dashboard/places', label: 'Places', icon: MapPin, adminOnly: false },
  { href: '/dashboard/users', label: 'Users', icon: Users, adminOnly: true },
]

export function Sidebar({ userEmail, userRole, isMobile }: { userEmail: string; userRole: string; isMobile?: boolean }) {
  const pathname = usePathname()

  const navItems = allNavItems.filter(item => !item.adminOnly || userRole === 'ADMIN')

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Ngopi Yuk!</h1>
        <p className="text-sm text-muted-foreground mt-1">{userEmail}</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          const content = (
            <Link
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )

          return isMobile ? (
            <SheetClose asChild key={item.href}>
              {content}
            </SheetClose>
          ) : (
            <div key={item.href}>{content}</div>
          )
        })}
      </nav>

      <form action={logout} className="mt-auto pt-4 border-t">
        <Button variant="secondary" className="w-full text-left cursor-pointer" type="submit">
          Sign Out
        </Button>
      </form>
    </div>
  )
}
