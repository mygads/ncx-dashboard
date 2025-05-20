"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Loading from "@/components/ui/loading"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/dashboard/analytics")
  }, [router])

  return (
    <Loading />
  )
}
