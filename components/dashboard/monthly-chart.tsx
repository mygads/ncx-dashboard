"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, type ChartConfiguration, type ChartData, type ChartOptions } from "chart.js/auto"

interface MonthlyChartProps {
  data: {
    month: string
    totalOrders: number
    achPercentage: number
  }[]
  title: string
}

export function MonthlyChart({ data, title }: MonthlyChartProps) {
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
      labels: data.map((item) => item.month),
      datasets: [
        {
          type: "bar",
          label: "Total Orders",
          data: data.map((item) => item.totalOrders),
          backgroundColor: "#32CD32",
          order: 1,
          yAxisID: "y",
        },
        {
          type: "line",
          label: "% Ach Month per Month",
          data: data.map((item) => item.achPercentage),
          borderColor: "#800080",
          borderWidth: 2,
          pointBackgroundColor: "#800080",
          pointRadius: 4,
          fill: false,
          order: 0,
          yAxisID: "y1",
        },
      ],
    }

    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          type: "linear",
          position: "left",
          title: {
            display: true,
            text: "Total Orders",
          },
          min: -500,
          max: 500,
        },
        y1: {
          type: "linear",
          position: "right",
          title: {
            display: true,
            text: "% Achievement",
          },
          min: -100,
          max: 50,
          grid: {
            drawOnChartArea: false,
          },
        },
      },
      plugins: {
        legend: {
          position: "top",
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
    <Card className="col-span-2">
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
