'use client'

import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useSession } from 'next-auth/react'

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="flex h-screen items-center justify-center">Loading Map...</div>
})

export default function Home() {
  const { data: session } = useSession()
  return (
    <main className="relative h-screen w-full overflow-hidden">
      <Map />

      {/* Floating Header */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[400] w-full max-w-md px-4">
        <div className="glass-card p-4 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight">Ngopi Yuk!</h1>
            <p className="text-xs text-muted-foreground">Find your perfect working spot</p>
          </div>
          <div className="h-8 w-[1px] bg-border/50 mx-2" />
          <nav className="flex gap-1">
            {session?.user ? (
              <Link href={(session.user as any).role === 'ADMIN' ? '/admin' : '/dashboard'}>
                <Button variant="ghost" size="sm" className="rounded-full hover:bg-primary/10 font-medium text-amber-600">Dashboard</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-full hover:bg-primary/10">Login</Button>
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Brand Watermark */}
      <div className="absolute bottom-6 left-6 z-[400]">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase opacity-30 select-none">Ngopidi &copy; 2026</p>
      </div>
    </main>
  )
}
