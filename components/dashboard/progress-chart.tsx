"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, type ChartConfiguration, type ChartData, type ChartOptions } from "chart.js/auto"

interface ProgressChartProps {
  data: {
    status: string
    percentage: number
  }[]
  title: string
}

export function ProgressChart({ data, title }: ProgressChartProps) {
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
      labels: data.map((item) => item.status),
      datasets: [
        {
          data: data.map((item) => item.percentage),
          backgroundColor: [
            "#4169E1", // PENDING BASO - Blue
            "#FFA500", // IN PROGRESS - Orange
            "#32CD32", // COMPLETE - Green
            "#DC3545", // PENDING BILLING APPROVAL - Red
          ],
          borderWidth: 0,
        },
      ],
    }

    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            padding: 20,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${context.raw}%`,
          },
        },
      },
    }

    const config: ChartConfiguration = {
      type: "pie",
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
    <Card className="col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-[300px] w-full">
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  )
}
