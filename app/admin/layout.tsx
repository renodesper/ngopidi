import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    if (!session) {
        redirect("/login")
    }
    // @ts-ignore
    if (session.user?.role !== "ADMIN") {
        redirect("/dashboard")
    }

    return (
        <div className="flex h-screen">
            <aside className="w-64 border-r bg-card p-4">
                <AdminSidebar userEmail={session.user.email || ""} />
            </aside>
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    )
}
