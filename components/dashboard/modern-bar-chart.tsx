"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, type ChartConfiguration, type ChartData, type ChartOptions } from "chart.js/auto"
import { chartConfig } from "@/lib/chart-config"
import ChartDataLabels from 'chartjs-plugin-datalabels';

interface ModernBarChartProps {
  data: {
    month: string
    totalOrders: number
    achPercentage: number
  }[]
  title: string
  className?: string
}

export function ModernBarChart({ data, title, className }: ModernBarChartProps) {
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

    // Register ChartDataLabels plugin (safe to call multiple times)
    Chart.register(ChartDataLabels)

    // Calculate MoM Orders growth percentage
    const orders = data.map((item) => item.totalOrders)
    const momOrdersGrowth = orders.map((val, idx, arr) => {
      if (idx === 0) return 0
      const prev = arr[idx - 1]
      if (prev === 0) return 0
      return Number((((val - prev) / prev) * 100).toFixed(2))
    })

    const chartData: ChartData = {
      labels: data.map((item) => item.month),
      datasets: [
        {
          type: "bar",
          label: "Total Orders",
          data: data.map((item) => item.totalOrders),
          backgroundColor: (context) => {
            const ctx = context.chart.ctx
            return chartConfig.createGradient(ctx, chartConfig.colors.primary)
          },
          borderRadius: 6,
          borderWidth: 0,
          order: 1,
          yAxisID: "y",
          datalabels: {
            display: true,
            anchor: "end",
            align: "end",
            color: "#333",
            font: {
              weight: "bold",
              size: 12,
            },
            formatter: (value) => value,
          },
        },
        {
          type: "line",
          label: "% Ach Month per Month",
          data: data.map((item) => item.achPercentage),
          borderColor: chartConfig.colors.secondary,
          backgroundColor: chartConfig.colors.secondary,
          borderWidth: 3,
          pointBackgroundColor: chartConfig.colors.secondary,
          pointBorderColor: "#fff",
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBorderWidth: 2,
          tension: 0.3,
          fill: false,
          order: 0,
          yAxisID: "y1",
        },
        {
          type: "line",
          label: "MoM Growth",
          data: momOrdersGrowth,
          borderColor: chartConfig.colors.success,
          backgroundColor: chartConfig.colors.success,
          borderWidth: 2,
          borderDash: [5, 5],
          pointBackgroundColor: chartConfig.colors.success,
          pointBorderColor: "#fff",
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.2,
          fill: false,
          order: 0,
          yAxisID: "y1",
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
        y1: {
          type: "linear",
          position: "right",
          title: {
            display: true,
            text: "% Achievement",
            font: {
              size: 12,
              weight: "bold",
            },
            color: "#666",
          },
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            callback: (value) => value + "%",
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
          position: "top",
          align: "end",
          labels: {
            usePointStyle: true,
            boxWidth: 10,
            boxHeight: 10,
            padding: 15,
            font: {
              size: 11,
            },
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: (context) => {
              let label = context.dataset.label || ""
              if (label) {
                label += ": "
              }
              if (context.parsed.y !== null) {
                if (context.dataset.yAxisID === "y1") {
                  label += context.parsed.y + "%"
                } else {
                  label += context.parsed.y
                }
              }
              return label
            },
          },
        },
        datalabels: {
          display: (context) => context.dataset.type === "bar",
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
