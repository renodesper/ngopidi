'use client'

import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Plus } from 'lucide-react'

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="flex h-screen items-center justify-center">Loading Map...</div>
})

export default function Home() {
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
            <Link href="/login">
              <Button variant="ghost" size="sm" className="rounded-full hover:bg-primary/10">Login</Button>
            </Link>
          </nav>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-6 right-6 z-[400] flex flex-col gap-3">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-2xl shadow-amber-500/20 hover:scale-110 transition-transform bg-gradient-to-br from-amber-500 to-amber-700 text-white border-none"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Brand Watermark */}
      <div className="absolute bottom-6 left-6 z-[400]">
        <p className="text-[10px] font-medium tracking-[0.2em] uppercase opacity-30 select-none">Ngopidi &copy; 2026</p>
      </div>
    </main>
  )
}
