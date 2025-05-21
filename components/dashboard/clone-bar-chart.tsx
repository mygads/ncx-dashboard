"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, type ChartConfiguration, type ChartData, type ChartOptions } from "chart.js/auto"
import { chartConfig } from "@/lib/chart-config"
import ChartDataLabels from 'chartjs-plugin-datalabels';

interface CloneBarChartProps {
  data: {
    month: string
    totalOrders: number
    achPercentage: number
  }[]
  title: string
  className?: string
}

export function CloneBarChart({ data, title, className }: CloneBarChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null)
    const chartInstance = useRef<Chart | null>(null)

    useEffect(() => {
        if (!chartRef.current) return
        const ctx = chartRef.current.getContext("2d")
        if (!ctx) return
        if (chartInstance.current) chartInstance.current.destroy()

        // Sort data descending by totalOrders
        const sortedData = [...data].sort((a, b) => b.totalOrders - a.totalOrders)

        Chart.register(ChartDataLabels)
        const chartData: ChartData = {
            labels: sortedData.map((item) => item.month),
            datasets: [
                {
                    type: "bar",
                    label: "Total Orders",
                    data: sortedData.map((item) => item.totalOrders),
                    backgroundColor: "#FF6347",
                    order: 1,
                    yAxisID: "y",
                    datalabels: {
                        display: true,
                        anchor: "end",
                        align: "end",
                        color: "#333",
                        font: { weight: "bold", size: 12 },
                        formatter: (value: number) => value,
                    },
                },
                {
                    type: "line",
                    label: "% ACH",
                    data: sortedData.map((item) => item.achPercentage),
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
                y: { type: "linear", position: "left", beginAtZero: true, title: { display: true, text: "Total" } },
                y1: { type: "linear", position: "right", beginAtZero: true, max: 100, title: { display: true, text: "% ACH" }, grid: { drawOnChartArea: false } },
                x: { title: { display: true, text: "Branch" } },
            },
            plugins: {
                legend: {
                    position: "top",
                    align: "end",
                    labels: {
                        usePointStyle: true,
                        boxWidth: 10,
                        boxHeight: 10,
                        padding: 15,
                        font: { size: 11 },
                    },
                },
                tooltip: {
                    mode: "index",
                    intersect: false,
                    callbacks: {
                        label: (context: any) => {
                            let label = context.dataset.label || ""
                            if (label) label += ": "
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
                    display: (context: any) => context.dataset.type === "bar",
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
    }, [data])

    return (
        <Card className={`overflow-hidden shadow-lg border-0 ${className}`}>
            <CardHeader className="pb-2 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <CardTitle className="text-lg font-medium text-gray-800">{title}</CardTitle>
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
