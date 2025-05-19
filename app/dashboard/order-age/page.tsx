"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/dashboard/stat-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

export default function OrderAgePage() {
  const [selectedAge, setSelectedAge] = useState<string>("All")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("MTD")

  // Mock data based on the screenshot
  const data = {
    totalOrders: 224,
    totalComplete: 35,
    totalFailed: 0,
    overallAchPercentage: 15.63,
    ageData: [
      { age: "Kurang Dari 1 Bulan", count: 131, percentage: 91.4 },
      { age: "1 - 3 Bulan", count: 78, percentage: 5.7 },
      { age: "3 - 6 Bulan", count: 9, percentage: 2.9 },
      { age: "6 - 12 Bulan", count: 4, percentage: 0 },
      { age: "Lebih Dari 12 Bulan", count: 2, percentage: 0 },
    ],
    ageAchData: [
      { age: "Kurang Dari 1 Bulan", total: 131, achPercentage: 24.43 },
      { age: "1 - 3 Bulan", total: 78, achPercentage: 2.56 },
      { age: "3 - 6 Bulan", total: 9, achPercentage: 0 },
      { age: "6 - 12 Bulan", total: 4, achPercentage: 0 },
      { age: "Lebih Dari 12 Bulan", total: 2, achPercentage: 50 },
    ],
    statusData: [
      { status: "Pending BASO", count: 103, percentage: 46 },
      { status: "In Progress", count: 78, percentage: 34.8 },
      { status: "Complete", count: 35, percentage: 15.6 },
      { status: "Pending Billing Approval", count: 8, percentage: 3.6 },
    ]
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Insight Dashboard NCX-PRO SULBAGTENG 2025 | Umur Order Detail
          </h1>
          <p className="text-gray-600">Last updated: 13 Mei 2025</p>
        </div>
        <div className="flex gap-4">
          <div className="w-full md:w-40">
            <Select value={selectedAge} onValueChange={setSelectedAge}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Umur Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Order Ages</SelectItem>
                {data.ageData.map((item) => (
                  <SelectItem key={item.age} value={item.age}>
                    {item.age}
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
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Orders" value={data.totalOrders} className="bg-blue-600 text-white" />
            <StatCard title="Total Complete" value={data.totalComplete} className="bg-green-600 text-white" />
            <StatCard title="Total Failed" value={data.totalFailed} className="bg-red-600 text-white" />
            <StatCard title="Overall % ACH" value={`${data.overallAchPercentage}%`} className="bg-orange-500 text-white" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Order Age Distribution</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[300px] w-full">
                  <OrderAgeBarChart data={data.ageData} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Complete (%)</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[300px] w-full">
                  <OrderAgePieChart data={data.ageData} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Order Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
              {data.statusData.map((status) => (
                <div key={status.status} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{status.status}</span>
                    <span className="text-gray-500">{status.percentage}%</span>
                  </div>
                  <Progress value={status.percentage} className="h-2" 
                    style={{
                      backgroundColor: status.status === "Complete" ? "#22c55e" : 
                                      status.status === "In Progress" ? "#f97316" :
                                      status.status === "Pending BASO" ? "#3b82f6" : "#ef4444"
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Order Age Achievement</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[300px] w-full">
                <OrderAgeAchievementChart data={data.ageAchData} />
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Age vs Completion Rate</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {data.ageAchData.map((item) => (
                    <div key={item.age} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.age}</span>
                        <span className="font-medium">{item.achPercentage}%</span>
                      </div>
                      <Progress value={item.achPercentage} className="h-2" />
                      <p className="text-xs text-gray-500">Total orders: {item.total}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Aging Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Average Order Age</span>
                    <span className="text-lg font-bold">28 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Oldest Order</span>
                    <span className="text-lg font-bold">398 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Orders &gt; 90 days</span>
                    <span className="text-lg font-bold">15 orders</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Completion Rate &lt; 30 days</span>
                    <span className="text-lg font-bold">24.43%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Insight Umur Order</CardTitle>
            </CardHeader>
            <CardContent className="p-4 prose max-w-none">
              <p className="text-base">
                <strong>[Update 13 May 2025, 12:00 WITA]</strong>
              </p>
              <p className="text-base">
                Sebagian besar order NCX diselesaikan dalam waktu kurang dari tiga bulan. Namun, terlihat ada sejumlah order
                yang tertunda cukup lama, bahkan lebih dari setahun, terutama terkait status "Pending BASO" (Pending
                Backoffice Support Operations). Hal ini menunjukkan adanya kendala dalam proses internal yang memperlambat
                penyelesaian order, khususnya yang membutuhkan dukungan tim back office. Untuk mempercepat penyelesaian
                order, fokuslah pada penanganan order yang berstatus "Pending BASO". Upaya sederhana yang bisa dilakukan
                adalah dengan menetapkan *Service Level Agreement* (SLA) yang jelas untuk tim back office dalam menanggapi
                dan menyelesaikan order yang tertunda. Dengan adanya SLA, diharapkan tim back office lebih responsif dan
                proses penyelesaian order bisa berjalan lebih cepat.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-red-50">
                  <h3 className="font-bold text-red-600 mb-2">High Priority</h3>
                  <p>Establish clear SLAs for BASO team to process pending orders within 14 days maximum</p>
                </div>
                <div className="p-4 border rounded-lg bg-amber-50">
                  <h3 className="font-bold text-amber-600 mb-2">Medium Priority</h3>
                  <p>Create a special task force to address orders older than 90 days</p>
                </div>
                <div className="p-4 border rounded-lg bg-green-50">
                  <h3 className="font-bold text-green-600 mb-2">Ongoing</h3>
                  <p>Implement weekly review of aging orders to prevent accumulation of old orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Mock chart components - in a real implementation, these would use Chart.js
function OrderAgeBarChart({ data }: { data: { age: string; count: number; percentage: number }[] }) {
  return (
    <div className="flex h-full items-end justify-between gap-2 overflow-x-auto pb-4">
      {data.map((item) => (
        <div key={item.age} className="flex flex-col items-center">
          <div
            className="w-16 rounded-t"
            style={{ height: `${(item.count / 150) * 100}%`, backgroundColor: getOrderAgeColor(item.age) }}
          ></div>
          <div className="mt-2 text-xs font-medium">{item.age.split(" ")[0]}</div>
          <div className="text-xs text-gray-500">{item.count}</div>
        </div>
      ))}
    </div>
  )
}

function OrderAgePieChart({ data }: { data: { age: string; count: number; percentage: number }[] }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="relative h-48 w-48 rounded-full border-8 border-transparent">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(
              ${getOrderAgeColor("Kurang Dari 1 Bulan")} 0% 91.4%, 
              ${getOrderAgeColor("1 - 3 Bulan")} 91.4% 97.1%, 
              ${getOrderAgeColor("3 - 6 Bulan")} 97.1% 100%
            )`,
          }}
        ></div>
      </div>
      <div className="ml-8 space-y-1 max-h-[300px] overflow-y-auto">
        {data.map((item) => (
          <div key={item.age} className="flex items-center">
            <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: getOrderAgeColor(item.age) }}></div>
            <span className="text-xs">
              {item.age} ({item.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function OrderAgeAchievementChart({ data }: { data: { age: string; total: number; achPercentage: number }[] }) {
  return (
    <div className="flex h-full items-end justify-between gap-1 overflow-x-auto pb-4">
      {data.map((item) => (
        <div key={item.age} className="flex flex-col items-center">
          <div className="w-16 bg-red-500 rounded-t" style={{ height: `${(item.total / 150) * 100}%` }}></div>
          <div className="mt-2 text-xs font-medium">{item.age.split(" ")[0]}</div>
          <div className="text-xs text-gray-500">{item.achPercentage}%</div>
        </div>
      ))}
    </div>
  )
}

function getOrderAgeColor(age: string): string {
  switch (age) {
    case "Kurang Dari 1 Bulan":
      return "#000000" // Black
    case "1 - 3 Bulan":
      return "#FF0000" // Red
    case "3 - 6 Bulan":
      return "#800000" // Maroon
    case "6 - 12 Bulan":
      return "#808080" // Gray
    case "Lebih Dari 12 Bulan":
      return "#333333" // Dark Gray
    default:
      return "#CCCCCC"
  }
}
