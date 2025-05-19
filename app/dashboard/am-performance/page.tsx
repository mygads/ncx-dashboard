"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/dashboard/stat-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AMPerformancePage() {
  const [selectedAM, setSelectedAM] = useState<string>("All")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("MTD")

  // Updated mock data based on the screenshot
  const data = {
    totalOrders: 221,
    totalComplete: 35,
    totalFailed: 0,
    overallAchPercentage: 15.84,
    revenue: "Rp 835,020,296,-",
    sustain: "Rp 835,020,296,-",
    ngtma: 0,
    amData: [
      { am: "MUHAMMAD", count: 44, percentage: 22.9, revenue: 125000000 },
      { am: "P.TOAGO", count: 33, percentage: 17.1, revenue: 98500000 },
      { am: "BAWIAS", count: 28, percentage: 14.3, revenue: 87600000 },
      { am: "SHINTA", count: 23, percentage: 11.4, revenue: 76300000 },
      { am: "ARIEF", count: 17, percentage: 8.6, revenue: 65400000 },
      { am: "NUGROHO", count: 15, percentage: 5.7, revenue: 58700000 },
      { am: "AMAR", count: 12, percentage: 5.7, revenue: 45200000 },
      { am: "RIESKA", count: 12, percentage: 5.7, revenue: 43800000 },
      { am: "PRAMONO", count: 11, percentage: 2.9, revenue: 38500000 },
      { am: "Others", count: 8, percentage: 5.7, revenue: 25000000 },
    ],
    amAchData: [
      { am: "MUHAMMAD", total: 44, achPercentage: 18.18, target: 60 },
      { am: "P.TOAGO", total: 33, achPercentage: 3.03, target: 50 },
      { am: "BAWIAS", total: 28, achPercentage: 10.71, target: 45 },
      { am: "SHINTA", total: 23, achPercentage: 4.35, target: 40 },
      { am: "ARIEF", total: 17, achPercentage: 5.88, target: 35 },
      { am: "NUGROHO", total: 15, achPercentage: 26.67, target: 30 },
      { am: "RIESKA", total: 12, achPercentage: 0, target: 25 },
      { am: "AMAR", total: 12, achPercentage: 0, target: 25 },
      { am: "PRAMONO", total: 11, achPercentage: 9.09, target: 20 },
      { am: "LIMO", total: 8, achPercentage: 75, target: 15 },
      { am: "FAJAR", total: 7, achPercentage: 14.29, target: 15 },
      { am: "FIKRI", total: 5, achPercentage: 0, target: 10 },
      { am: "HALID", total: 3, achPercentage: 0, target: 10 },
      { am: "ZULFI", total: 2, achPercentage: 0, target: 5 },
      { am: "DJABAL", total: 1, achPercentage: 0, target: 5 },
    ],
    salesData: {
      indibizWifi: 144,
      indibizAstinet: 1800,
      sowan: 1,
    },
    targetMytens: {
      visiting: 200,
      accountProfile: 200,
    },
    salesDigital: {
      oca: 6,
      netmonk: 6,
      eazy: 6,
      pijar: 6,
    },
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">TARGET AM WBS SULBAGTENG 2025</h1>
          <p className="text-xl font-semibold text-red-600">Moh. Indra Pramono Rauf, ST. / 403671</p>
        </div>
        <div className="flex gap-4">
          <div className="w-full md:w-40">
            <Select value={selectedAM} onValueChange={setSelectedAM}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Account Manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Account Managers</SelectItem>
                {data.amData.map((item) => (
                  <SelectItem key={item.am} value={item.am}>
                    {item.am}
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
          <TabsTrigger value="targets">Targets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Card className="border-red-500 border-2">
              <CardHeader className="bg-red-600 text-white py-3">
                <CardTitle className="text-xl font-bold text-center">REVENUE</CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-2 gap-4">
                <Card className="bg-red-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-center text-lg font-medium">TOTAL</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <p className="text-center font-bold">{data.revenue}</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-center text-lg font-medium">SUSTAIN</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <p className="text-center font-bold">{data.sustain}</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-100 col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-center text-lg font-medium">NGTMA</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <p className="text-center font-bold">{data.ngtma}</p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            <Card className="border-red-500 border-2">
              <CardHeader className="bg-red-600 text-white py-3">
                <CardTitle className="text-xl font-bold text-center">SALES OPERASIONAL</CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-3 gap-4">
                <Card className="bg-red-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-center text-sm font-medium">AP WIFI INDIBIZ</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <p className="text-center font-bold text-2xl">{data.salesData.indibizWifi}</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-center text-sm font-medium">ASTINET INDIBIZ</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <p className="text-center font-bold text-2xl">{data.salesData.indibizAstinet}</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-center text-sm font-medium">SOWAN</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <p className="text-center font-bold text-2xl">{data.salesData.sowan}</p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            <Card className="border-red-500 border-2">
              <CardHeader className="bg-red-600 text-white py-3">
                <CardTitle className="text-xl font-bold text-center">TARGET MYTENS</CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-2 gap-4">
                <Card className="bg-red-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-center text-lg font-medium">VISITING</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <p className="text-center font-bold">{data.targetMytens.visiting} Kali</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-center text-lg font-medium">ACCOUNT PROFILE</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <p className="text-center font-bold">{data.targetMytens.accountProfile} Kali</p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            <Card className="border-red-500 border-2">
              <CardHeader className="bg-red-600 text-white py-3">
                <CardTitle className="text-xl font-bold text-center">SALES DIGITAL PRODUCT</CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-4 gap-4">
                <Card className="bg-red-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-center text-sm font-medium">OCA</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <p className="text-center font-bold text-2xl">{data.salesDigital.oca}</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-center text-sm font-medium">NETMONK</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <p className="text-center font-bold text-2xl">{data.salesDigital.netmonk}</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-center text-sm font-medium">EAZY</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <p className="text-center font-bold text-2xl">{data.salesDigital.eazy}</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-center text-sm font-medium">PIJAR</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <p className="text-center font-bold text-2xl">{data.salesDigital.pijar}</p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
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
                <CardTitle className="text-lg font-medium">AM Distribution</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[300px] w-full">
                  <AMBarChart data={data.amData} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Complete (%)</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[300px] w-full">
                  <AMPieChart data={data.amData} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">AM Achievement</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[300px] w-full">
                <AMAchievementChart data={data.amAchData} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targets" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Target vs Achievement</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[400px] w-full">
                <AMTargetChart data={data.amAchData} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Insight AM</CardTitle>
            </CardHeader>
            <CardContent className="p-4 prose max-w-none">
              <p className="text-base">
                <strong>[Update 13 May 2025, 12:00 WITA]</strong>
              </p>
              <p className="text-base">
                Kinerja Account Manager (AM) sangat bervariasi, terlihat dari perbedaan jumlah total akun yang dikelola
                dan persentase *ACH* (mungkin penyelesaian akun). Sebagian besar AM tidak memiliki akun yang gagal,
                namun banyak akun yang tertunda di berbagai tahapan seperti *Pending BASO* atau *Pending Bill Fulfill*,
                menunjukkan adanya *bottleneck* di beberapa proses.
              </p>
              <p className="text-base">
                Untuk meningkatkan kinerja, manajemen perlu meninjau dan mempercepat proses yang sering tertunda.
                Pelatihan tambahan untuk AM dapat membantu meningkatkan efisiensi dan mengurangi jumlah akun yang
                tertunda. Selain itu, identifikasi dan penyelesaian kendala yang spesifik akan berdampak positif pada
                produktivitas tim secara keseluruhan.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Mock chart components - in a real implementation, these would use Chart.js
function AMBarChart({ data }: { data: { am: string; count: number; percentage: number; revenue: number }[] }) {
  return (
    <div className="flex h-full items-end justify-between gap-2 overflow-x-auto pb-4">
      {data.map((item) => (
        <div key={item.am} className="flex flex-col items-center">
          <div
            className="w-8 rounded-t"
            style={{ height: `${(item.count / 50) * 100}%`, backgroundColor: getAMColor(item.am) }}
          ></div>
          <div className="mt-2 text-xs font-medium rotate-45 origin-top-left">{item.am.substring(0, 6)}</div>
          <div className="text-xs text-gray-500">{item.count}</div>
        </div>
      ))}
    </div>
  )
}

function AMPieChart({ data }: { data: { am: string; count: number; percentage: number; revenue: number }[] }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="relative h-48 w-48 rounded-full border-8 border-transparent">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(
              ${getAMColor("MUHAMMAD")} 0% ${data[0].percentage}%, 
              ${getAMColor("P.TOAGO")} ${data[0].percentage}% ${data[0].percentage + data[1].percentage}%, 
              ${getAMColor("BAWIAS")} ${data[0].percentage + data[1].percentage}% ${
                data[0].percentage + data[1].percentage + data[2].percentage
              }%, 
              ${getAMColor("SHINTA")} ${data[0].percentage + data[1].percentage + data[2].percentage}% ${
                data[0].percentage + data[1].percentage + data[2].percentage + data[3].percentage
              }%,
              ${getAMColor("ARIEF")} ${
                data[0].percentage + data[1].percentage + data[2].percentage + data[3].percentage
              }% ${
                data[0].percentage + data[1].percentage + data[2].percentage + data[3].percentage + data[4].percentage
              }%,
              ${getAMColor("Others")} ${
                data[0].percentage + data[1].percentage + data[2].percentage + data[3].percentage + data[4].percentage
              }% 100%
            )`,
          }}
        ></div>
      </div>
      <div className="ml-8 space-y-1 max-h-[300px] overflow-y-auto">
        {data.map((item) => (
          <div key={item.am} className="flex items-center">
            <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: getAMColor(item.am) }}></div>
            <span className="text-xs">
              {item.am} ({item.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AMAchievementChart({
  data,
}: { data: { am: string; total: number; achPercentage: number; target: number }[] }) {
  return (
    <div className="flex h-full items-end justify-between gap-1 overflow-x-auto pb-4">
      {data.map((item) => (
        <div key={item.am} className="flex flex-col items-center">
          <div className="w-6 bg-red-500 rounded-t" style={{ height: `${(item.total / 50) * 100}%` }}></div>
          <div className="mt-2 text-xs font-medium rotate-45 origin-top-left">{item.am.substring(0, 6)}</div>
          <div className="text-xs text-gray-500">{item.achPercentage}%</div>
        </div>
      ))}
    </div>
  )
}

function AMTargetChart({ data }: { data: { am: string; total: number; achPercentage: number; target: number }[] }) {
  return (
    <div className="flex h-full items-end justify-between gap-1 overflow-x-auto pb-4">
      {data.slice(0, 10).map((item) => (
        <div key={item.am} className="flex flex-col items-center">
          <div className="relative w-16">
            <div
              className="absolute bottom-0 w-full bg-blue-300 rounded-t"
              style={{ height: `${(item.target / 60) * 100}%` }}
            ></div>
            <div
              className="absolute bottom-0 w-full bg-red-500 rounded-t"
              style={{ height: `${(item.total / 60) * 100}%`, width: "50%", left: "25%" }}
            ></div>
          </div>
          <div className="mt-2 text-xs font-medium rotate-45 origin-top-left">{item.am.substring(0, 6)}</div>
          <div className="text-xs text-gray-500">Target: {item.target}</div>
          <div className="text-xs text-gray-500">Actual: {item.total}</div>
        </div>
      ))}
    </div>
  )
}

function getAMColor(am: string): string {
  const colors = [
    "#333333", // Dark Gray
    "#4B0082", // Indigo
    "#006400", // Dark Green
    "#FF1493", // Deep Pink
    "#FF4500", // Orange Red
    "#32CD32", // Lime Green
    "#FF8C00", // Dark Orange
    "#1E90FF", // Dodger Blue
    "#8B008B", // Dark Magenta
    "#2F4F4F", // Dark Slate Gray
  ]

  const amList = ["MUHAMMAD", "P.TOAGO", "BAWIAS", "SHINTA", "ARIEF", "NUGROHO", "AMAR", "RIESKA", "PRAMONO", "Others"]

  const index = amList.indexOf(am)
  return index >= 0 ? colors[index] : "#CCCCCC"
}
