"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RevenuePage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/dashboard/sales")
  }, [router])

  return null
}
