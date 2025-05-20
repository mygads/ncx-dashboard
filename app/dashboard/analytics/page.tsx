"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Chart, registerables } from "chart.js"
import { DynamicHeader } from "@/components/dashboard/dinamic-header"
import { LastUpdatedDate, LastUpdatedFooter } from "@/components/dashboard/last-updated"
Chart.register(...registerables)

// Define Google Maps global types
declare global {
  interface Window {
    initMap: () => void;
    google: typeof google;
  }
}

type ProgressType = {
  COMPLETE: number;
  "IN PROGRESS": number;
  "PENDING BASO": number;
  "PENDING BILLING APROVAL": number;
};

// Fungsi untuk fetch data dari Google Sheets
async function fetchProgressData(): Promise<ProgressType> {
  const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
  const apiKey = process.env.NEXT_PUBLIC_SPREADSHEET_API_KEY;
  const sheetName = 'MTDProgress NCX';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!json.values || json.values.length < 2) return {
    COMPLETE: 0,
    "IN PROGRESS": 0,
    "PENDING BASO": 0,
    "PENDING BILLING APROVAL": 0,
  };
  const rows: [string, string][] = json.values.slice(1); // skip header
  const result: ProgressType = {
    COMPLETE: 0,
    "IN PROGRESS": 0,
    "PENDING BASO": 0,
    "PENDING BILLING APROVAL": 0,
  };
  rows.forEach(([status, count]) => {
    const key = status.trim().toUpperCase() as keyof ProgressType;
    if (result.hasOwnProperty(key)) {
      result[key] = Number(count);
    }
  });
  return result;
}

// Fungsi untuk fetch data dari sheet UNIT NCX
async function fetchUnitSummary() {
  const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
  const apiKey = process.env.NEXT_PUBLIC_SPREADSHEET_API_KEY;
  const sheetName = 'UNIT NCX';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!json.values || json.values.length < 2) return { totalFailed: 0, overallAchPercentage: 0 };
  const rows = json.values.slice(1); // skip header
  let totalFailed = 0;
  let achSum = 0;
  let achCount = 0;
  rows.forEach((cols: string[]) => {
    // Failed di kolom ke-2, % ACH di kolom ke-12
    const failed = Number(cols[2]) || 0;
    let ach = cols[12] || "0";
    ach = ach.replace(/%/g, "");
    const achNum = Number(ach);
    if (!isNaN(achNum)) {
      achSum += achNum;
      achCount++;
    }
    totalFailed += failed;
  });
  return {
    totalFailed,
    overallAchPercentage: achCount > 0 ? (achSum / achCount) : 0,
  };
}

// Fungsi untuk fetch data dari sheet YTDProgress NCX
async function fetchYTDProgress() {
  const spreadsheetId = '1BerM6n1xjD9f8zRM0sn7Wz-YYNsmPxLJ4WmA7hwnCbc';
  const apiKey = 'AIzaSyANCiHKoVF1zyeBHIVCGrefzjPssZXYj34';
  const sheetName = 'YTDProgress NCX';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!json.values || json.values.length < 2) return { monthlyData: [], ordersCompleteYTD: 0, achLastMonth: 0 };
  const rows = json.values.slice(1); // skip header
  // Ambil tahun sekarang
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-based
  // Filter hanya 12 bulan di tahun ini
  const filteredRows = rows.filter((cols: string[]) => {
    const [year, month] = (cols[0] || '').split('-');
    return Number(year) === currentYear && Number(month) >= 1 && Number(month) <= 12;
  }).slice(0, 12);
  let ordersCompleteYTD = 0;
  let achLastMonth = 0;
  const monthlyData = filteredRows.map((cols: string[], idx: number) => {
    const month = cols[0] || "";
    let totalOrders = Number(cols[1]);
    let achPercentage = Number(cols[2]);
    if (isNaN(totalOrders)) totalOrders = 0;
    if (isNaN(achPercentage)) achPercentage = 0;
    ordersCompleteYTD += totalOrders;
    // Ambil Ach Last Month (bulan sebelumnya dari bulan sekarang)
    const [year, monthNum] = month.split("-");
    if (Number(monthNum) === currentMonth - 1) {
      achLastMonth = achPercentage;
    }
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let monthLabel = monthNames[Number(monthNum) - 1] + " " + year;
    return { month: monthLabel, totalOrders, achPercentage };
  });
  return { monthlyData, ordersCompleteYTD, achLastMonth };
}

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(false)
  const pieChartRef = useRef<HTMLCanvasElement>(null)
  const barChartRef = useRef<HTMLCanvasElement>(null)

  // State untuk data progress dari Google Sheets
  const [progress, setProgress] = useState<ProgressType>({
    COMPLETE: 0,
    "IN PROGRESS": 0,
    "PENDING BASO": 0,
    "PENDING BILLING APROVAL": 0,
  });

  const [unitSummary, setUnitSummary] = useState({ totalFailed: 0, overallAchPercentage: 0 });
  const [ytdProgress, setYtdProgress] = useState({ monthlyData: [], ordersCompleteYTD: 0, achLastMonth: 0 });

  // Fetch data dari Google Sheets saat mount
  useEffect(() => {
    fetchProgressData().then(setProgress);
    fetchUnitSummary().then(setUnitSummary);
    fetchYTDProgress().then(setYtdProgress);
  }, []);

  // Build data object using progress
  const totalOrders = progress.COMPLETE + progress["IN PROGRESS"] + progress["PENDING BASO"] + progress["PENDING BILLING APROVAL"];
  const data = {
    totalOrders,
    inProgress: progress["IN PROGRESS"],
    pendingBaso: progress["PENDING BASO"],
    pendingBillingApproval: progress["PENDING BILLING APROVAL"],
    totalComplete: progress.COMPLETE,
    totalFailed: unitSummary.totalFailed,
    overallAchPercentage: unitSummary.overallAchPercentage.toFixed(2),
    ordersCompleteYTD: ytdProgress.ordersCompleteYTD,
    achLastMonth: ytdProgress.achLastMonth,
    progressData: [
      { status: "PENDING BASO", percentage: totalOrders ? (progress["PENDING BASO"] / totalOrders) * 100 : 0, color: "#4169E1" },
      { status: "IN PROGRESS", percentage: totalOrders ? (progress["IN PROGRESS"] / totalOrders) * 100 : 0, color: "#FFA500" },
      { status: "COMPLETE", percentage: totalOrders ? (progress.COMPLETE / totalOrders) * 100 : 0, color: "#32CD32" },
      { status: "PENDING BILLING APROVAL", percentage: totalOrders ? (progress["PENDING BILLING APROVAL"] / totalOrders) * 100 : 0, color: "#DC3545" },
    ],
    monthlyData: ytdProgress.monthlyData.length ? ytdProgress.monthlyData : [
      { month: "Jan 2025", totalOrders: 0, achPercentage: 0 },
      { month: "Feb 2025", totalOrders: 0, achPercentage: 0 },
      { month: "Mar 2025", totalOrders: 0, achPercentage: 0 },
      { month: "Apr 2025", totalOrders: 0, achPercentage: 0 },
      { month: "May 2025", totalOrders: 0, achPercentage: 0 },
      { month: "Jun 2025", totalOrders: 0, achPercentage: 0 },
      { month: "Jul 2025", totalOrders: 0, achPercentage: 0 },
      { month: "Aug 2025", totalOrders: 0, achPercentage: 0 },
      { month: "Sep 2025", totalOrders: 0, achPercentage: 0 },
      { month: "Oct 2025", totalOrders: 0, achPercentage: 0 },
      { month: "Nov 2025", totalOrders: 0, achPercentage: 0 },
      { month: "Dec 2025", totalOrders: 0, achPercentage: 0 },
    ],
    hotdaData: [
      { location: "INNER - PALU", count: 113, lat: -0.9002, lng: 119.8779 },
      { location: "NORTH SULAWESI", count: 42, lat: 1.4748, lng: 124.842 },
      { location: "CENTRAL SULAWESI", count: 35, lat: -1.43, lng: 121.4456 },
      { location: "SOUTH SULAWESI", count: 28, lat: -5.1477, lng: 119.4327 },
      { location: "WEST SULAWESI", count: 18, lat: -2.8441, lng: 119.2321 },
    ],
  }

  useEffect(() => {
    if (pieChartRef.current) {
      const ctx = pieChartRef.current.getContext("2d");
      if (ctx) {
        const pieChart = new Chart(ctx, {
          type: "pie",
          data: {
            labels: data.progressData.map((item) => item.status),
            datasets: [
              {
                data: data.progressData.map((item) => Math.round(item.percentage)),
                backgroundColor: data.progressData.map((item) => item.color),
                borderWidth: 0,
              },
            ],
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
                    size: 12,
                  },
                },
              },
              tooltip: {
                callbacks: {
                  label: (context: any) => `${context.label}: ${Math.round(Number(context.raw))}%`,
                },
              },
            },
            animation: {
              onComplete: function () {
                const chart = this as Chart;
                const ctx = chart.ctx;
                ctx.save();
                chart.getDatasetMeta(0).data.forEach((arc: any, i: number) => {
                  const dataset = chart.data.datasets[0];
                  const value = dataset.data[i];
                  if (typeof value === 'number' && value > 0) {
                    // Chart.js v3+ arc geometry
                    const props = arc.getProps(['startAngle', 'endAngle', 'outerRadius', 'innerRadius', 'x', 'y'], true);
                    const midAngle = (props.startAngle + props.endAngle) / 2;
                    const radius = (props.outerRadius + props.innerRadius) / 2;
                    const x = props.x + Math.cos(midAngle) * radius * 0.7;
                    const y = props.y + Math.sin(midAngle) * radius * 0.7;
                    ctx.fillStyle = '#222';
                    ctx.font = 'bold 16px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(`${value}%`, x, y);
                  }
                });
                ctx.restore();
              }
            }
          },
        });
        return () => {
          pieChart.destroy();
        };
      }
    }
  }, [data.progressData]);

  useEffect(() => {
    // Create bar chart
    if (barChartRef.current) {
      const ctx = barChartRef.current.getContext("2d")
      if (ctx) {
        const barChart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: data.monthlyData.map((item) => item.month.split(" ")[0] + " " + item.month.split(" ")[1]),
            datasets: [
              {
                type: "bar",
                label: "Total Orders Complete",
                data: data.monthlyData.map((item) => item.totalOrders),
                backgroundColor: "#32CD32",
                order: 1,
                yAxisID: "y",
              },
              {
                type: "line",
                label: "% Ach Month per Month",
                data: data.monthlyData.map((item) => item.achPercentage),
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
              y: {
                type: "linear",
                position: "left",
                title: {
                  display: true,
                  text: "Total Orders Complete",
                },
                min: -500,
                max: 500,
                ticks: {
                  stepSize: 250,
                },
              },
              y1: {
                type: "linear",
                position: "right",
                title: {
                  display: true,
                  text: "% Ach Month per Month",
                },
                min: -100,
                max: 50,
                ticks: {
                  stepSize: 50,
                },
                grid: {
                  drawOnChartArea: false,
                },
              },
              x: {
                title: {
                  display: true,
                  text: "Bulan",
                  align: "center",
                },
              },
            },
            plugins: {
              legend: {
                position: "top",
              },
            },
          },
        })

        return () => {
          barChart.destroy()
        }
      }
    }
  }, [data.monthlyData])

  // Initialize Google Maps
  // useEffect(() => {
  //   // Load Google Maps API script
  //   const loadGoogleMapsScript = () => {
  //     const script = document.createElement("script")
  //     script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap`
  //     script.async = true
  //     script.defer = true
  //     document.head.appendChild(script)

  //     // Define the global initMap function
  //     window.initMap = () => {
  //       const mapElement = document.getElementById("google-map")
  //       if (mapElement) {
  //         // Center on Sulawesi
  //         const map = new google.maps.Map(mapElement, {
  //           center: { lat: -1.8312, lng: 120.0381 },
  //           zoom: 6,
  //           mapTypeId: "satellite",
  //         })

  //         // Add markers for each HOTDA
  //         data.hotdaData.forEach((location) => {
  //           const marker = new google.maps.Marker({
  //             position: { lat: location.lat, lng: location.lng },
  //             map: map,
  //             icon: {
  //               path: google.maps.SymbolPath.CIRCLE,
  //               scale: Math.sqrt(location.count) * 0.5,
  //               fillColor: "#FFFFFF",
  //               fillOpacity: 0.6,
  //               strokeWeight: 0.5,
  //               strokeColor: "#000000",
  //             },
  //           })

  //           // Add info window
  //           const infoWindow = new google.maps.InfoWindow({
  //             content: `
  //               <div style="padding: 10px; text-align: center;">
  //                 <strong>${location.location}</strong><br>
  //                 Total: ${location.count}
  //               </div>
  //             `,
  //           })

  //           marker.addListener("click", () => {
  //             infoWindow.open(map, marker)
  //           })
  //         })
  //       }
  //     }
  //   }

  //   // Check if Google Maps API is already loaded
  //   if (window.google && window.initMap) {
  //     // If already loaded, just initialize the map
  //     window.initMap()
  //   } else {
  //     loadGoogleMapsScript()
  //   }    return () => {
  //     // Clean up
  //     if (window.google && typeof window.initMap === 'function') {
  //       window.initMap = () => {};
  //       // @ts-ignore
  //       window.google = undefined;
  //     }
  //   }
  // }, [data.hotdaData])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <DynamicHeader />

      {/* Dashboard Content */}
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

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
          <Card className="bg-purple-800 text-white">
            <CardContent className="p-4">
              <div className="text-sm font-medium">Total Orders</div>
              <div className="text-3xl font-bold mt-1">{data.totalOrders}</div>
            </CardContent>
          </Card>
          <Card className="bg-orange-500 text-white">
            <CardContent className="p-4">
              <div className="text-sm font-medium">In Progress</div>
              <div className="text-3xl font-bold mt-1">{data.inProgress}</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-600 text-white">
            <CardContent className="p-4">
              <div className="text-sm font-medium">Pending BASO</div>
              <div className="text-3xl font-bold mt-1">{data.pendingBaso}</div>
            </CardContent>
          </Card>
          <Card className="bg-red-600 text-white">
            <CardContent className="p-4">
              <div className="text-sm font-medium">Pending Billing Approval</div>
              <div className="text-3xl font-bold mt-1">{data.pendingBillingApproval}</div>
            </CardContent>
          </Card>
          <Card className="bg-green-600 text-white">
            <CardContent className="p-4">
              <div className="text-sm font-medium">Total Complete</div>
              <div className="text-3xl font-bold mt-1">{data.totalComplete}</div>
            </CardContent>
          </Card>
          <Card className="bg-red-600 text-white">
            <CardContent className="p-4">
              <div className="text-sm font-medium">Total Failed</div>
              <div className="text-3xl font-bold mt-1">{data.totalFailed}</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-900 text-white">
            <CardContent className="p-4">
              <div className="text-sm font-medium">Overall % ACH</div>
              <div className="text-3xl font-bold mt-1">{data.overallAchPercentage}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart */}
          <Card className="col-span-1">
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-4">Persentase Progress MTD</h2>
              <div className="h-[300px] w-full">
                <canvas ref={pieChartRef} />
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card className="col-span-2">
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-4">Orders Complete YTD</h2>
              <div className="h-[300px] w-full">
                <canvas ref={barChartRef} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="space-y-4">
            <Card className="bg-green-600 text-white">
              <CardContent className="p-4">
                <div className="text-sm font-medium">Orders Complete (YTD)</div>
                <div className="text-3xl font-bold mt-1">{data.ordersCompleteYTD}</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-800 text-white">
              <CardContent className="p-4">
                <div className="text-sm font-medium">Ach Last Month</div>
                <div className="text-3xl font-bold mt-1">{data.achLastMonth}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Google Maps */}
          <Card className="col-span-2">
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-4">Jumlah Orders berdasarkan HOTDA</h2>
              <div id="google-map" className="h-[300px] w-full rounded-lg overflow-hidden"></div>
              <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                <div>Total: 4</div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mr-1"></div>
                  <div className="w-4 h-4 rounded-full bg-gray-400 mr-1"></div>
                  <div className="w-6 h-6 rounded-full bg-gray-400 mr-1"></div>
                  <span>113</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <LastUpdatedFooter />
      </div>
    </div>
  )
}
