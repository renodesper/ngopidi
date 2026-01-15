import { auth } from '@/auth'
import { Button } from '@/components/atoms/button'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/molecules/sheet'
import { AdminSidebar } from '@/components/organisms/AdminSidebar'
import { Menu } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth()
    if (!session) {
        redirect('/login')
    }
    // @ts-ignore
    if (session.user?.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    return (
        <div className="flex h-screen bg-muted/20">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 border-r bg-card p-6 flex-col">
                <AdminSidebar userEmail={session.user.email || ''} />
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between px-6 py-4 border-b bg-card">
                    <div className="flex items-center gap-2">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[280px] p-6">
                                <SheetHeader className="text-left px-0 pb-2">
                                    <SheetTitle>Admin Panel</SheetTitle>
                                    <SheetDescription>{session.user.email}</SheetDescription>
                                </SheetHeader>
                                <div className="mt-4 h-full">
                                    <AdminSidebar userEmail={session.user.email || ''} isMobile={true} />
                                </div>
                            </SheetContent>
                        </Sheet>
                        <h1 className="font-bold text-lg">Admin</h1>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto">{children}</div>
                </main>
            </div>
        </div>
    )
}
