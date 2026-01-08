import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/admin/Sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  // @ts-ignore
  if (session?.user?.role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r bg-card p-4">
        <Sidebar userEmail={session.user.email || ""} />
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}
