"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  className?: string
  titleClassName?: string
  valueClassName?: string
}

export function StatCard({ title, value, className, titleClassName, valueClassName }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="p-4 pb-0">
        <CardTitle className={cn("text-sm font-medium", titleClassName)}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className={cn("text-3xl font-bold", valueClassName)}>{value}</div>
      </CardContent>
    </Card>
  )
}
