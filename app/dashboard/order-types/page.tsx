"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/dashboard/stat-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function OrderTypesPage() {
  const [selectedOrderType, setSelectedOrderType] = useState<string>("All")

  // Mock data based on the screenshot
  const data = {
    totalOrders: 230,
    totalComplete: 35,
    totalFailed: 0,
    overallAchPercentage: 15.22,
    orderTypeData: [
      { type: "New Install", count: 94, percentage: 40 },
      { type: "Renewal Agreement", count: 45, percentage: 20 },
      { type: "Disconnect", count: 27, percentage: 28.6 },
      { type: "Suspend", count: 23, percentage: 0 },
      { type: "Resume", count: 22, percentage: 0 },
      { type: "Modify", count: 12, percentage: 8.3 },
      { type: "Modify Price", count: 6, percentage: 0 },
      { type: "Modify BA", count: 1, percentage: 0 },
    ],
    orderTypeAchData: [
      { type: "New Install", total: 94, achPercentage: 1.06 },
      { type: "Renewal Agreement", total: 45, achPercentage: 4.44 },
      { type: "Disconnect", total: 27, achPercentage: 37.04 },
      { type: "Suspend", total: 23, achPercentage: 30.43 },
      { type: "Resume", total: 22, achPercentage: 63.64 },
      { type: "Modify", total: 12, achPercentage: 8.33 },
      { type: "Modify Price", total: 6, achPercentage: 0 },
      { type: "Modify BA", total: 1, achPercentage: 0 },
    ],
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Insight Dashboard NCX-PRO SULBAGTENG 2025 | Tipe Order Detail
          </h1>
          <p className="text-gray-600">Last updated: 13 Mei 2025</p>
        </div>
        <div className="w-full md:w-64">
          <Select value={selectedOrderType} onValueChange={setSelectedOrderType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tipe Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Order Types</SelectItem>
              {data.orderTypeData.map((item) => (
                <SelectItem key={item.type} value={item.type}>
                  {item.type}
                </SelectItem>
              ))}
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
            <CardTitle className="text-lg font-medium">Order Type Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[300px] w-full">
              <OrderTypeBarChart data={data.orderTypeData} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Complete (%)</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[300px] w-full">
              <OrderTypePieChart data={data.orderTypeData} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Order Type Achievement</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="h-[300px] w-full">
            <OrderTypeAchievementChart data={data.orderTypeAchData} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Insight Tipe Order</CardTitle>
        </CardHeader>
        <CardContent className="p-4 prose max-w-none">
          <p className="text-base">
            <strong>[Update 13 May 2025, 12:00 WITA]</strong>
          </p>
          <p className="text-base">
            Tipe order New Install memiliki jumlah terbesar dan didominasi status "Provision Issued" dan "In Progress".
            Sebaliknya, tipe Renewal Agreement dan Modify Price sebagian besar terhenti di "Pending BASO". Tipe order
            Resume memiliki persentase ACH tertinggi, tetapi juga banyak yang berstatus "Complete".
          </p>
          <p className="text-base">
            Untuk meningkatkan efisiensi, fokuslah pada percepatan proses "Pending BASO" pada tipe Renewal Agreement dan
            Modify Price. Hal ini dapat dilakukan dengan menyederhanakan alur persetujuan atau meningkatkan kapasitas
            tim BASO.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Mock chart components - in a real implementation, these would use Chart.js
function OrderTypeBarChart({ data }: { data: { type: string; count: number; percentage: number }[] }) {
  return (
    <div className="flex h-full items-end justify-between gap-2 overflow-x-auto pb-4">
      {data.map((item) => (
        <div key={item.type} className="flex flex-col items-center">
          <div
            className="w-10 rounded-t"
            style={{ height: `${(item.count / 100) * 100}%`, backgroundColor: getOrderTypeColor(item.type) }}
          ></div>
          <div className="mt-2 text-xs font-medium rotate-45 origin-top-left">{item.type.substring(0, 10)}</div>
          <div className="text-xs text-gray-500">{item.count}</div>
        </div>
      ))}
    </div>
  )
}

function OrderTypePieChart({ data }: { data: { type: string; count: number; percentage: number }[] }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="relative h-48 w-48 rounded-full border-8 border-transparent">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(
              ${getOrderTypeColor("Resume")} 0% 40%, 
              ${getOrderTypeColor("Disconnect")} 40% 68.6%, 
              ${getOrderTypeColor("Modify")} 68.6% 76.9%, 
              ${getOrderTypeColor("New Install")} 76.9% 100%
            )`,
          }}
        ></div>
      </div>
      <div className="ml-8 space-y-1 max-h-[300px] overflow-y-auto">
        {data.map((item) => (
          <div key={item.type} className="flex items-center">
            <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: getOrderTypeColor(item.type) }}></div>
            <span className="text-xs">
              {item.type} ({item.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function OrderTypeAchievementChart({ data }: { data: { type: string; total: number; achPercentage: number }[] }) {
  return (
    <div className="flex h-full items-end justify-between gap-1 overflow-x-auto pb-4">
      {data.map((item) => (
        <div key={item.type} className="flex flex-col items-center">
          <div className="w-10 bg-red-500 rounded-t" style={{ height: `${(item.total / 100) * 100}%` }}></div>
          <div className="mt-2 text-xs font-medium rotate-45 origin-top-left">{item.type.substring(0, 10)}</div>
          <div className="text-xs text-gray-500">{item.achPercentage}%</div>
        </div>
      ))}
    </div>
  )
}

function getOrderTypeColor(type: string): string {
  switch (type) {
    case "New Install":
      return "#000000" // Black
    case "Renewal Agreement":
      return "#FF0000" // Red
    case "Disconnect":
      return "#808080" // Gray
    case "Suspend":
      return "#800000" // Maroon
    case "Resume":
      return "#FF6666" // Light Red
    case "Modify":
      return "#333333" // Dark Gray
    case "Modify Price":
      return "#FF69B4" // Hot Pink
    case "Modify BA":
      return "#FFFF00" // Yellow
    default:
      return "#CCCCCC"
  }
}
