"use client"
import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CloneStatCardProps {
  title: string
  value: string | number
  className?: string
  icon?: React.ReactNode
}

export function CloneStatCard({ title, value, className, icon }: CloneStatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden shadow-lg border-0", className)}>
      <CardContent className="p-4 flex flex-col h-24 justify-between relative">
        <div className="flex justify-between items-start">
          <div className="text-sm font-medium">{title}</div>
          {icon && <div className="text-lg opacity-70">{icon}</div>}
        </div>
        <div className="flex items-end justify-between">
          <div className="text-3xl font-bold">{value}</div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-white/10 via-white/30 to-transparent rounded-b-lg" />
      </CardContent>
    </Card>
  )
}
