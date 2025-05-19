"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/dashboard/stat-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InputerPerformancePage() {
  const [selectedInputer, setSelectedInputer] = useState<string>("All")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("MTD")

  // Mock data based on the screenshot
  const data = {
    totalOrders: 224,
    totalComplete: 35,
    totalFailed: 0,
    overallAchPercentage: 15.63,
    inputerData: [
      { inputer: "SIFA", count: 56, percentage: 40 },
      { inputer: "YANTO", count: 56, percentage: 25.7 },
      { inputer: "MAGFIRAH", count: 44, percentage: 17.1 },
      { inputer: "NOVITA", count: 28, percentage: 11.4 },
      { inputer: "YUNI", count: 21, percentage: 5.8 },
      { inputer: "WAWAN", count: 19, percentage: 0 },
    ],
    inputerAchData: [
      { inputer: "SIFA", total: 56, achPercentage: 25 },
      { inputer: "MAGFIRAH", total: 44, achPercentage: 20.45 },
      { inputer: "NOVITA", total: 28, achPercentage: 10.71 },
      { inputer: "YUNI", total: 21, achPercentage: 28.57 },
      { inputer: "WAWAN", total: 19, achPercentage: 5.26 },
      { inputer: "YANTO", total: 56, achPercentage: 3.57 },
    ],
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Insight Dashboard NCX-PRO SULBAGTENG 2025 | Inputer Performance
          </h1>
          <p className="text-gray-600">Last updated: 13 Mei 2025</p>
        </div>
        <div className="flex gap-4">
          <div className="w-full md:w-40">
            <Select value={selectedInputer} onValueChange={setSelectedInputer}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Inputer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Inputers</SelectItem>
                {data.inputerData.map((item) => (
                  <SelectItem key={item.inputer} value={item.inputer}>
                    {item.inputer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-32">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MTD">MTD</SelectItem>
                <SelectItem value="YTD">YTD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Orders" value={data.totalOrders} className="bg-blue-600 text-white" />
            <StatCard title="Total Complete" value={data.totalComplete} className="bg-green-600 text-white" />
            <StatCard title="Total Failed" value={data.totalFailed} className="bg-red-600 text-white" />
            <StatCard
              title="Overall % ACH"
              value={`${data.overallAchPercentage}%`}
              className="bg-orange-500 text-white"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Inputer Distribution</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[300px] w-full">
                  <InputerBarChart data={data.inputerData} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Complete (%)</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[300px] w-full">
                  <InputerPieChart data={data.inputerData} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Inputer Achievement</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[300px] w-full">
                <InputerAchievementChart data={data.inputerAchData} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.inputerAchData.map((item) => (
                  <div key={item.inputer} className="flex justify-between items-center">
                    <div className="font-medium">{item.inputer}</div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-500">Total: {item.total}</div>
                      <div className="text-sm text-gray-500">Achievement: {item.achPercentage}%</div>
                      <div
                        className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden"
                        style={{
                          background: `linear-gradient(to right, ${getInputerColor(item.inputer)} ${item.achPercentage}%, #e5e7eb ${item.achPercentage}%)`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Insight Inputer</CardTitle>
            </CardHeader>
            <CardContent className="p-4 prose max-w-none">
              <p className="text-base">
                <strong>[Update 13 May 2025, 12:00 WITA]</strong>
              </p>
              <p className="text-base">
                Performa inputer NCX bervariasi secara signifikan, terlihat dari perbedaan jumlah data yang diinput dan
                status penyelesaian. Tantangan utama terletak pada tingginya jumlah data yang masih dalam status
                "Pending BASO" dan "Provision Issued", terutama bagi inputer dengan volume data tinggi. Hal ini
                mengindikasikan adanya hambatan dalam proses validasi dan penyelesaian order.
              </p>
              <p className="text-base">
                Untuk meningkatkan efektivitas, disarankan agar setiap inputer fokus pada prioritas penyelesaian data
                "Pending BASO" dengan berkoordinasi aktif dengan tim terkait untuk mempercepat proses validasi dan
                persetujuan. Hal ini akan membantu mengurangi "bottleneck" dan meningkatkan "throughput" secara
                keseluruhan.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Mock chart components - in a real implementation, these would use Chart.js
function InputerBarChart({ data }: { data: { inputer: string; count: number; percentage: number }[] }) {
  return (
    <div className="flex h-full items-end justify-between gap-2">
      {data.map((item) => (
        <div key={item.inputer} className="flex flex-col items-center">
          <div
            className="w-12 rounded-t"
            style={{ height: `${(item.count / 60) * 100}%`, backgroundColor: getInputerColor(item.inputer) }}
          ></div>
          <div className="mt-2 text-sm font-medium">{item.inputer.substring(0, 5)}</div>
          <div className="text-xs text-gray-500">{item.count}</div>
        </div>
      ))}
    </div>
  )
}

function InputerPieChart({ data }: { data: { inputer: string; count: number; percentage: number }[] }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="relative h-48 w-48 rounded-full border-8 border-transparent">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(
              ${getInputerColor("SIFA")} 0% ${data[0].percentage}%, 
              ${getInputerColor("YANTO")} ${data[0].percentage}% ${data[0].percentage + data[1].percentage}%, 
              ${getInputerColor("MAGFIRAH")} ${data[0].percentage + data[1].percentage}% ${
                data[0].percentage + data[1].percentage + data[2].percentage
              }%, 
              ${getInputerColor("NOVITA")} ${data[0].percentage + data[1].percentage + data[2].percentage}% ${
                data[0].percentage + data[1].percentage + data[2].percentage + data[3].percentage
              }%,
              ${getInputerColor("YUNI")} ${
                data[0].percentage + data[1].percentage + data[2].percentage + data[3].percentage
              }% ${data[0].percentage + data[1].percentage + data[2].percentage + data[3].percentage + data[4].percentage}%,
              ${getInputerColor("WAWAN")} ${
                data[0].percentage + data[1].percentage + data[2].percentage + data[3].percentage + data[4].percentage
              }% 100%
            )`,
          }}
        ></div>
      </div>
      <div className="ml-8 space-y-2">
        {data.map((item) => (
          <div key={item.inputer} className="flex items-center">
            <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: getInputerColor(item.inputer) }}></div>
            <span className="text-sm">
              {item.inputer} ({item.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function InputerAchievementChart({ data }: { data: { inputer: string; total: number; achPercentage: number }[] }) {
  return (
    <div className="flex h-full items-end justify-between gap-2">
      {data.map((item) => (
        <div key={item.inputer} className="flex flex-col items-center">
          <div className="w-12 bg-red-500 rounded-t" style={{ height: `${(item.total / 60) * 100}%` }}></div>
          <div className="mt-2 text-sm font-medium">{item.inputer.substring(0, 5)}</div>
          <div className="text-xs text-gray-500">{item.achPercentage}%</div>
        </div>
      ))}
    </div>
  )
}

function getInputerColor(inputer: string): string {
  switch (inputer) {
    case "SIFA":
      return "#000000" // Black
    case "YANTO":
      return "#808080" // Gray
    case "MAGFIRAH":
      return "#800000" // Maroon
    case "NOVITA":
      return "#FF6666" // Light Red
    case "YUNI":
      return "#333333" // Dark Gray
    case "WAWAN":
      return "#FFCC00" // Yellow
    default:
      return "#CCCCCC"
  }
}
