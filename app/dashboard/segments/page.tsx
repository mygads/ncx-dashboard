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

// Fungsi untuk fetch data Unit dari Google Sheets
async function fetchUnitData() {
  const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
  const apiKey = process.env.NEXT_PUBLIC_SPREADSHEET_API_KEY;
  const sheetName = 'UNIT NCX';
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

// Fungsi untuk fetch insight Unit dari Google Sheets
async function fetchInsightUnit() {
  const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
  const apiKey = process.env.NEXT_PUBLIC_SPREADSHEET_API_KEY;
  const sheetName = 'Update Text (Looker Studio)';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!json.values || json.values.length < 1) return "";
  const headers = json.values[0];
  const idx = headers.findIndex((h: string) => h.toLowerCase().includes("insight unit"));
  if (idx === -1) return "";
  // Data insight ada di kolom ke-8 (idx + 1) pada baris header
  return headers[idx + 1] || "";
}

export default function UnitSegmentPage() {
  const [loading, setLoading] = useState(true)
  const [unitData, setUnitData] = useState<AMData[]>([])
  const [insightUnit, setInsightUnit] = useState("")
  const [selectedUnits, setSelectedUnits] = useState<string[]>([])
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
        const [unitDataResult, insightDataResult] = await Promise.all([fetchUnitData(), fetchInsightUnit()])

        setUnitData(unitDataResult)
        setInsightUnit(insightDataResult)

        // By default, select all Units
        setSelectedUnits((unitDataResult as { name: string }[]).map((unit) => unit.name))
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Sort Unit by total order descending for selection panel
  const sortedUnit = [...unitData].sort((a, b) => b.total - a.total);

  // Filter Units based on search term (from sorted list)
  const filteredUnits = sortedUnit.filter((unit) => unit.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Get data for selected Units
  const selectedUnitsData = unitData.filter((unit) => selectedUnits.includes(unit.name))

  // Calculate totals for selected Units
  const totalOrders = selectedUnitsData.reduce((sum, unit) => sum + unit.total, 0)
  const totalComplete = selectedUnitsData.reduce((sum, unit) => sum + unit.complete, 0)
  const totalFailed = selectedUnitsData.reduce((sum, unit) => sum + unit.failed, 0)
  const overallAchPercentage = totalOrders > 0 ? ((totalComplete / totalOrders) * 100).toFixed(2) : "0.00"

  // Toggle Unit selection
  const toggleUnit = (name: string) => {
    if (selectedUnits.includes(name)) {
      setSelectedUnits(selectedUnits.filter((unit) => unit !== name))
    } else {
      setSelectedUnits([...selectedUnits, name])
    }
  }

  // Select all Units
  const selectAllUnits = () => {
    setSelectedUnits(unitData.map((unit) => unit.name))
  }

  // Clear all selections
  const clearAllUnits = () => {
    setSelectedUnits([])
  }

  // Update charts when selected Units change
  useEffect(() => {
    updateBarChart()
    updatePieChart()
    updateAchChart()
  }, [selectedUnits])

  // Bar chart for total orders
  const updateBarChart = () => {
    if (!barChartRef.current) return

    const ctx = barChartRef.current.getContext("2d")
    if (!ctx) return

    // Destroy existing chart
    const chartInstance = Chart.getChart(barChartRef.current)
    if (chartInstance) {
      chartInstance.destroy()
    }

    // Sort data by total orders (descending)
    const sortedData = [...selectedUnitsData].sort((a, b) => b.total - a.total)

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: sortedData.map((unit) => unit.name.split(",")[0]), // Use first part of name
        datasets: [
          {
            label: "Total Orders",
            data: sortedData.map((unit) => unit.total),
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
            title: {
              display: true,
              text: "Total",
            },
          },
          x: {
            title: {
              display: true,
              text: "Uit",
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    })
  }

  // Pie chart for completion percentage
  const updatePieChart = () => {
    if (!pieChartRef.current) return

    const ctx = pieChartRef.current.getContext("2d")
    if (!ctx) return

    // Destroy existing chart
    const pieChartInstance = Chart.getChart(pieChartRef.current)
    if (pieChartInstance) {
      pieChartInstance.destroy()
    }

    // Hitung persentase complete dari semua Unit yang dipilih
    const totalCompletionsAll = selectedUnitsData.reduce((sum, unit) => sum + unit.complete, 0)
    // Urutkan selectedUnitsData dari persentase terbesar
    const sortedUnitsForPie = [...selectedUnitsData].sort((a, b) => {
      const pa = totalCompletionsAll > 0 ? (a.complete / totalCompletionsAll) * 100 : 0;
      const pb = totalCompletionsAll > 0 ? (b.complete / totalCompletionsAll) * 100 : 0;
      return pb - pa;
    });
    const labels = sortedUnitsForPie.map((unit) => unit.name.split(",")[0]);
    const dataPie = sortedUnitsForPie.map((unit) => totalCompletionsAll > 0 ? (unit.complete / totalCompletionsAll) * 100 : 0);

    new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
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
              font: {
                size: 12
              }
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

    // Destroy existing chart
    const chartInstance = Chart.getChart(achChartRef.current)
    if (chartInstance) {
      chartInstance.destroy()
    }

    // Sort data by total orders (descending)
    const sortedData = [...selectedUnitsData].sort((a, b) => b.total - a.total)

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: sortedData.map((unit) => unit.name.split(",")[0]),
        datasets: [
          {
            type: "bar",
            label: "Total",
            data: sortedData.map((am) => am.total),
            backgroundColor: "red",
            order: 1,
            yAxisID: "y",
          },
          {
            type: "line",
            label: "% ACH",
            data: sortedData.map((am) => am.achPercentage),
            borderColor: "#FF9999",
            borderWidth: 2,
            pointBackgroundColor: "#FF9999",
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
          y: {
            type: "linear",
            position: "left",
            beginAtZero: true,
            title: {
              display: true,
              text: "Total",
            },
          },
          y1: {
            type: "linear",
            position: "right",
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: "% ACH",
            },
            grid: {
              drawOnChartArea: false,
            },
          },
          x: {
            title: {
              display: true,
              text: "Unit",
            },
          },
        },
      },
    })
  }

  // Helper function to get color by index
  const getColorByIndex = (index: number) => {
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
      "#FFD700", // Gold
      "#00CED1", // Dark Turquoise
      "#DC143C", // Crimson
      "#A0522D", // Sienna
      "#20B2AA", // Light Sea Green
      "#B22222", // Fire Brick
      "#FF6347", // Tomato
      "#4682B4", // Steel Blue
      "#008B8B", // Dark Cyan
      "#B8860B", // Dark Goldenrod
      "#C71585", // Medium Violet Red
      "#556B2F", // Dark Olive Green
      "#8B0000", // Dark Red
      "#483D8B", // Dark Slate Blue
      "#008080", // Teal
      "#BDB76B", // Dark Khaki
      "#9932CC", // Dark Orchid
      "#FF00FF", // Magenta
      "#00FF7F", // Spring Green
      "#191970", // Midnight Blue
      "#FFA07A", // Light Salmon
      "#7CFC00", // Lawn Green
      "#D2691E", // Chocolate
      "#6495ED", // Cornflower Blue
      "#40E0D0", // Turquoise
      "#FFB6C1", // Light Pink
      "#A9A9A9", // Dark Gray
      "#F08080", // Light Coral
      "#E9967A", // Dark Salmon
      "#00FA9A", // Medium Spring Green
      "#8FBC8F", // Dark Sea Green
      "#CD5C5C", // Indian Red
      "#BA55D3", // Medium Orchid
      "#B0C4DE", // Light Steel Blue
      "#FFDAB9", // Peach Puff
      "#E6E6FA", // Lavender
      "#B0E0E6", // Powder Blue
      "#D8BFD8", // Thistle
      "#DDA0DD", // Plum
      "#F5DEB3", // Wheat
      "#FFFACD", // Lemon Chiffon
      "#F0E68C", // Khaki
      "#E0FFFF", // Light Cyan
      "#FAFAD2", // Light Goldenrod Yellow
      "#FFE4E1", // Misty Rose
      "#F5F5DC", // Beige
      "#FFF0F5", // Lavender Blush
      "#F5FFFA", // Mint Cream
      "#F0FFF0", // Honeydew
      "#F8F8FF", // Ghost White
      "#FFF5EE", // Seashell
      "#F5F5F5", // White Smoke
      "#FDF5E6", // Old Lace
      "#FFFAFA", // Snow
      "#FFFFF0", // Ivory
      "#FAEBD7", // Antique White
      "#FFE4B5", // Moccasin
      "#FFEBCD", // Blanched Almond
      "#FFEFD5", // Papaya Whip
      "#FFF8DC" // Cornsilk
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
          {/* Stat Cards */}
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
              {/* Bar Chart */}
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-lg font-medium mb-4">Unit Distribution</h2>
                  <div className="h-[300px] w-full">
                    <canvas ref={barChartRef} />
                  </div>
                </CardContent>
              </Card>

              {/* Pie Chart */}
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-lg font-medium mb-4">Complete (%)</h2>
                  <div className="h-[300px] w-full">
                    <canvas ref={pieChartRef} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Achievement Chart */}
            <Card>
              <CardContent className="p-4">
                <h2 className="text-lg font-medium mb-4">Unit Achievement</h2>
                <div className="h-[300px] w-full">
                  <canvas ref={achChartRef} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AM Selection Panel */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <div className="bg-red-600 text-white p-3 flex justify-between items-center">
                <div className="flex items-center">
                  <Checkbox
                    checked={selectedUnits.length === sortedUnit.length && sortedUnit.length > 0}
                    onCheckedChange={() => {
                      if (selectedUnits.length === sortedUnit.length) {
                        setSelectedUnits([])
                      } else {
                        setSelectedUnits(sortedUnit.map((unit) => unit.name))
                      }
                    }}
                    className="mr-2"
                  />
                  <span>Unit ({selectedUnits.length})</span>
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
                {filteredUnits.map((unit) => (
                  <div key={unit.name} className="flex items-center justify-between p-2 border-b">
                    <div className="flex items-center">
                      <Checkbox
                        checked={selectedUnits.includes(unit.name)}
                        onCheckedChange={() => toggleUnit(unit.name)}
                        className="mr-2"
                      />
                      <span>{unit.name}</span>
                    </div>
                    <span className="font-medium">{unit.total}</span>
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

        {/* Insight Card */}
        <Card>
          <CardContent className="p-4 prose max-w-none">
            <h2 className="text-lg font-medium">Insight Unit</h2>
            <p className="text-base">{insightUnit}</p>
          </CardContent>
        </Card>

        {/* Footer */}
        <LastUpdatedFooter />
      </div>
    </div>
  )
}
