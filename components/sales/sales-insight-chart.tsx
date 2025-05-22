"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SalesInsightCardProps {
    title: string
    text: string
    className?: string
}

export function SalesInsightCard({ title, text, className }: SalesInsightCardProps) {
    // Pisahkan updated label dari text jika ada pola [Update ...]
    let updatedLabel = "-";
    let mainText = text;
    const updateRegex = /^\[Update[^\]]+\]\s*/i;
    const match = text.match(/^\[Update[^\]]+\]/i);
    if (match) {
        updatedLabel = match[0].replace(/^\[|\]$/g, "");
        mainText = text.replace(updateRegex, "");
    }

    return (
        <Card className={`overflow-hidden shadow-lg border-0 ${className}`}>
            <CardHeader className="pb-2 bg-gradient-to-r from-red-200 to-red-300 border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium text-black">{title}</CardTitle>
                    <span className="inline-block mb-1 px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">
                        {updatedLabel}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-4 relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full -mr-20 -mt-20 opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-50 rounded-full -ml-16 -mb-16 opacity-20"></div>
                <div className="relative z-10">
                    <p className="text-base whitespace-pre-line">{mainText}</p>
                </div>
            </CardContent>
        </Card>
    )
}
