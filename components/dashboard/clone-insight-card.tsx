"use client"
import { Card, CardContent } from "@/components/ui/card"

interface CloneInsightCardProps {
  title: string
  text: string
  className?: string
}

export function CloneInsightCard({ title, text, className }: CloneInsightCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4 prose max-w-none">
        <h2 className="text-lg font-medium">{title}</h2>
        <p className="text-base">{text}</p>
      </CardContent>
    </Card>
  )
}
