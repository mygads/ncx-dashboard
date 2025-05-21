"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, type ChartConfiguration, type ChartData, type ChartOptions } from "chart.js/auto"
import { chartConfig } from "@/lib/chart-config"

interface ModernHotdaBarChartProps {
  data: {
    location: string
    count: number
  }[]
  title: string
  className?: string
}

export function ModernHotdaBarChart({ data, title, className }: ModernHotdaBarChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    const chartData: ChartData = {
      labels: data.map((item) => item.location),
      datasets: [
        {
          type: "bar",
          label: "Total Orders",
          data: data.map((item) => item.count),
          backgroundColor: chartConfig.colors.primary,
          borderRadius: 6,
          borderWidth: 0,
          order: 1,
        },
      ],
    }

    const options: ChartOptions = {
      ...chartConfig.defaultOptions,
      scales: {
        y: {
          type: "linear",
          position: "left",
          title: {
            display: true,
            text: "Total Orders",
            font: {
              size: 12,
              weight: "bold",
            },
            color: "#666",
          },
          min: 0,
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
          ticks: {
            font: {
              size: 11,
            },
            color: "#666",
          },
        },
        x: {
          grid: {
            display: false,
          },
          title: {
            display: true,
            text: "HOTDA",
            font: {
              size: 12,
              weight: "bold",
            },
            color: "#666",
          },
          ticks: {
            font: {
              size: 11,
            },
            color: "#666",
          },
        },
      },
      plugins: {
        ...chartConfig.defaultOptions.plugins,
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `${context.label}: ${context.parsed.y} orders`
            },
          },
        },
        datalabels: {
          display: true,
          color: "#222",
          font: {
            weight: "bold",
            size: 13,
          },
          anchor: "end",
          align: "end",
          formatter: (value) => value,
        },
      },
    }

    const config: ChartConfiguration = {
      type: "bar",
      data: chartData,
      options: options,
    }

    chartInstance.current = new Chart(ctx, config)

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return (
    <Card className={`overflow-hidden shadow-lg border-0 ${className}`}>
      <CardHeader className="pb-2 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
        <CardTitle className="text-lg font-medium text-gray-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full -mr-20 -mt-20 opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-50 rounded-full -ml-16 -mb-16 opacity-20"></div>

        <div className="h-[300px] w-full relative z-10">
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  )
}
