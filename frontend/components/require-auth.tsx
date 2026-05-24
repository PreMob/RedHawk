"use client"

import type React from "react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { ShieldCheck } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const next = encodeURIComponent(pathname || "/dashboard")
      router.replace(`/login?next=${next}`)
    }
  }, [isAuthenticated, isLoading, pathname, router])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Image src="/logo.png" alt="RedHawk" width={64} height={64} className="rounded-xl" />
            <ShieldCheck className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-black text-red-500" />
          </div>
          <div className="h-1.5 w-40 overflow-hidden rounded-full bg-red-950">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-red-500" />
          </div>
          <p className="text-sm text-gray-400">Checking secure access...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
