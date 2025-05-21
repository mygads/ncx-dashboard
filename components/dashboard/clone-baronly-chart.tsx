"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, type ChartConfiguration, type ChartData, type ChartOptions } from "chart.js/auto"
import { chartConfig } from "@/lib/chart-config"
import ChartDataLabels from 'chartjs-plugin-datalabels';

interface CloneBarOnlyChartProps {
  data: {
    label: string
    value: number
    color?: string
  }[]
  title: string
  className?: string
}

export function CloneBarOnlyChart({ data, title, className }: CloneBarOnlyChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null)
    const chartInstance = useRef<Chart | null>(null)

    // Ambil hanya 10 data tertinggi
    const top10Data = [...data]
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)

    useEffect(() => {
        if (!chartRef.current) return
        if (chartInstance.current) chartInstance.current.destroy()
        const ctx = chartRef.current.getContext("2d")
        if (!ctx) return
        Chart.register(ChartDataLabels)
        const chartData: ChartData = {
            labels: top10Data.map((item) => item.label),
            datasets: [
                {
                    type: "bar",
                    label: title,
                    data: top10Data.map((item) => item.value),
                    backgroundColor: top10Data.map((item) => item.color || chartConfig.colors.primary),
                    borderRadius: 6,
                    borderWidth: 0,
                    order: 1,
                    datalabels: {
                        display: true,
                        anchor: "end",
                        align: "end",
                        color: "#333",
                        font: { weight: "bold", size: 12 },
                        formatter: (value: number) => value,
                    },
                },
            ],
        }
        const options: ChartOptions = {
            ...chartConfig.defaultOptions,
            scales: {
                y: {
                    type: "linear",
                    position: "left",
                    title: { display: true, text: title, font: { size: 12, weight: "bold" }, color: "#666" },
                    min: 0,
                    grid: { color: "rgba(0, 0, 0, 0.05)" },
                    ticks: { font: { size: 11 }, color: "#666" },
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 11 }, color: "#666" },
                },
            },
            plugins: {
                ...chartConfig.defaultOptions.plugins,
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            let label = context.dataset.label || ""
                            if (label) label += ": "
                            if (context.parsed.y !== null) label += context.parsed.y
                            return label
                        },
                    },
                },
                datalabels: {
                    display: true,
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
            if (chartInstance.current) chartInstance.current.destroy()
        }
    }, [data, title, className]) // tambahkan dependency jika perlu

    return (
        <Card className={`overflow-hidden shadow-lg border-0 ${className}`}>
            <CardHeader className="pb-2 bg-gradient-to-r from-red-200 to-red-300 border-b">
                <CardTitle className="text-lg font-medium text-black">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full -mr-20 -mt-20 opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-50 rounded-full -ml-16 -mb-16 opacity-20"></div>
                <div className="h-[300px] w-full relative z-10">
                    <canvas ref={chartRef} />
                </div>
            </CardContent>
        </Card>
    )
}
