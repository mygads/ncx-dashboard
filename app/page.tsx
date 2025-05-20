"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function Home() {
  const { session } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.replace("/dashboard")
    } else {
      router.replace("/login")
    }
  }, [session, router])
}
