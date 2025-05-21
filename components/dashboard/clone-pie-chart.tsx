// Komponen Pie Chart Clone (styling sama seperti ModernPieChart, tapi terpisah)
"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, type ChartConfiguration, type ChartData, type ChartOptions } from "chart.js/auto"
import { chartConfig } from "@/lib/chart-config"

interface ClonePieChartProps {
  data: {
    status: string
    percentage: number
    color: string
  }[]
  title: string
  className?: string
}

export function ClonePieChart({ data, title, className }: ClonePieChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return
    if (chartInstance.current) chartInstance.current.destroy()
    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return
    const chartData: ChartData = {
      labels: data.map((item) => item.status),
      datasets: [
        {
          data: data.map((item) => item.percentage),
          backgroundColor: data.map((item) => item.color),
          borderWidth: 2,
          borderColor: "#ffffff",
          hoverBorderWidth: 4,
          hoverBorderColor: "#ffffff",
          hoverOffset: 10,
        },
      ],
    }
    const options: ChartOptions = {
      ...chartConfig.defaultOptions,
      plugins: {
        ...chartConfig.defaultOptions.plugins,
        legend: {
          position: "right",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            padding: 20,
            font: { size: 12, weight: "bold" },
            color: "#333",
            generateLabels: (chart) => {
              const data = chart.data
              if (data.labels && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const meta = chart.getDatasetMeta(0)
                  const style = meta.controller.getStyle(i, false)
                  return {
                    text: `${label}: ${Math.round(data.datasets[0].data[i] as number)}%`,
                    fillStyle: style.backgroundColor,
                    strokeStyle: style.borderColor,
                    lineWidth: style.borderWidth,
                    pointStyle: "circle",
                    hidden: false,
                    index: i,
                  }
                })
              }
              return []
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${Math.round(Number(context.raw))}%`,
          },
        },
        datalabels: {
          display: (context) => Number(context.dataset.data[context.dataIndex]) > 5,
          color: "#fff",
          font: { weight: "bold", size: 14 },
          textStrokeColor: "rgba(0,0,0,0.5)",
          textStrokeWidth: 2,
          formatter: (value) => `${Math.round(Number(value))}%`,
          align: "center",
          anchor: "center",
        },
      },
    }
    const config: ChartConfiguration = {
      type: "pie",
      data: chartData,
      options: options,
      ...(title.toLowerCase().includes("doughnut") && { cutout: "40%" }),
    }
    chartInstance.current = new Chart(ctx, config)
    return () => {
      if (chartInstance.current) chartInstance.current.destroy()
    }
  }, [data])

  return (
    <Card className={`overflow-hidden shadow-lg border-0 ${className}`}>
      <CardHeader className="pb-2 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
        <CardTitle className="text-lg font-medium text-gray-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-50 rounded-full -ml-12 -mb-12 opacity-20"></div>
        <div className="h-[300px] w-full relative z-10">
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  )
}
