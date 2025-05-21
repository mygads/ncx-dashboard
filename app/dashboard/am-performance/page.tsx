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

// Helper function to get color by index
const getColorByIndex = (index: number) => {
  const colors = [
    "#333333", "#4B0082", "#006400", "#FF1493", "#FF4500", "#32CD32", "#FF8C00", "#1E90FF", "#8B008B", "#2F4F4F", "#FFD700", "#00CED1", "#DC143C", "#A0522D", "#20B2AA", "#B22222", "#FF6347", "#4682B4", "#008B8B", "#B8860B", "#C71585", "#556B2F", "#8B0000", "#483D8B", "#008080", "#BDB76B", "#9932CC", "#FF00FF", "#00FF7F", "#191970", "#FFA07A", "#7CFC00", "#D2691E", "#6495ED", "#40E0D0", "#FFB6C1", "#A9A9A9", "#F08080", "#E9967A", "#00FA9A", "#8FBC8F", "#CD5C5C", "#BA55D3", "#B0C4DE", "#FFDAB9", "#E6E6FA", "#B0E0E6", "#D8BFD8", "#DDA0DD", "#F5DEB3", "#FFFACD", "#F0E68C", "#E0FFFF", "#FAFAD2", "#FFE4E1", "#F5F5DC", "#FFF0F5", "#F5FFFA", "#F0FFF0", "#F8F8FF", "#FFF5EE", "#F5F5F5", "#FDF5E6", "#FFFAFA", "#FFFFF0", "#FAEBD7", "#FFE4B5", "#FFEBCD", "#FFEFD5", "#FFF8DC"
  ];
  return colors[index % colors.length];
}

// Fungsi untuk fetch data AM dari Google Sheets
async function fetchAMData() {
  const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
  const apiKey = process.env.NEXT_PUBLIC_SPREADSHEET_API_KEY;
  const sheetName = 'AM NCX';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!json.values || json.values.length < 2) return [];
  const rows = json.values.slice(1); // skip header
  return rows.map((cols: string[]) => {
    const name = cols[0] || "";
    const total = Number(cols[1]) || 0;
    const failed = Number(cols[2]) || 0;
    const complete = Number(cols[9]) || 0;
    let ach = cols[12] || "0";
    ach = ach.replace(/%/g, "");
    const achPercentage = Number(ach) || 0;
    return { name, total, failed, complete, achPercentage };
  });
}

// Fungsi untuk fetch insight AM dari Google Sheets
async function fetchInsightAM() {
  const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
  const apiKey = process.env.NEXT_PUBLIC_SPREADSHEET_API_KEY;
  const sheetName = 'Update Text (Looker Studio)';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!json.values || json.values.length < 1) return "";
  const headers = json.values[0];
  const idx = headers.findIndex((h: string) => h.toLowerCase().includes("insight am"));
  if (idx === -1) return "";
  // Data insight ada di kolom ke-8 (idx + 1) pada baris header
  return headers[idx + 1] || "";
}

export default function AMPerformancePage() {
  const [loading, setLoading] = useState(true)
  const [amData, setAMData] = useState<AMData[]>([])
  const [insightAM, setInsightAM] = useState("")
  const [selectedAMs, setSelectedAMs] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const barChartRef = useRef<HTMLCanvasElement>(null)
  const pieChartRef = useRef<HTMLCanvasElement>(null)
  const achChartRef = useRef<HTMLCanvasElement>(null)

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [amDataResult, insightDataResult] = await Promise.all([fetchAMData(), fetchInsightAM()])

        setAMData(amDataResult)
        setInsightAM(insightDataResult)

        // By default, select all AMs
        setSelectedAMs((amDataResult as { name: string }[]).map((am) => am.name))
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Sort AMs by total order descending for selection panel
  const sortedAMs = [...amData].sort((a, b) => b.total - a.total);

  // Filter AMs based on search term (from sorted list)
  const filteredAMs = sortedAMs.filter((am) => am.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Get data for selected AMs
  const selectedAMsData = amData.filter((am) => selectedAMs.includes(am.name))

  // Calculate totals for selected AMs
  const totalOrders = selectedAMsData.reduce((sum, am) => sum + am.total, 0)
  const totalComplete = selectedAMsData.reduce((sum, am) => sum + am.complete, 0)
  const totalFailed = selectedAMsData.reduce((sum, am) => sum + am.failed, 0)
  const overallAchPercentage = totalOrders > 0 ? ((totalComplete / totalOrders) * 100).toFixed(2) : "0.00"

  // Toggle AM selection
  const toggleAM = (name: string) => {
    if (selectedAMs.includes(name)) {
      setSelectedAMs(selectedAMs.filter((am) => am !== name))
    } else {
      setSelectedAMs([...selectedAMs, name])
    }
  }

  // Select all AMs
  const selectAllAMs = () => {
    setSelectedAMs(amData.map((am) => am.name))
  }

  // Clear all selections
  const clearAllAMs = () => {
    setSelectedAMs([])
  }


  // Sort selected AMs data by total orders descending (for all charts)
  const sortedSelectedAMsData = [...selectedAMsData].sort((a, b) => b.total - a.total)

  // Data for Distribution (Bar Only)
  const barOnlyChartData = sortedSelectedAMsData.map((am, i) => ({
    label: am.name,
    value: am.total,
    color: getColorByIndex(i),
  }))

  // Data for Complete (Pie)
  const totalCompletionsAll = sortedSelectedAMsData.reduce((sum, am) => sum + am.complete, 0)
  const pieChartData = sortedSelectedAMsData.map((am, i) => ({
    status: am.name,
    percentage: totalCompletionsAll > 0 ? (am.complete / totalCompletionsAll) * 100 : 0,
    color: getColorByIndex(i),
  }))

  // Data for Achievement (Bar+Line)
  const barChartData = sortedSelectedAMsData.map((am) => ({
    month: am.name,
    totalOrders: am.total,
    achPercentage: am.achPercentage,
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
      <div className="p-6 space-y-6 bg-gray-50 flex-1">
        
        <div className="flex justify-between items-center mb-2 px-2 py-2 rounded-lg bg-white/70 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700 tracking-tight text-sm">Last Update</span>
            <LastUpdatedDate className="text-rose-600 font-semibold px-2 py-0.5 rounded bg-rose-50 border border-rose-100 text-xs" dateFormat="date" />
          </div>
          <span className="text-xs font-medium text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 shadow-sm">Month to Date</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <CloneStatCard title="Total Orders" value={totalOrders} className="bg-blue-600 text-white" />
          <CloneStatCard title="Total Complete" value={totalComplete} className="bg-green-600 text-white" />
          <CloneStatCard title="Total Failed" value={totalFailed} className="bg-red-600 text-white" />
          <CloneStatCard title="Overall % ACH" value={`${overallAchPercentage}%`} className="bg-orange-500 text-white" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <CloneBarOnlyChart data={barOnlyChartData} title="AM Distribution" />
              <ClonePieChart data={pieChartData} title="Complete (%)" />
            </div>
            <CloneBarChart data={barChartData} title="AM Achievement" />
          </div>
          {/* ...existing selection panel code unchanged... */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <div className="bg-red-600 text-white p-3 flex justify-between items-center">
                <div className="flex items-center">
                  <Checkbox
                    checked={selectedAMs.length === sortedAMs.length && sortedAMs.length > 0}
                    onCheckedChange={() => {
                      if (selectedAMs.length === sortedAMs.length) {
                        setSelectedAMs([])
                      } else {
                        setSelectedAMs(sortedAMs.map((am) => am.name))
                      }
                    }}
                    className="mr-2"
                  />
                  <span>Account Manager ({selectedAMs.length})</span>
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
                {filteredAMs.map((am) => (
                  <div key={am.name} className="flex items-center justify-between p-2 border-b">
                    <div className="flex items-center">
                      <Checkbox
                        checked={selectedAMs.includes(am.name)}
                        onCheckedChange={() => toggleAM(am.name)}
                        className="mr-2"
                      />
                      <span>{am.name}</span>
                    </div>
                    <span className="font-medium">{am.total}</span>
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
        <CloneInsightCard title="Insight AM" text={insightAM} />
        <LastUpdatedFooter />
      </div>
    </div>
  )
}
