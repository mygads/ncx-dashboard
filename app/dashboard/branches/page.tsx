"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/dashboard/stat-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BranchDetailPage() {
  const [selectedHOTDA, setSelectedHOTDA] = useState<string>("All")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("MTD")

  // Mock data based on the screenshot
  const data = {
    totalOrders: 223,
    totalComplete: 35,
    totalFailed: 0,
    overallAchPercentage: 15.7,
    branchData: [
      { branch: "INNER - PALU", count: 106, percentage: 48.6 },
      { branch: "POSO", count: 36, percentage: 20 },
      { branch: "LUWUK", count: 34, percentage: 11.4 },
      { branch: "MOROWALI", count: 20, percentage: 0 },
      { branch: "GORONTALO", count: 15, percentage: 0 },
      { branch: "TOLITOLI", count: 6, percentage: 0 },
      { branch: "MARISA", count: 6, percentage: 0 },
      { branch: "KWANDANG", count: 1, percentage: 0 },
    ],
    branchAchData: [
      { branch: "INNER - PALU", total: 106, achPercentage: 15.09 },
      { branch: "POSO", total: 36, achPercentage: 0 },
      { branch: "LUWUK", total: 34, achPercentage: 11.76 },
      { branch: "MOROWALI", total: 20, achPercentage: 35 },
      { branch: "GORONTALO", total: 15, achPercentage: 26.67 },
      { branch: "TOLITOLI", total: 6, achPercentage: 0 },
      { branch: "MARISA", total: 6, achPercentage: 33.33 },
      { branch: "KWANDANG", total: 1, achPercentage: 0 },
    ],
    datelInfo: {
      name: "LUWUK",
      area: "Luwuk Banggai, Bangkep, Balut",
      manager: "AGUSTINUS KOMBER",
      nik: "700642",
    },
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 text-red-600">TARGET WBS DATEL {data.datelInfo.name} 2025</h1>
          <p className="text-xl font-semibold">Area: {data.datelInfo.area}</p>
        </div>
        <div className="flex gap-4">
          <div className="w-full md:w-40">
            <Select value={selectedHOTDA} onValueChange={setSelectedHOTDA}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="HOTDA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All HOTDAs</SelectItem>
                {data.branchData.map((item) => (
                  <SelectItem key={item.branch} value={item.branch}>
                    {item.branch}
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
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <h2 className="text-5xl font-bold mb-4">COMING SOON</h2>
              <p className="text-xl text-gray-500">This section is under development</p>
              <div className="mt-8 p-4 bg-red-600 text-white inline-block rounded-lg">
                <p className="font-bold">{data.datelInfo.manager}</p>
                <p>NIK: {data.datelInfo.nik}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
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
                <CardTitle className="text-lg font-medium">Branch Distribution</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[300px] w-full">
                  <BranchBarChart data={data.branchData} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Complete (%)</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[300px] w-full">
                  <BranchPieChart data={data.branchData} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Branch Achievement</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[300px] w-full">
                <BranchAchievementChart data={data.branchAchData} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Insight Branch</CardTitle>
            </CardHeader>
            <CardContent className="p-4 prose max-w-none">
              <p className="text-base">
                <strong>[Update 13 May 2025, 12:00 WITA]</strong>
              </p>
              <p className="text-base">
                Capaian antar cabang NCX sangat bervariasi, terlihat dari perbedaan signifikan jumlah HOTDA yang
                berhasil diselesaikan. Cabang dengan HOTDA besar seperti INNER - PALU terkendala pada jumlah "Pending
                BASO" yang tinggi, sementara cabang lain seperti POSO terhambat oleh "Provision Start" yang belum
                ditangani. Selain itu, beberapa cabang seperti TOLITOLI memiliki persentase ACH yang sangat rendah.
              </p>
              <p className="text-base">
                Untuk perbaikan cepat, cabang-cabang disarankan untuk melakukan *follow-up* intensif pada status
                "Pending BASO" atau "Provision Start" untuk mempercepat proses penyelesaian HOTDA.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Top Performing Branches</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {data.branchAchData
                    .filter((branch) => branch.achPercentage > 0)
                    .sort((a, b) => b.achPercentage - a.achPercentage)
                    .slice(0, 5)
                    .map((branch, index) => (
                      <div key={branch.branch} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center mr-3">
                            {index + 1}
                          </div>
                          <span>{branch.branch}</span>
                        </div>
                        <div className="font-bold">{branch.achPercentage}%</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Branches Needing Attention</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {data.branchAchData
                    .filter((branch) => branch.achPercentage === 0)
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 5)
                    .map((branch, index) => (
                      <div key={branch.branch} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-gray-400 text-white flex items-center justify-center mr-3">
                            {index + 1}
                          </div>
                          <span>{branch.branch}</span>
                        </div>
                        <div className="font-bold text-red-600">{branch.total} orders</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Mock chart components - in a real implementation, these would use Chart.js
function BranchBarChart({ data }: { data: { branch: string; count: number; percentage: number }[] }) {
  return (
    <div className="flex h-full items-end justify-between gap-2 overflow-x-auto pb-4">
      {data.map((item) => (
        <div key={item.branch} className="flex flex-col items-center">
          <div
            className="w-10 rounded-t"
            style={{ height: `${(item.count / 150) * 100}%`, backgroundColor: getBranchColor(item.branch) }}
          ></div>
          <div className="mt-2 text-xs font-medium rotate-45 origin-top-left">{item.branch.substring(0, 10)}</div>
          <div className="text-xs text-gray-500">{item.count}</div>
        </div>
      ))}
    </div>
  )
}

function BranchPieChart({ data }: { data: { branch: string; count: number; percentage: number }[] }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="relative h-48 w-48 rounded-full border-8 border-transparent">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(
              ${getBranchColor("INNER - PALU")} 0% 48.6%, 
              ${getBranchColor("POSO")} 48.6% 68.6%, 
              ${getBranchColor("LUWUK")} 68.6% 80%, 
              ${getBranchColor("MOROWALI")} 80% 100%
            )`,
          }}
        ></div>
      </div>
      <div className="ml-8 space-y-1 max-h-[300px] overflow-y-auto">
        {data.map((item) => (
          <div key={item.branch} className="flex items-center">
            <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: getBranchColor(item.branch) }}></div>
            <span className="text-xs">
              {item.branch} ({item.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BranchAchievementChart({ data }: { data: { branch: string; total: number; achPercentage: number }[] }) {
  return (
    <div className="flex h-full items-end justify-between gap-1 overflow-x-auto pb-4">
      {data.map((item) => (
        <div key={item.branch} className="flex flex-col items-center">
          <div className="w-10 bg-red-500 rounded-t" style={{ height: `${(item.total / 150) * 100}%` }}></div>
          <div className="mt-2 text-xs font-medium rotate-45 origin-top-left">{item.branch.substring(0, 10)}</div>
          <div className="text-xs text-gray-500">{item.achPercentage}%</div>
        </div>
      ))}
    </div>
  )
}

function getBranchColor(branch: string): string {
  switch (branch) {
    case "INNER - PALU":
      return "#000000" // Black
    case "POSO":
      return "#800000" // Maroon
    case "LUWUK":
      return "#FF0000" // Red
    case "MOROWALI":
      return "#800080" // Purple
    case "GORONTALO":
      return "#FF6666" // Light Red
    case "TOLITOLI":
      return "#808080" // Gray
    case "MARISA":
      return "#C0C0C0" // Silver
    case "KWANDANG":
      return "#FFFF00" // Yellow
    default:
      return "#CCCCCC"
  }
}
