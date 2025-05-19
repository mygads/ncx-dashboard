"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Loader2 } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { DebugInfo } from "@/components/debug-info"
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, signOut } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    setIsMounted(true)

    // Check authentication status directly from Supabase
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (!data.session) {
          router.push("/login")
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        // If there's an error, redirect to login as a fallback
        router.push("/login")
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router, supabase.auth])

  if (!isMounted || isLoading || checkingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden flex">
      {/* Sidebar - fixed width on desktop, hidden on mobile */}
      <div className="hidden md:block w-64 h-full overflow-y-auto">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="md:hidden flex items-center p-4 border-b">
          <MobileSidebar />
          <div className="ml-4 font-bold text-xl">NCX-PRO</div>
        </div>
        {children}
      </main>

      {process.env.NODE_ENV !== "production" && <DebugInfo />}
    </div>
  )
}
