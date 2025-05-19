"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/dashboard/stat-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UnitSegmentPage() {
  const [selectedUnit, setSelectedUnit] = useState<string>("All")

  // Mock data based on the screenshot
  const data = {
    totalOrders: 224,
    totalComplete: 35,
    totalFailed: 0,
    overallAchPercentage: 15.63,
    unitData: [
      { unit: "DGS", count: 107, percentage: 34.3 },
      { unit: "RBS", count: 62, percentage: 51.4 },
      { unit: "DSS", count: 37, percentage: 14.3 },
      { unit: "DPS", count: 18, percentage: 0 },
    ],
    unitAchData: [
      { unit: "DGS", total: 107, achPercentage: 11.21 },
      { unit: "RBS", total: 62, achPercentage: 13.51 },
      { unit: "DSS", total: 37, achPercentage: 0 },
      { unit: "DPS", total: 18, achPercentage: 0 },
    ],
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Insight Dashboard NCX-PRO SULBAGTENG 2025 | Overview by Unit
          </h1>
          <p className="text-gray-600">Last updated: 13 Mei 2025</p>
        </div>
        <div className="w-full md:w-64">
          <Select value={selectedUnit} onValueChange={setSelectedUnit}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Units</SelectItem>
              <SelectItem value="DGS">DGS</SelectItem>
              <SelectItem value="RBS">RBS</SelectItem>
              <SelectItem value="DSS">DSS</SelectItem>
              <SelectItem value="DPS">DPS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={data.totalOrders} className="bg-blue-600 text-white" />
        <StatCard title="Total Complete" value={data.totalComplete} className="bg-green-600 text-white" />
        <StatCard title="Total Failed" value={data.totalFailed} className="bg-red-600 text-white" />
        <StatCard title="Overall % ACH" value={`${data.overallAchPercentage}%`} className="bg-orange-500 text-white" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Unit Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[300px] w-full">
              <UnitBarChart data={data.unitData} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Complete (%)</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[300px] w-full">
              <UnitPieChart data={data.unitData} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Unit Achievement</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="h-[300px] w-full">
            <UnitAchievementChart data={data.unitAchData} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Insight Unit</CardTitle>
        </CardHeader>
        <CardContent className="p-4 prose max-w-none">
          <p className="text-base">
            <strong>[Update 13 May 2025, 12:00 WITA]</strong>
          </p>
          <p className="text-base">
            Segmen RBS unggul dalam persentase penyelesaian otomatis (ACH) dan ranking, namun terhambat oleh jumlah
            "Provision Issued" yang cukup tinggi. DGS memiliki total unit tertinggi tetapi kinerja ACH terendah, dengan
            banyak unit tertahan di "Pending BASO" dan "In Progress". DSS menunjukkan proporsi "Provision Issued" dan
            "In Progress" yang signifikan dibandingkan total unitnya. DPS memiliki total unit terendah dan tidak ada
            penyelesaian, dengan sebagian besar terhambat di "Pending BASO".
          </p>
          <p className="text-base">
            Fokuskan pada pengurangan hambatan "Pending BASO" di DGS dan DPS dengan mempercepat proses persetujuan.
            Tingkatkan efisiensi "Provision Issued" di RBS dan DSS untuk mempercepat penyelesaian proyek. Lakukan
            analisis mendalam mengapa DPS tidak mencatatkan penyelesaian apapun, dan berikan solusi spesifik.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Mock chart components - in a real implementation, these would use Chart.js
function UnitBarChart({ data }: { data: { unit: string; count: number; percentage: number }[] }) {
  return (
    <div className="flex h-full items-end justify-between gap-2">
      {data.map((item) => (
        <div key={item.unit} className="flex flex-col items-center">
          <div
            className="w-16 bg-black rounded-t"
            style={{ height: `${(item.count / 120) * 100}%`, backgroundColor: getUnitColor(item.unit) }}
          ></div>
          <div className="mt-2 text-sm font-medium">{item.unit}</div>
          <div className="text-xs text-gray-500">{item.count}</div>
        </div>
      ))}
    </div>
  )
}

function UnitPieChart({ data }: { data: { unit: string; count: number; percentage: number }[] }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="relative h-48 w-48 rounded-full border-8 border-transparent">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(
              ${getUnitColor("DGS")} 0% ${data[0].percentage}%, 
              ${getUnitColor("RBS")} ${data[0].percentage}% ${data[0].percentage + data[1].percentage}%, 
              ${getUnitColor("DSS")} ${data[0].percentage + data[1].percentage}% ${
                data[0].percentage + data[1].percentage + data[2].percentage
              }%, 
              ${getUnitColor("DPS")} ${data[0].percentage + data[1].percentage + data[2].percentage}% 100%
            )`,
          }}
        ></div>
      </div>
      <div className="ml-8 space-y-2">
        {data.map((item) => (
          <div key={item.unit} className="flex items-center">
            <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: getUnitColor(item.unit) }}></div>
            <span className="text-sm">
              {item.unit} ({item.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function UnitAchievementChart({ data }: { data: { unit: string; total: number; achPercentage: number }[] }) {
  return (
    <div className="flex h-full items-end justify-between gap-2">
      {data.map((item) => (
        <div key={item.unit} className="flex flex-col items-center">
          <div className="w-16 bg-red-500 rounded-t" style={{ height: `${(item.total / 120) * 100}%` }}></div>
          <div className="mt-2 text-sm font-medium">{item.unit}</div>
          <div className="text-xs text-gray-500">{item.achPercentage}%</div>
        </div>
      ))}
    </div>
  )
}

function getUnitColor(unit: string): string {
  switch (unit) {
    case "DGS":
      return "#000000" // Black
    case "RBS":
      return "#FF0000" // Red
    case "DSS":
      return "#808080" // Gray
    case "DPS":
      return "#800000" // Maroon
    default:
      return "#CCCCCC"
  }
}
