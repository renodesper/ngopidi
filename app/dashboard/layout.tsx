import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/admin/Sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) {
    redirect("/login")
  }
  // @ts-ignore
  const userRole = session.user?.role || "USER"
  if (userRole !== "ADMIN" && userRole !== "USER") {
    redirect("/")
  }

  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r bg-card p-4">
        <Sidebar userEmail={session.user?.email || ""} userRole={userRole} />
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}
