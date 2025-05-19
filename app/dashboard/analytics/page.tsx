"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Chart, registerables } from "chart.js"
Chart.register(...registerables)

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(false)
  const pieChartRef = useRef<HTMLCanvasElement>(null)
  const barChartRef = useRef<HTMLCanvasElement>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Mock data based on the screenshot
  const data = {
    totalOrders: 255,
    inProgress: 72,
    pendingBaso: 110,
    pendingBillingApproval: 19,
    totalComplete: 52,
    totalFailed: 0,
    overallAchPercentage: 20.39,
    ordersCompleteYTD: 949,
    achLastMonth: -73.33,
    progressData: [
      { status: "PENDING BASO", percentage: 43.5, color: "#4169E1" },
      { status: "IN PROGRESS", percentage: 28.5, color: "#FFA500" },
      { status: "COMPLETE", percentage: 20.6, color: "#32CD32" },
      { status: "PENDING BILLING APROVAL", percentage: 7.4, color: "#DC3545" },
    ],
    monthlyData: [
      { month: "Jan 2025", totalOrders: 159, achPercentage: 0 },
      { month: "Feb 2025", totalOrders: 213, achPercentage: 41 },
      { month: "Mar 2025", totalOrders: 330, achPercentage: 0 },
      { month: "Apr 2025", totalOrders: 195, achPercentage: -79 },
      { month: "May 2025", totalOrders: 52, achPercentage: -100 },
      { month: "Jun 2025", totalOrders: 0, achPercentage: 0 },
      { month: "Jul 2025", totalOrders: 0, achPercentage: 0 },
      { month: "Aug 2025", totalOrders: 0, achPercentage: 0 },
      { month: "Sep 2025", totalOrders: 0, achPercentage: 0 },
      { month: "Oct 2025", totalOrders: 0, achPercentage: 0 },
      { month: "Nov 2025", totalOrders: 0, achPercentage: 0 },
      { month: "Dec 2025", totalOrders: 0, achPercentage: 0 },
    ],
  }

  const handleRefresh = async () => {
    setLoading(true)
    // Simulate data refresh
    setTimeout(() => {
      setLastUpdated(new Date())
      setLoading(false)
    }, 1000)
  }

  useEffect(() => {
    // Create pie chart
    if (pieChartRef.current) {
      const ctx = pieChartRef.current.getContext("2d")
      if (ctx) {
        const pieChart = new Chart(ctx, {
          type: "pie",
          data: {
            labels: data.progressData.map((item) => item.status),
            datasets: [
              {
                data: data.progressData.map((item) => item.percentage),
                backgroundColor: data.progressData.map((item) => item.color),
                borderWidth: 0,
              },
            ],
          },
          options: {
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
          },
        })

        return () => {
          pieChart.destroy()
        }
      }
    }
  }, [data.progressData])

  useEffect(() => {
    // Create bar chart
    if (barChartRef.current) {
      const ctx = barChartRef.current.getContext("2d")
      if (ctx) {
        const barChart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: data.monthlyData.map((item) => item.month.split(" ")[0] + " " + item.month.split(" ")[1]),
            datasets: [
              {
                type: "bar",
                label: "Total Orders Complete",
                data: data.monthlyData.map((item) => item.totalOrders),
                backgroundColor: "#32CD32",
                order: 1,
                yAxisID: "y",
              },
              {
                type: "line",
                label: "% Ach Month per Month",
                data: data.monthlyData.map((item) => item.achPercentage),
                borderColor: "#800080",
                borderWidth: 2,
                pointBackgroundColor: "#800080",
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
            scales: {
              y: {
                type: "linear",
                position: "left",
                title: {
                  display: true,
                  text: "Total Orders Complete",
                },
                min: -500,
                max: 500,
                ticks: {
                  stepSize: 250,
                },
              },
              y1: {
                type: "linear",
                position: "right",
                title: {
                  display: true,
                  text: "% Ach Month per Month",
                },
                min: -100,
                max: 50,
                ticks: {
                  stepSize: 50,
                },
                grid: {
                  drawOnChartArea: false,
                },
              },
              x: {
                title: {
                  display: true,
                  text: "Bulan",
                  align: "center",
                },
              },
            },
            plugins: {
              legend: {
                position: "top",
              },
            },
          },
        })

        return () => {
          barChart.destroy()
        }
      }
    }
  }, [data.monthlyData])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Insight Dashboard NCX-PRO SULBAGTENG 2025 | Dashboard</h1>
        <div className="flex items-center">
          <Image
            src="/placeholder.svg?height=40&width=280"
            alt="Telkom Indonesia"
            width={280}
            height={40}
            className="bg-white rounded-full p-1"
          />
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-6 space-y-6 bg-gray-50 flex-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-medium">Update</span>
            <span className="text-red-600 border-b-2 border-red-600">19 Mei 2025</span>
          </div>
          <div className="text-right">
            <span className="text-red-600 font-medium">Month to Date</span>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
          <Card className="bg-purple-800 text-white">
            <CardContent className="p-4">
              <div className="text-sm font-medium">Total Orders</div>
              <div className="text-3xl font-bold mt-1">{data.totalOrders}</div>
            </CardContent>
          </Card>
          <Card className="bg-orange-500 text-white">
            <CardContent className="p-4">
              <div className="text-sm font-medium">In Progress</div>
              <div className="text-3xl font-bold mt-1">{data.inProgress}</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-600 text-white">
            <CardContent className="p-4">
              <div className="text-sm font-medium">Pending BASO</div>
              <div className="text-3xl font-bold mt-1">{data.pendingBaso}</div>
            </CardContent>
          </Card>
          <Card className="bg-red-600 text-white">
            <CardContent className="p-4">
              <div className="text-sm font-medium">Pending Billing Approval</div>
              <div className="text-3xl font-bold mt-1">{data.pendingBillingApproval}</div>
            </CardContent>
          </Card>
          <Card className="bg-green-600 text-white">
            <CardContent className="p-4">
              <div className="text-sm font-medium">Total Complete</div>
              <div className="text-3xl font-bold mt-1">{data.totalComplete}</div>
            </CardContent>
          </Card>
          <Card className="bg-red-600 text-white">
            <CardContent className="p-4">
              <div className="text-sm font-medium">Total Failed</div>
              <div className="text-3xl font-bold mt-1">{data.totalFailed}</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-900 text-white">
            <CardContent className="p-4">
              <div className="text-sm font-medium">Overall % ACH</div>
              <div className="text-3xl font-bold mt-1">{data.overallAchPercentage}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart */}
          <Card className="col-span-1">
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-4">Persentase Progress MTD</h2>
              <div className="h-[300px] w-full">
                <canvas ref={pieChartRef} />
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card className="col-span-2">
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-4">Orders Complete YTD</h2>
              <div className="h-[300px] w-full">
                <canvas ref={barChartRef} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="space-y-4">
            <Card className="bg-green-600 text-white">
              <CardContent className="p-4">
                <div className="text-sm font-medium">Orders Complete (YTD)</div>
                <div className="text-3xl font-bold mt-1">{data.ordersCompleteYTD}</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-800 text-white">
              <CardContent className="p-4">
                <div className="text-sm font-medium">Ach Last Month</div>
                <div className="text-3xl font-bold mt-1">{data.achLastMonth}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <Card className="col-span-2">
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-4">Jumlah Orders berdasarkan HOTDA</h2>
              <div className="h-[300px] w-full relative">
                <Image
                  src="/placeholder.svg?height=300&width=600"
                  alt="Map of Sulawesi"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-500">Data Last Updated: {lastUpdated.toLocaleString()} | Privacy Policy</div>
      </div>
    </div>
  )
}
