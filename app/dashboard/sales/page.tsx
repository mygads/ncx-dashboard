"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Chart, registerables } from "chart.js/auto"
import { DynamicHeader } from "@/components/dashboard/dinamic-header"
import { LastUpdatedDate, LastUpdatedFooter } from "@/components/dashboard/last-updated"
import Loading from "@/components/ui/loading"
import { SalesPieChart } from "@/components/sales/sales-pie-chart"
import { SalesBarChart } from "@/components/sales/sales-bar-chart"
import type { RevenueData, RevenueChartData, RevenueSummary } from "@/lib/types"
import Image from "next/image"
import { SalesStatCard } from "@/components/sales/sales-stat-chart"
import { SalesInsightCard } from "@/components/sales/sales-insight-chart"

Chart.register(...registerables)

// Helper function to format currency
const formatCurrency = (value: string | number): string => {
  if (typeof value === "string") {
    // Remove 'Rp' and any commas, then parse
    value = Number.parseFloat(value.replace(/Rp|,/g, ""))
  }

  if (isNaN(Number(value))) return "Rp0"

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value))
}

// Helper function to format percentage
const formatPercentage = (value: string | number): string => {
  if (typeof value === "string") {
    // Remove '%' and parse
    value = Number.parseFloat(value.replace(/%/g, ""))
  }

  if (isNaN(Number(value))) return "0%"

  return `${Number(value).toFixed(2)}%`
}

// Helper function to get color by revenue type
const getRevenueTypeColor = (type: string): string => {
  switch (type) {
    case "Rev Smes":
      return "#EF4444" // red-500
    case "Rev Sustain":
      return "#3B82F6" // blue-500
    case "Rev Scaling":
      return "#10B981" // emerald-500
    case "NGTMA":
      return "#8B5CF6" // violet-500
    default:
      return "#6B7280" // gray-500
  }
}

// Fetch revenue data from Google Sheets
async function fetchRevenueData(): Promise<RevenueData[]> {
  try {
    const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID
    const apiKey = process.env.NEXT_PUBLIC_SPREADSHEET_API_KEY
    const sheetName = "Revenue"
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`

    const res = await fetch(url)
    const json = await res.json()

    if (!json.values || json.values.length < 2) {
      throw new Error("No data found in spreadsheet")
    }

    // Skip header row
    const rows = json.values.slice(1)

    return rows.map((row: any[]) => ({
      periode: row[0] || "",
      jenisPenjualan: row[1] || "",
      wilayah: row[2] || "",
      satuan: row[3] || "",
      nilai: row[4] || "",
      cumulative: row[5] || "",
      achieve: row[6] || "",
      growth: row[7] || "",
    }))
  } catch (error) {
    console.error("Error fetching revenue data:", error)
    return []
  }
}

// Fetch insight data from Google Sheets
async function fetchInsightRevenue(): Promise<string> {
  try {
    const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID
    const apiKey = process.env.NEXT_PUBLIC_SPREADSHEET_API_KEY
    const sheetName = "Update Text (Looker Studio)"
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`

    const res = await fetch(url)
    const json = await res.json()

    if (!json.values || json.values.length < 1) {
      return "No insight data available."
    }

    // Find the column index for "Insight Revenue BS"
    const headers = json.values[0]
    const insightIndex = headers.findIndex((header: string) => header.toLowerCase().includes("insight revenue bs"))

    if (insightIndex === -1) {
      return "Insight data not found."
    }

    // Get the insight text from the next column
    return headers[insightIndex + 1] || "No insight data available."
  } catch (error) {
    console.error("Error fetching insight data:", error)
    return "Error loading insight data."
  }
}

// Calculate revenue summary
function calculateRevenueSummary(data: RevenueData[]): RevenueSummary {
  const latestSmes = data
    .filter((item) => item.jenisPenjualan === "Rev Smes")
    .sort((a, b) => b.periode.localeCompare(a.periode))[0]

  const latestSustain = data
    .filter((item) => item.jenisPenjualan === "Rev Sustain")
    .sort((a, b) => b.periode.localeCompare(a.periode))[0]

  const latestScaling = data
    .filter((item) => item.jenisPenjualan === "Rev Scaling")
    .sort((a, b) => b.periode.localeCompare(a.periode))[0]

  const latestNGTMA = data
    .filter((item) => item.jenisPenjualan === "NGTMA")
    .sort((a, b) => b.periode.localeCompare(a.periode))[0]

  return {
    totalSmes: latestSmes?.cumulative || "Rp0",
    totalSustain: latestSustain?.cumulative || "Rp0",
    totalScaling: latestScaling?.cumulative || "Rp0",
    totalNGTMA: latestNGTMA?.cumulative || "Rp0",
  }
}

// Prepare data for pie chart
function preparePieChartData(data: RevenueData[]): any[] {
  const summary = calculateRevenueSummary(data)

  // Convert string values to numbers for calculation
  const smesValue = Number.parseFloat(summary.totalSmes.replace(/[^\d.-]/g, ""))
  const sustainValue = Number.parseFloat(summary.totalSustain.replace(/[^\d.-]/g, ""))
  const scalingValue = Number.parseFloat(summary.totalScaling.replace(/[^\d.-]/g, ""))
  const ngtmaValue = Number.parseFloat(summary.totalNGTMA.replace(/[^\d.-]/g, ""))

  const total = smesValue + sustainValue + scalingValue + ngtmaValue

  return [
    {
      status: "Rev Smes",
      percentage: total > 0 ? (smesValue / total) * 100 : 0,
      color: getRevenueTypeColor("Rev Smes"),
    },
    {
      status: "Rev Sustain",
      percentage: total > 0 ? (sustainValue / total) * 100 : 0,
      color: getRevenueTypeColor("Rev Sustain"),
    },
    {
      status: "Rev Scaling",
      percentage: total > 0 ? (scalingValue / total) * 100 : 0,
      color: getRevenueTypeColor("Rev Scaling"),
    },
    {
      status: "NGTMA",
      percentage: total > 0 ? (ngtmaValue / total) * 100 : 0,
      color: getRevenueTypeColor("NGTMA"),
    },
  ]
}

// Prepare data for bar charts
function prepareBarChartData(data: RevenueData[], revenueType: string): RevenueChartData[] {
  return data
    .filter((item) => item.jenisPenjualan === revenueType)
    .map((item) => ({
      month: item.periode.substring(5), // Extract month from "2024-01" format
      value: Number.parseFloat(item.nilai.replace(/[^\d.-]/g, "")),
      cumulative: Number.parseFloat(item.cumulative.replace(/[^\d.-]/g, "")),
      achieve: Number.parseFloat(item.achieve.replace(/[^\d.-]/g, "")),
      growth: Number.parseFloat(item.growth.replace(/[^\d.-]/g, "")),
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

export default function SalesOperationPage() {
  const [loading, setLoading] = useState(true)
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [insightText, setInsightText] = useState<string>("")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All")
  const [selectedTab, setSelectedTab] = useState<string>("overview")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [revenueResult, insightResult] = await Promise.all([fetchRevenueData(), fetchInsightRevenue()])

        setRevenueData(revenueResult)
        setInsightText(insightResult)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate revenue summary
  const revenueSummary = calculateRevenueSummary(revenueData)

  // Prepare data for charts
  const pieChartData = preparePieChartData(revenueData)
  const smesChartData = prepareBarChartData(revenueData, "Rev Smes")
  const sustainChartData = prepareBarChartData(revenueData, "Rev Sustain")
  const scalingChartData = prepareBarChartData(revenueData, "Rev Scaling")
  const ngtmaChartData = prepareBarChartData(revenueData, "NGTMA")

  // Format data for bar charts
  const formatBarChartData = (data: RevenueChartData[]) => {
    if (selectedPeriod === "All") return data.map((item) => ({
      month: item.month,
      totalOrders: Math.round(item.value),
      achPercentage: item.achieve,
    }))
    // Filter by full period (e.g. "2024-01")
    return data
      .filter((item) => `${new Date().getFullYear()}-${item.month}` === selectedPeriod)
      .map((item) => ({
        month: item.month,
        totalOrders: Math.round(item.value),
        achPercentage: item.achieve,
      }))
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <DynamicHeader />
        <Loading />
      </div>
    )
  }

  // Calculate total revenue
  const totalRevenue =
    Number.parseFloat(revenueSummary.totalSmes.replace(/[^\d.-]/g, "")) +
    Number.parseFloat(revenueSummary.totalSustain.replace(/[^\d.-]/g, "")) +
    Number.parseFloat(revenueSummary.totalScaling.replace(/[^\d.-]/g, "")) +
    Number.parseFloat(revenueSummary.totalNGTMA.replace(/[^\d.-]/g, ""))

  return (
    <div className="flex flex-col h-full">
      <DynamicHeader />

      <div className="p-6 space-y-6 flex-1 bg-gray-50">
        <div className="flex justify-between items-center mb-2 px-2 py-2 rounded-lg bg-white shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700 tracking-tight text-sm">Last Update</span>
            <LastUpdatedDate
              className="text-rose-600 font-semibold px-2 py-0.5 rounded bg-rose-50 border border-rose-100 text-xs"
              dateFormat="date"
            />
          </div>
          <div className="w-64">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Periods</SelectItem>
                {Array.from(new Set(revenueData.map((item) => item.periode)))
                  .sort()
                  .map((period) => (
                    <SelectItem key={period} value={period}>
                      {period}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList
            className="w-full flex gap-2 bg-gradient-to-r from-red-100 via-pink-100 to-blue-100 rounded-xl p-1 shadow border border-gray-200 mb-2"
          >
            <TabsTrigger
              value="overview"
              className="flex-1 py-2 rounded-lg font-semibold text-gray-700 data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-red-600 transition-all"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="flex-1 py-2 rounded-lg font-semibold text-gray-700 data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-blue-600 transition-all"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="analysis"
              className="flex-1 py-2 rounded-lg font-semibold text-gray-700 data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-fuchsia-600 transition-all"
            >
              Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 space-x-6">
              {/* Left: 1/3 width */}
              <div className="lg:col-span-1 space-y-4">
                <SalesStatCard
                  title="TOTAL REVENUE 2024"
                  value={formatCurrency(totalRevenue)}
                  className="shadow-md border-red-200"
                />

                <SalesStatCard
                  title="Revenue Smes (FY)"
                  value={formatCurrency(revenueSummary.totalSmes)}
                  className="shadow-md border-red-200"
                />

                <SalesStatCard
                  title="Revenue Sustain (FY)"
                  value={formatCurrency(revenueSummary.totalSustain)}
                  className="shadow-md border-red-200"
                />

                <SalesStatCard
                  title="Revenue Scaling (FY)"
                  value={formatCurrency(revenueSummary.totalScaling)}
                  className="shadow-md border-red-200"
                />

                <SalesStatCard
                  title="NGTMA (FY)"
                  value={formatCurrency(revenueSummary.totalNGTMA)}
                  className="shadow-md border-red-200"
                />
              </div>

              {/* Right: 2/3 width */}
              <div className="lg:col-span-2 space-y-6">
                <SalesPieChart data={pieChartData} title="Persentase Progress Revenue" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SalesBarChart
                    data={formatBarChartData(smesChartData)}
                    title="Revenue SMES"
                    barColor={getRevenueTypeColor("Rev Smes")}
                    lineColor="#8B5CF6"
                  />

            
                  <SalesBarChart
                    data={formatBarChartData(sustainChartData)}
                    title="Revenue Sustain"
                    barColor={getRevenueTypeColor("Rev Sustain")}
                    lineColor="#8B5CF6"
                  />
                </div>
              </div>
            </div>

            <SalesInsightCard title="Insight Unit Business Service" text={insightText || "-"} />
          </TabsContent>

          <TabsContent value="details" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
                    <SalesBarChart
                      data={formatBarChartData(scalingChartData)}
                      title="Revenue Scaling"
                      barColor={getRevenueTypeColor("Rev Scaling")}
                      lineColor="#8B5CF6"
                    />

              
                    <SalesBarChart
                      data={formatBarChartData(ngtmaChartData)}
                      title="NGTMA"
                      barColor={getRevenueTypeColor("NGTMA")}
                      lineColor="#8B5CF6"
                    />
            </div>

            <Card className="overflow-hidden shadow-lg border-0">
              <CardHeader className="pb-2 bg-gradient-to-r from-red-200 to-red-300 border-b">
                <CardTitle className="text-lg font-medium text-gray-800">Revenue Data Table</CardTitle>
              </CardHeader>
              <CardContent className="p-4 relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full -mr-20 -mt-20 opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-50 rounded-full -ml-16 -mb-16 opacity-20"></div>
                <div className="relative z-10 overflow-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Periode
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jenis Penjualan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nilai
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cumulative
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Achieve (%)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Growth (%)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {revenueData
                        .filter((item) => selectedPeriod === "All" || item.periode === selectedPeriod)
                        .map((item, index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.periode}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.jenisPenjualan}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.nilai}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.cumulative}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.achieve}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.growth}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="overflow-hidden shadow-lg border-0">
                <CardHeader className="pb-2 bg-gradient-to-r from-red-200 to-red-300 border-b">
                  <CardTitle className="text-lg font-medium text-gray-800">Revenue Growth Analysis</CardTitle>
                </CardHeader>
                <CardContent className="p-4 relative">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full -mr-20 -mt-20 opacity-20"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-50 rounded-full -ml-16 -mb-16 opacity-20"></div>
                  <div className="relative z-10">
                    <div className="space-y-4">
                      {["Rev Smes", "Rev Sustain", "Rev Scaling", "NGTMA"].map((type) => {
                        const typeData = revenueData.filter((item) => item.jenisPenjualan === type)
                        const avgGrowth =
                          typeData.reduce((sum, item) => sum + Number.parseFloat(item.growth.replace(/%/g, "")), 0) /
                          (typeData.length || 1)

                        return (
                          <div key={type} className="space-y-1">
                            <div className="flex justify-between">
                              <span className="font-medium">{type}</span>
                              <span className={`text-sm ${avgGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                                Avg Growth: {Math.round(avgGrowth * 10) / 10}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${avgGrowth >= 0 ? "bg-green-600" : "bg-red-600"}`}
                                style={{ width: `${Math.min(Math.abs(avgGrowth) * 2, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden shadow-lg border-0">
                <CardHeader className="pb-2 bg-gradient-to-r from-red-200 to-red-300 border-b">
                  <CardTitle className="text-lg font-medium text-gray-800">Achievement Analysis</CardTitle>
                </CardHeader>
                <CardContent className="p-4 relative">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full -mr-20 -mt-20 opacity-20"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-50 rounded-full -ml-16 -mb-16 opacity-20"></div>
                  <div className="relative z-10">
                    <div className="space-y-4">
                      {["Rev Smes", "Rev Sustain", "Rev Scaling", "NGTMA"].map((type) => {
                        const typeData = revenueData.filter((item) => item.jenisPenjualan === type)
                        const latestAchieve =
                          typeData.sort((a, b) => b.periode.localeCompare(a.periode))[0]?.achieve || "0%"
                        const achieveValue = Number.parseFloat(latestAchieve.replace(/%/g, ""))

                        return (
                          <div key={type} className="space-y-1">
                            <div className="flex justify-between">
                              <span className="font-medium">{type}</span>
                              <span className="text-sm">Latest Achievement: {latestAchieve}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="h-2.5 rounded-full bg-blue-600"
                                style={{ width: `${Math.min(achieveValue, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <SalesInsightCard title="Insight Unit Business Service" text={insightText || "-"} />
          </TabsContent>
        </Tabs>

          <div className="text-xs text-gray-500">
            <span className="font-semibold">Target FinOp 2025</span>
            <span className="ml-2 bg-red-600 text-white px-2 py-0.5 rounded">WBS SULBAGTENG</span>
          </div>

        <LastUpdatedFooter />
      </div>
    </div>
  )
}
