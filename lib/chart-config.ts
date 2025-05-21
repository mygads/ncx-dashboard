import { Chart, registerables, type ChartOptions } from "chart.js"
import ChartDataLabels from "chartjs-plugin-datalabels"

// Register Chart.js components and plugins
Chart.register(...registerables, ChartDataLabels)

// Shared chart configuration
export const chartConfig = {
  colors: {
    primary: "#6366f1",
    secondary: "#f43f5e",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#3b82f6",
    pending: "#4169E1",
    inProgress: "#FFA500",
    complete: "#32CD32",
    pendingBilling: "#DC3545",
    purple: "#8b5cf6",
    indigo: "#6366f1",
    blue: "#3b82f6",
    green: "#10b981",
    yellow: "#f59e0b",
    red: "#ef4444",
    pink: "#ec4899",
  },

  // Gradient backgrounds for charts
  createGradient: (ctx: CanvasRenderingContext2D, color: string) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400)
    gradient.addColorStop(0, `${color}dd`)
    gradient.addColorStop(1, `${color}33`)
    return gradient
  },

  // Default options for all charts
  defaultOptions: {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 15,
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 6,
        usePointStyle: true,
      },
      datalabels: {
        color: "#fff",
        font: {
          weight: "bold",
        },
        textShadow: "0 1px 2px rgba(0, 0, 0, 0.6)",
        formatter: (value: number) => {
          if (value < 1) return ""
          return value
        },
      },
    },
  } as ChartOptions,
}
