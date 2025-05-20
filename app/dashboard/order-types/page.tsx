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
Chart.register(...registerables)

// Fungsi untuk fetch data Tipe Order dari Google Sheets
async function fetchTipeOrderData() {
  const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
  const apiKey = process.env.NEXT_PUBLIC_SPREADSHEET_API_KEY;
  const sheetName = 'TIPE ORDER NCX';
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

// Fungsi untuk fetch insight Tipe Order dari Google Sheets
async function fetchInsightTipeOrder() {
  const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
  const apiKey = process.env.NEXT_PUBLIC_SPREADSHEET_API_KEY;
  const sheetName = 'Update Text (Looker Studio)';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!json.values || json.values.length < 1) return "";
  const headers = json.values[0];
  const idx = headers.findIndex((h: string) => h.toLowerCase().includes("insight tipe order"));
  if (idx === -1) return "";
  // Data insight ada di kolom ke-10 (idx + 1) pada baris header
  return headers[idx + 1] || "";
}

export default function OrderTypesPage() {
  const [loading, setLoading] = useState(true)
  const [orderData, setOrderData] = useState<any[]>([])
  const [insightOrder, setInsightOrder] = useState("")
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
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
        const [orderDataResult, insightOrderResult] = await Promise.all([
          fetchTipeOrderData(), fetchInsightTipeOrder()
        ])
        setOrderData(orderDataResult)
        setInsightOrder(insightOrderResult || "")
        setSelectedOrders((orderDataResult as { name: string }[]).map((o) => o.name))
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Sort orders by total order descending for selection panel
  const sortedOrders = [...orderData].sort((a, b) => b.total - a.total);
  // Filter orders based on search term (from sorted list)
  const filteredOrders = sortedOrders.filter((o) => o.name.toLowerCase().includes(searchTerm.toLowerCase()))
  // Get data for selected orders
  const selectedOrdersData = orderData.filter((o) => selectedOrders.includes(o.name))
  // Calculate totals for selected orders
  const totalOrders = selectedOrdersData.reduce((sum, o) => sum + o.total, 0)
  const totalComplete = selectedOrdersData.reduce((sum, o) => sum + o.complete, 0)
  const totalFailed = selectedOrdersData.reduce((sum, o) => sum + o.failed, 0)
  const overallAchPercentage = totalOrders > 0 ? ((totalComplete / totalOrders) * 100).toFixed(2) : "0.00"

  // Toggle order selection
  const toggleOrder = (name: string) => {
    if (selectedOrders.includes(name)) {
      setSelectedOrders(selectedOrders.filter((o) => o !== name))
    } else {
      setSelectedOrders([...selectedOrders, name])
    }
  }
  // Select all orders
  const selectAllOrders = () => {
    setSelectedOrders(orderData.map((o) => o.name))
  }
  // Clear all selections
  const clearAllOrders = () => {
    setSelectedOrders([])
  }

  // Update charts when selected orders change
  useEffect(() => {
    updateBarChart()
    updatePieChart()
    updateAchChart()
  }, [selectedOrders])

  // Bar chart for total orders
  const updateBarChart = () => {
    if (!barChartRef.current) return
    const ctx = barChartRef.current.getContext("2d")
    if (!ctx) return
    const chartInstance = Chart.getChart(barChartRef.current)
    if (chartInstance) chartInstance.destroy()
    const sortedData = [...selectedOrdersData].sort((a, b) => b.total - a.total)
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: sortedData.map((o) => o.name),
        datasets: [
          {
            label: "Total Orders",
            data: sortedData.map((o) => o.total),
            backgroundColor: sortedData.map((_, i) => getColorByIndex(i)),
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "Total" },
          },
          x: {
            title: { display: true, text: "Tipe Order" },
          },
        },
        plugins: { legend: { display: false } },
      },
    })
  }

  // Pie chart for completion percentage
  const updatePieChart = () => {
    if (!pieChartRef.current) return
    const ctx = pieChartRef.current.getContext("2d")
    if (!ctx) return
    const pieChartInstance = Chart.getChart(pieChartRef.current)
    if (pieChartInstance) pieChartInstance.destroy()
    const totalCompletionsAll = selectedOrdersData.reduce((sum, o) => sum + o.complete, 0)
    const sortedForPie = [...selectedOrdersData].sort((a, b) => {
      const pa = totalCompletionsAll > 0 ? (a.complete / totalCompletionsAll) * 100 : 0;
      const pb = totalCompletionsAll > 0 ? (b.complete / totalCompletionsAll) * 100 : 0;
      return pb - pa;
    });
    const labels = sortedForPie.map((o) => o.name)
    const dataPie = sortedForPie.map((o) => totalCompletionsAll > 0 ? (o.complete / totalCompletionsAll) * 100 : 0)
    new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            data: dataPie,
            backgroundColor: labels.map((_, i) => getColorByIndex(i)),
            borderWidth: 0
          }
        ]
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
              font: { size: 12 }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${Number(context.raw).toFixed(1)}%`
            }
          }
        },
        animation: {
          onComplete: function () {
            const chart = this as Chart;
            const ctx = chart.ctx;
            ctx.save();
            chart.getDatasetMeta(0).data.forEach((arc: any, i: number) => {
              const dataset = chart.data.datasets[0];
              const value = dataset.data[i];
              if (typeof value === 'number' && value > 10) {
                const props = arc.getProps(['startAngle', 'endAngle', 'outerRadius', 'innerRadius', 'x', 'y'], true);
                const midAngle = (props.startAngle + props.endAngle) / 2;
                const radius = (props.outerRadius + props.innerRadius) / 2;
                const x = props.x + Math.cos(midAngle) * radius * 0.7;
                const y = props.y + Math.sin(midAngle) * radius * 0.7;
                ctx.fillStyle = '#222';
                ctx.font = 'bold 16px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${Math.round(value)}%`, x, y);
              }
            });
            ctx.restore();
          }
        }
      }
    });
  }

  // Achievement chart
  const updateAchChart = () => {
    if (!achChartRef.current) return
    const ctx = achChartRef.current.getContext("2d")
    if (!ctx) return
    const chartInstance = Chart.getChart(achChartRef.current)
    if (chartInstance) chartInstance.destroy()
    const sortedData = [...selectedOrdersData].sort((a, b) => b.total - a.total)
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: sortedData.map((o) => o.name),
        datasets: [
          {
            type: "bar",
            label: "Total",
            data: sortedData.map((o) => o.total),
            backgroundColor: "#FF6347",
            order: 1,
            yAxisID: "y",
          },
          {
            type: "line",
            label: "% ACH",
            data: sortedData.map((o) => o.achPercentage),
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
          y: { type: "linear", position: "left", beginAtZero: true, title: { display: true, text: "Total" } },
          y1: { type: "linear", position: "right", beginAtZero: true, max: 100, title: { display: true, text: "% ACH" }, grid: { drawOnChartArea: false } },
          x: { title: { display: true, text: "Tipe Order" } },
        },
      },
    })
  }

  // Helper function to get color by index
  const getColorByIndex = (index: number) => {
    const colors = [
      "#333333", "#4B0082", "#006400", "#FF1493", "#FF4500", "#32CD32", "#FF8C00", "#1E90FF", "#8B008B", "#2F4F4F", "#FFD700", "#00CED1", "#DC143C", "#A0522D", "#20B2AA", "#B22222", "#FF6347", "#4682B4", "#008B8B", "#B8860B", "#C71585", "#556B2F", "#8B0000", "#483D8B", "#008080", "#BDB76B", "#9932CC", "#FF00FF", "#00FF7F", "#191970", "#FFA07A", "#7CFC00", "#D2691E", "#6495ED", "#40E0D0", "#FFB6C1", "#A9A9A9", "#F08080", "#E9967A", "#00FA9A", "#8FBC8F", "#CD5C5C", "#BA55D3", "#B0C4DE", "#FFDAB9", "#E6E6FA", "#B0E0E6", "#D8BFD8", "#DDA0DD", "#F5DEB3", "#FFFACD", "#F0E68C", "#E0FFFF", "#FAFAD2", "#FFE4E1", "#F5F5DC", "#FFF0F5", "#F5FFFA", "#F0FFF0", "#F8F8FF", "#FFF5EE", "#F5F5F5", "#FDF5E6", "#FFFAFA", "#FFFFF0", "#FAEBD7", "#FFE4B5", "#FFEBCD", "#FFEFD5", "#FFF8DC"
    ];
    return colors[index % colors.length];
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <DynamicHeader />
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <DynamicHeader />
      <div className="p-6 space-y-6 bg-gray-50 flex-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-medium">Update</span>
            <LastUpdatedDate className="text-red-600 border-b-2 border-red-600" dateFormat="date" />
          </div>
          <div className="text-right">
            <span className="text-red-600 font-medium">Month to Date</span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card className="bg-blue-600 text-white">
            <CardContent className="p-4">
              <div className="text-sm font-medium">Total Orders</div>
              <div className="text-3xl font-bold mt-1">{totalOrders}</div>
            </CardContent>
          </Card>
          <Card className="bg-green-600 text-white">
            <CardContent className="p-4">
              <div className="text-sm font-medium">Total Complete</div>
              <div className="text-3xl font-bold mt-1">{totalComplete}</div>
            </CardContent>
          </Card>
          <Card className="bg-red-600 text-white">
            <CardContent className="p-4">
              <div className="text-sm font-medium">Total Failed</div>
              <div className="text-3xl font-bold mt-1">{totalFailed}</div>
            </CardContent>
          </Card>
          <Card className="bg-orange-500 text-white">
            <CardContent className="p-4">
              <div className="text-sm font-medium">Overall % ACH</div>
              <div className="text-3xl font-bold mt-1">{overallAchPercentage}%</div>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-lg font-medium mb-4">Tipe Order Distribution</h2>
                  <div className="h-[300px] w-full">
                    <canvas ref={barChartRef} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-lg font-medium mb-4">Complete (%)</h2>
                  <div className="h-[300px] w-full">
                    <canvas ref={pieChartRef} />
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardContent className="p-4">
                <h2 className="text-lg font-medium mb-4">Tipe Order Achievement</h2>
                <div className="h-[300px] w-full">
                  <canvas ref={achChartRef} />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card className="h-full">
              <div className="bg-red-600 text-white p-3 flex justify-between items-center">
                <div className="flex items-center">
                  <Checkbox
                    checked={selectedOrders.length === sortedOrders.length && sortedOrders.length > 0}
                    onCheckedChange={() => {
                      if (selectedOrders.length === sortedOrders.length) {
                        setSelectedOrders([])
                      } else {
                        setSelectedOrders(sortedOrders.map((o) => o.name))
                      }
                    }}
                    className="mr-2"
                  />
                  <span>Tipe Order ({selectedOrders.length})</span>
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
                {filteredOrders.map((o) => (
                  <div key={o.name} className="flex items-center justify-between p-2 border-b">
                    <div className="flex items-center">
                      <Checkbox
                        checked={selectedOrders.includes(o.name)}
                        onCheckedChange={() => toggleOrder(o.name)}
                        className="mr-2"
                      />
                      <span>{o.name}</span>
                    </div>
                    <span className="font-medium">{o.total}</span>
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
        <Card>
          <CardContent className="p-4 prose max-w-none">
            <h2 className="text-lg font-medium">Insight Tipe Order</h2>
            <p className="text-base">{insightOrder}</p>
          </CardContent>
        </Card>
        <LastUpdatedFooter />
      </div>
    </div>
  )
}
