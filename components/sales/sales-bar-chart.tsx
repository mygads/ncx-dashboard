"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, type ChartConfiguration } from "chart.js/auto"

interface SalesBarChartProps {
  data: {
    month: string
    totalOrders: number
    achPercentage: number
  }[]
  title: string
  barColor?: string
  lineColor?: string
}

// Helper untuk menyingkat angka besar
function formatShortNumber(val: number) {
  if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(1) + ' B';
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + ' M';
  if (val >= 1_000) return (val / 1_000).toFixed(1) + ' K';
  return val.toString();
}

export function SalesBarChart({ data, title, barColor = "#EF4444", lineColor = "#3B82F6" }: SalesBarChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((item) => item.month),
        datasets: [
          {
            type: "bar",
            label: "Value",
            data: data.map((item) => Math.round(item.totalOrders)),
            backgroundColor: barColor,
            order: 1,
            yAxisID: "y",
            borderRadius: 4,
            datalabels: {
              anchor: 'end',
              align: 'end',
              rotation: -90,
              color: '#333',
              font: {
                style: 'italic',
                weight: 'normal',
              },
              formatter: function(value: number) {
                return formatShortNumber(value);
              },
              clamp: true,
            },
          },
          {
            type: "line",
            label: "% Achievement",
            data: data.map((item) => Math.round(item.achPercentage * 10) / 10),
            borderColor: lineColor,
            borderWidth: 2,
            pointBackgroundColor: lineColor,
            pointRadius: 4,
            fill: false,
            order: 0,
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "x",
        scales: {
          y: {
            type: "linear",
            position: "left",
            title: {
              display: true,
              text: "Value (Rp)",
              font: {
                weight: "bold",
              },
            },
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                const numValue = typeof value === "number" ? value : Number(value);
                return formatShortNumber(numValue);
              },
            },
          },
          y1: {
            type: "linear",
            position: "right",
            title: {
              display: true,
              text: "% Achievement",
              font: {
                weight: "bold",
              },
            },
            beginAtZero: true,
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              callback: function(value) { return value + "%"; },
            },
          },
        },
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || "";
                if (label) {
                  label += ": ";
                }
                if (context.datasetIndex === 0) {
                  label += formatShortNumber(context.parsed.y);
                } else {
                  label += context.parsed.y.toFixed(1) + "%";
                }
                return label;
              },
            },
          },
          datalabels: {
            display: function(context) {
              // Hanya tampilkan label pada bar, bukan line
              return context.dataset.type === 'bar';
            },
          },
        },
      },
    });
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, barColor, lineColor]);

  if (title) {
    return (
      <Card className={`overflow-hidden shadow-lg border-0`}>
        <CardHeader className="pb-2 bg-gradient-to-r from-red-200 to-red-300 border-b">
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
    );
  }
  return (
    <div className="h-full w-full">
      <canvas ref={chartRef} />
    </div>
  );
}
