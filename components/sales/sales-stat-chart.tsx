"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SalesStatCardProps {
    title: string
    value: string | number
    subtitle?: string
    className?: string
    titleClassName?: string
    valueClassName?: string
}

export function SalesStatCard({
    title,
    value,
    subtitle,
    className,
    titleClassName,
    valueClassName,
}: SalesStatCardProps) {
    return (
        <Card
            className={cn(
                "overflow-hidden relative bg-gradient-to-br from-red-500 to-pink-500 shadow-lg",
                className
            )}
        >
            {/* Gradient overlay for extra effect */}
            <div className="absolute inset-0 opacity-30 pointer-events-none bg-gradient-to-tr from-white/30 via-transparent to-black/20" />
            <CardHeader className="p-4 pb-0 relative z-10">
                <CardTitle className={cn("text-sm font-medium text-white drop-shadow", titleClassName)}>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 relative z-10">
                <div className={cn("text-2xl font-semibold text-white drop-shadow", valueClassName)}>
                    {value}
                </div>
                {subtitle && (
                    <div className="text-sm text-white/80 mt-1 drop-shadow">{subtitle}</div>
                )}
            </CardContent>
        </Card>
    )
}
