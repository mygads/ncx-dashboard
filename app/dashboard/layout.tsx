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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    // Check if sidebar is collapsed from localStorage
    const storedCollapsed = localStorage.getItem("sidebar-collapsed")
    if (storedCollapsed) {
      setSidebarCollapsed(storedCollapsed === "true")
    }

    // Listen for changes to localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "sidebar-collapsed") {
        setSidebarCollapsed(e.newValue === "true")
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

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

  return (
    <div className="h-screen overflow-hidden flex">
      {/* Sidebar - fixed width on desktop, hidden on mobile */}
      <div
        className={`hidden md:block h-full overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"}`}
      >
        <Sidebar collapsed={sidebarCollapsed} onCollapseChange={setSidebarCollapsed} />
      </div>

      {/* Main content */}
      <main className="flex-1 min-h-screen overflow-y-auto bg-gray-100 relative">
        {/* Decorative SVG top left */}
        <svg className="absolute left-0 top-0 w-40 h-40 opacity-20 pointer-events-none" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="100" fill="url(#paint0_radial)" />
          <defs>
            <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientTransform="translate(100 100) scale(100)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60A5FA" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
        {/* Decorative SVG bottom right */}
        <svg className="absolute right-0 bottom-0 w-40 h-40 opacity-20 pointer-events-none" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="200" height="200" rx="100" fill="url(#paint1_radial)" />
          <defs>
            <radialGradient id="paint1_radial" cx="0" cy="0" r="1" gradientTransform="translate(100 100) scale(100)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#818CF8" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
        <div className="md:hidden flex items-center p-4 border-b relative z-10">
          <MobileSidebar />
          <div className="ml-4 font-bold text-xl">NCX-PRO</div>
        </div>
        <div className="relative z-10">{children}</div>
      </main>

      {process.env.NODE_ENV !== "production" && <DebugInfo />}
    </div>
  )
}
