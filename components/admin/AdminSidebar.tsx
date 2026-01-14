'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Users, MapPin, LayoutDashboard } from 'lucide-react'
import { logout } from '@/app/actions/auth'

const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/places', label: 'Places', icon: MapPin },
    { href: '/admin/users', label: 'Users', icon: Users },
]

export function AdminSidebar({ userEmail }: { userEmail: string }) {
    const pathname = usePathname()

    return (
        <div className="flex flex-col h-full">
            <div className="mb-8 hidden lg:block">
                <h1 className="text-xl font-bold">Admin Panel</h1>
                <p className="text-sm text-muted-foreground mt-1">{userEmail}</p>
            </div>

            <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href ||
                        (item.href !== '/admin' && pathname.startsWith(item.href))

                    return (
                        <Link
                            key={item.href}
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
                })}
            </nav>

            <form action={logout} className="mt-auto pt-4 border-t">
                <button className="text-red-500 hover:underline text-sm w-full text-left">
                    Sign Out
                </button>
            </form>
        </div>
    )
}
