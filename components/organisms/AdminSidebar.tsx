'use client'

import { logout } from '@/app/actions/auth'
import { Button } from '@/components/atoms/button'
import { SheetClose } from '@/components/molecules/sheet'
import { cn } from '@/lib/utils'
import { LayoutDashboard, MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/places', label: 'Places', icon: MapPin },
    { href: '/admin/users', label: 'Users', icon: Users },
]

export function AdminSidebar({ userEmail, isMobile }: { userEmail: string; isMobile?: boolean }) {
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
                    const isActive =
                        pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))

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
