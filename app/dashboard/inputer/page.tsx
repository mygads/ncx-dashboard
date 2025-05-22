"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import type { AMData, InsightData } from "@/lib/types"
import { Chart, registerables } from "chart.js"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { DynamicHeader } from "@/components/dashboard/dinamic-header"
import { LastUpdatedDate, LastUpdatedFooter } from "@/components/dashboard/last-updated"
import Loading from "@/components/ui/loading"
import { CloneStatCard } from "@/components/dashboard/clone-stat-card"
import { ClonePieChart } from "@/components/dashboard/clone-pie-chart"
import { CloneBarChart } from "@/components/dashboard/clone-bar-chart"
import { CloneBarOnlyChart } from "@/components/dashboard/clone-baronly-chart"
import { CloneInsightCard } from "@/components/dashboard/clone-insight-card"
Chart.register(...registerables)

// Fungsi untuk fetch data Imputer dari Google Sheets
async function fetchImputerData() {
  const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
  const apiKey = process.env.NEXT_PUBLIC_SPREADSHEET_API_KEY;
  const sheetName = 'INPUTER NCX';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!json.values || json.values.length < 2) return [];
  const rows = json.values.slice(1); // skip header
  return rows.map((cols: string[]) => {
    const name = cols[0] || "";
    const total = Number(cols[1]) || 0;
    const failed = Number(cols[2]) || 0;
    const complete = Number(cols[10]) || 0;
    let ach = cols[12] || "0";
    ach = ach.replace(/%/g, "");
    const achPercentage = Number(ach) || 0;
    return { name, total, failed, complete, achPercentage };
  });
}

// Fungsi untuk fetch insight Imputer dari Google Sheets
async function fetchInsightImputer() {
  const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
  const apiKey = process.env.NEXT_PUBLIC_SPREADSHEET_API_KEY;
  const sheetName = 'Update Text (Looker Studio)';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!json.values || json.values.length < 1) return "";
  const headers = json.values[0];
  const idx = headers.findIndex((h: string) => h.toLowerCase().includes("insight inputer"));
  if (idx === -1) return "";
  // Data insight ada di kolom ke-8 (idx + 1) pada baris header
  return headers[idx + 1] || "";
}

export default function ImputerPerformancePage() {
  const [loading, setLoading] = useState(true)
  const [imputerData, setImputerData] = useState<AMData[]>([])
  const [insightImputer, setInsightImputer] = useState("")
  const [selectedImputers, setSelectedImputers] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [imputerDataResult, insightDataResult] = await Promise.all([fetchImputerData(), fetchInsightImputer()])

        setImputerData(imputerDataResult)
        setInsightImputer(insightDataResult)

        // By default, select all Imputers
        setSelectedImputers((imputerDataResult as { name: string }[]).map((imputer) => imputer.name))
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Sort Imputers by total order descending for selection panel
  const sortedImputers = [...imputerData].sort((a, b) => b.total - a.total);

  // Filter Imputers based on search term (from sorted list)
  const filteredImputers = sortedImputers.filter((imputer) => imputer.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Get data for selected Imputers
  const selectedImputersData = imputerData.filter((imputer) => selectedImputers.includes(imputer.name))

  // Calculate totals for selected Imputers
  const totalOrders = selectedImputersData.reduce((sum, imputer) => sum + imputer.total, 0)
  const totalComplete = selectedImputersData.reduce((sum, imputer) => sum + imputer.complete, 0)
  const totalFailed = selectedImputersData.reduce((sum, imputer) => sum + imputer.failed, 0)
  const overallAchPercentage = totalOrders > 0 ? ((totalComplete / totalOrders) * 100).toFixed(2) : "0.00"

  // Toggle Imputer selection
  const toggleImputer = (name: string) => {
    if (selectedImputers.includes(name)) {
      setSelectedImputers(selectedImputers.filter((imputer) => imputer !== name))
    } else {
      setSelectedImputers([...selectedImputers, name])
    }
  }

  // Select all Imputers
  const selectAllImputers = () => {
    setSelectedImputers(imputerData.map((imputer) => imputer.name))
  }

  // Clear all selections
  const clearAllImputers = () => {
    setSelectedImputers([])
  }

  // Helper function to get color by index
  const getColorByIndex = (index: number) => {
    const colors = [
      "#333333", "#4B0082", "#006400", "#FF1493", "#FF4500", "#32CD32", "#FF8C00", "#1E90FF", "#8B008B", "#2F4F4F", "#FFD700", "#00CED1", "#DC143C", "#A0522D", "#20B2AA", "#B22222", "#FF6347", "#4682B4", "#008B8B", "#B8860B", "#C71585", "#556B2F", "#8B0000", "#483D8B", "#008080", "#BDB76B", "#9932CC", "#FF00FF", "#00FF7F", "#191970", "#FFA07A", "#7CFC00", "#D2691E", "#6495ED", "#40E0D0", "#FFB6C1", "#A9A9A9", "#F08080", "#E9967A", "#00FA9A", "#8FBC8F", "#CD5C5C", "#BA55D3", "#B0C4DE", "#FFDAB9", "#E6E6FA", "#B0E0E6", "#D8BFD8", "#DDA0DD", "#F5DEB3", "#FFFACD", "#F0E68C", "#E0FFFF", "#FAFAD2", "#FFE4E1", "#F5F5DC", "#FFF0F5", "#F5FFFA", "#F0FFF0", "#F8F8FF", "#FFF5EE", "#F5F5F5", "#FDF5E6", "#FFFAFA", "#FFFFF0", "#FAEBD7", "#FFE4B5", "#FFEBCD", "#FFEFD5", "#FFF8DC"
    ];
    return colors[index % colors.length];
  }

  // Sort selected imputers data by total orders descending (for all charts)
  const sortedSelectedImputersData = [...imputerData.filter((imputer) => selectedImputers.includes(imputer.name))].sort((a, b) => b.total - a.total)

  // Data for Distribution (Bar Only)
  const barOnlyChartData = sortedSelectedImputersData.map((imputer, i) => ({
    label: imputer.name,
    value: imputer.total,
    color: getColorByIndex(i),
  }))

  // Data for Complete (Pie)
  const totalCompletionsAll = sortedSelectedImputersData.reduce((sum, imputer) => sum + imputer.complete, 0)
  const pieChartData = sortedSelectedImputersData.map((imputer, i) => ({
    status: imputer.name,
    percentage: totalCompletionsAll > 0 ? (imputer.complete / totalCompletionsAll) * 100 : 0,
    color: getColorByIndex(i),
  }))

  // Data for Achievement (Bar+Line)
  const barChartData = sortedSelectedImputersData.map((imputer) => ({
    month: imputer.name,
    totalOrders: imputer.total,
    achPercentage: imputer.achPercentage,
  }))

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <DynamicHeader />
        <Loading />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <DynamicHeader />
      <div className="p-6 space-y-6 flex-1">
        <div className="flex justify-between items-center mb-2 px-2 py-2 rounded-lg bg-white shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700 tracking-tight text-sm">Last Update</span>
            <LastUpdatedDate className="text-rose-600 font-semibold px-2 py-0.5 rounded bg-rose-50 border border-rose-100 text-xs" dateFormat="date" />
          </div>
          <span className="text-xs font-medium text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 shadow-sm">Month to Date</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <CloneStatCard
            title="Total Orders"
            value={totalOrders}
            className="bg-gradient-to-br from-blue-700 via-blue-500 to-blue-300 text-white shadow-lg rounded-xl border border-blue-100"
          />
          <CloneStatCard
            title="Total Complete"
            value={totalComplete}
            className="bg-gradient-to-br from-green-700 via-green-500 to-green-300 text-white shadow-lg rounded-xl border border-green-100"
          />
          <CloneStatCard
            title="Total Failed"
            value={totalFailed}
            className="bg-gradient-to-br from-rose-700 via-rose-500 to-rose-300 text-white shadow-lg rounded-xl border border-rose-100"
          />
          <CloneStatCard
            title="Overall % ACH"
            value={`${overallAchPercentage}%`}
            className="bg-gradient-to-br from-yellow-500 via-orange-400 to-yellow-200 text-white shadow-lg rounded-xl border border-yellow-100"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <CloneBarOnlyChart data={barOnlyChartData} title="Inputer Distribution" />
              <ClonePieChart data={pieChartData} title="Complete (%)" />
            </div>
            <CloneBarChart data={barChartData} title="Inputer Achievement" />
          </div>
          <div className="lg:col-span-1">
            <Card className="h-full">
              <div className="bg-red-600 text-white p-3 flex justify-between items-center">
                <div className="flex items-center">
                  <Checkbox
                    checked={selectedImputers.length === sortedImputers.length && sortedImputers.length > 0}
                    onCheckedChange={() => {
                      if (selectedImputers.length === sortedImputers.length) {
                        setSelectedImputers([])
                      } else {
                        setSelectedImputers(sortedImputers.map((imputer) => imputer.name))
                      }
                    }}
                    className="mr-2"
                  />
                  <span>Inputer ({selectedImputers.length})</span>
                </div>
                <span>Total</span>
              </div>

              <div className="p-2 bg-gray-100">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Type to search"
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-auto max-h-[500px]">
                {filteredImputers.map((imputer) => (
                  <div key={imputer.name} className="flex items-center justify-between p-2 border-b">
                    <div className="flex items-center">
                      <Checkbox
                        checked={selectedImputers.includes(imputer.name)}
                        onCheckedChange={() => toggleImputer(imputer.name)}
                        className="mr-2"
                      />
                      <span>{imputer.name}</span>
                    </div>
                    <span className="font-medium">{imputer.total}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className="p-1 border rounded"
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button onClick={() => setCurrentPage((prev) => prev + 1)} className="p-1 border rounded">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">1 - 1 / 1</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
        <CloneInsightCard title="Insight Inputer" text={insightImputer} />
        <LastUpdatedFooter />
      </div>
    </div>
  )
}
