"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RegionMapProps {
  data: {
    region: string
    count: number
  }[]
  title: string
}

export function RegionMap({ data, title }: RegionMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // In a real implementation, you would use a mapping library like Leaflet or Google Maps
    // For now, we'll just display a placeholder
    if (!mapRef.current) return

    const mapContainer = mapRef.current
    mapContainer.innerHTML = `
      <div class="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <div class="text-center">
          <p class="text-lg font-medium mb-4">Region Data</p>
          <div class="grid grid-cols-2 gap-4">
            ${data
              .map(
                (item) => `
              <div class="bg-white p-3 rounded shadow">
                <p class="font-medium">${item.region}</p>
                <p class="text-lg font-bold">${item.count}</p>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      </div>
    `
  }, [data])

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div ref={mapRef} className="h-[300px] w-full" />
      </CardContent>
    </Card>
  )
}
