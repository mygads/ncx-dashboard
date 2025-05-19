"use client"

import { usePathname } from "next/navigation"

export function DebugInfo() {
  const pathname = usePathname() || ""

  if (process.env.NODE_ENV === "production") {
    return null
  }

  return (
    <div className="fixed bottom-2 right-2 bg-black bg-opacity-75 text-white p-2 rounded text-xs z-50">
      <div>Current path: {pathname}</div>
    </div>
  )
}
