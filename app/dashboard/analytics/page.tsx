"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Chart, registerables } from "chart.js"
// @ts-ignore
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DynamicHeader } from "@/components/dashboard/dinamic-header"
import { LastUpdatedDate, LastUpdatedFooter } from "@/components/dashboard/last-updated"
Chart.register(...registerables, ChartDataLabels)

// Define Google Maps global types
declare global {
  interface Window {
    initMap: () => void;
    google: typeof google;
  }
}

type ProgressType = {
  COMPLETE: number | string;
  "IN PROGRESS": number | string;
  "PENDING BASO": number | string;
  "PENDING BILLING APROVAL": number | string;
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
    COMPLETE: "-",
    "IN PROGRESS": "-",
    "PENDING BASO": "-",
    "PENDING BILLING APROVAL": "-",
  };
  const rows: [string, string][] = json.values.slice(1); // skip header
  const result: ProgressType = {
    COMPLETE: '-',
    "IN PROGRESS": '-',
    "PENDING BASO": '-',
    "PENDING BILLING APROVAL": '-',
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
  if (!json.values || json.values.length < 2) return { totalFailed: '-', overallAchPercentage: '-' };
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
    totalFailed: totalFailed.toString(),
    overallAchPercentage: achCount > 0 ? (achSum / achCount).toFixed(2) : '-',
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
  if (!json.values || json.values.length < 2) return { monthlyData: [], ordersCompleteYTD: '-', achLastMonth: 0 };
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
  return { monthlyData, ordersCompleteYTD: ordersCompleteYTD.toString(), achLastMonth };
}

async function FetchHotdaData() {
  const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
  const apiKey = process.env.NEXT_PUBLIC_SPREADSHEET_API_KEY;
  const sheetName = 'BRANCH NCX';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!json.values || json.values.length < 2) return [];
  const rows = json.values.slice(1); // skip header
  return rows.map((cols: string[]) => ({
    location: cols[0] || "",
    count: Number(cols[1]) || 0,
  }));
}

export default function AnalyticsDashboard() {
  const pieChartRef = useRef<HTMLCanvasElement>(null)
  const barChartRef = useRef<HTMLCanvasElement>(null)
  const hotdaBarChartRef = useRef<HTMLCanvasElement>(null)

  // State untuk data progress dari Google Sheets
  const [progress, setProgress] = useState<ProgressType>({
    COMPLETE: '-',
    "IN PROGRESS": '-',
    "PENDING BASO": '-',
    "PENDING BILLING APROVAL": '-',
  });

  const [unitSummary, setUnitSummary] = useState<{ totalFailed: string; overallAchPercentage: string | number }>({ totalFailed: '-', overallAchPercentage: '-' });
  const [ytdProgress, setYtdProgress] = useState<{ monthlyData: any[]; ordersCompleteYTD: string; achLastMonth: string }>({ monthlyData: [], ordersCompleteYTD: '-', achLastMonth: '-' });
  const [hotdaData, setHotdaData] = useState<{ location: string; count: number }[]>([]);

  // Fetch data dari Google Sheets saat mount
  useEffect(() => {
    fetchProgressData().then(setProgress);
    fetchUnitSummary().then(setUnitSummary);
    fetchYTDProgress().then((result) =>
      setYtdProgress({
        ...result,
        achLastMonth: result.achLastMonth.toString(),
      })
    );
    FetchHotdaData().then(setHotdaData);
  }, []);

  // Build data object using progress
  const totalOrders = Number(progress.COMPLETE) + Number(progress["IN PROGRESS"]) + Number(progress["PENDING BASO"]) + Number(progress["PENDING BILLING APROVAL"]);
  const data = {
    totalOrders,
    inProgress: progress["IN PROGRESS"],
    pendingBaso: progress["PENDING BASO"],
    pendingBillingApproval: progress["PENDING BILLING APROVAL"],
    totalComplete: progress.COMPLETE,
    totalFailed: unitSummary.totalFailed,
    overallAchPercentage: typeof unitSummary.overallAchPercentage === "number"
      ? unitSummary.overallAchPercentage.toFixed(2)
      : unitSummary.overallAchPercentage,
    ordersCompleteYTD: ytdProgress.ordersCompleteYTD,
    achLastMonth: ytdProgress.achLastMonth,
    progressData: [
      { status: "PENDING BASO", percentage: totalOrders ? (Number(progress["PENDING BASO"]) / totalOrders) * 100 : 0, color: "#4169E1" },
      { status: "IN PROGRESS", percentage: totalOrders ? (Number(progress["IN PROGRESS"]) / totalOrders) * 100 : 0, color: "#FFA500" },
      { status: "COMPLETE", percentage: totalOrders ? (Number(progress.COMPLETE) / totalOrders) * 100 : 0, color: "#32CD32" },
      { status: "PENDING BILLING APROVAL", percentage: totalOrders ? (Number(progress["PENDING BILLING APROVAL"]) / totalOrders) * 100 : 0, color: "#DC3545" },
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
    // Create bar chart for Orders Complete YTD with MoM Orders growth line
    if (barChartRef.current) {
      const ctx = barChartRef.current.getContext("2d");
      if (ctx) {
        // Calculate MoM Orders growth percentage
        const orders = data.monthlyData.map((item: any) => item.totalOrders);
        const momOrdersGrowth = orders.map((val: number, idx: number, arr: number[]) => {
          if (idx === 0) return 0;
          const prev = arr[idx - 1];
          if (prev === 0) return 0;
          return Number((((val - prev) / prev) * 100).toFixed(2));
        });
        const barChart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: data.monthlyData.map((item: any) => item.month.split(" ")[0] + " " + item.month.split(" ")[1]),
            datasets: [
              {
                type: "bar",
                label: "Total Orders Complete",
                data: orders,
                backgroundColor: "#6366f1", // fixed indigo color
                order: 1,
                yAxisID: "y",
              },
              {
                type: "line",
                label: "% MoM Orders Growth",
                data: momOrdersGrowth,
                borderColor: "#f43f5e",
                backgroundColor: "#f43f5e",
                borderWidth: 3,
                pointBackgroundColor: "#f59e42",
                pointBorderColor: "#fff",
                pointRadius: 5,
                pointHoverRadius: 7,
                fill: false,
                order: 0,
                yAxisID: "y1",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "top",
              },
              tooltip: {
                enabled: true,
                callbacks: {
                  label: function(context: any) {
                    if (context.dataset.label === "% MoM Orders Growth") {
                      return `${context.label}: ${context.raw}%`;
                    }
                    return `${context.label}: ${context.raw}`;
                  },
                },
              },
              datalabels: {
                display: true,
                color: function(context: any) {
                  return context.dataset.type === 'bar' ? '#222' : '#f43f5e';
                },
                font: {
                  weight: 'bold',
                  size: 13,
                },
                anchor: function(context: any) {
                  return context.dataset.type === 'bar' ? 'end' : 'start';
                },
                align: function(context: any) {
                  return context.dataset.type === 'bar' ? 'end' : 'start';
                },
                formatter: function(value: number, context: any) {
                  if (context.dataset.type === 'bar') {
                    return value;
                  }
                  return value + '%';
                },
              },
            },
            scales: {
              y: {
                type: "linear",
                position: "left",
                title: {
                  display: true,
                  text: "Total Orders Complete",
                },
                min: 0,
                ticks: {
                  stepSize: 50,
                },
              },
              y1: {
                type: "linear",
                position: "right",
                title: {
                  display: true,
                  text: "% MoM Orders Growth",
                },
                ticks: {
                  callback: function(value: string | number) { return value + "%"; },
                  stepSize: 20,
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
          },
          plugins: [ChartDataLabels],
        });
        return () => {
          barChart.destroy();
        };
      }
    }
  }, [data.monthlyData]);

  useEffect(() => {
    if (hotdaBarChartRef.current && hotdaData.length > 0) {
      const ctx = hotdaBarChartRef.current.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: hotdaData.map((item) => item.location),
            datasets: [
              {
                label: 'Total Orders',
                data: hotdaData.map((item) => item.count),
                backgroundColor: '#6366f1',
                borderRadius: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (context: any) => `${context.label}: ${context.raw} orders`,
                },
              },
            },
            scales: {
              x: {
                title: { display: true, text: 'HOTDA' },
                ticks: { font: { size: 12 } },
              },
              y: {
                title: { display: true, text: 'Total Orders' },
                beginAtZero: true,
                ticks: { stepSize: 10 },
              },
            },
          },
        });
        return () => chart.destroy();
      }
    }
  }, [hotdaData]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <DynamicHeader />

      {/* Dashboard Content */}
      <div className="p-6 space-y-6 bg-gray-50 flex-1">
        <div className="flex justify-between items-center mb-2 px-2 py-2 rounded-lg bg-white/70 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700 tracking-tight text-sm">Last Update</span>
            <LastUpdatedDate className="text-rose-600 font-semibold px-2 py-0.5 rounded bg-rose-50 border border-rose-100 text-xs" dateFormat="date" />
          </div>
          <span className="text-xs font-medium text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 shadow-sm">Month to Date</span>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 relative">
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-800 via-purple-700 to-purple-900 text-white shadow-lg">
            <CardContent className="p-4 flex flex-col h-24 justify-between">
              <div className="text-sm font-medium">Total Orders</div>
              <div className="absolute bottom-2 right-4 text-3xl font-bold">{data.totalOrders}</div>
              <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-white/10 via-purple-400/20 to-transparent rounded-b-lg" />
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-500 text-white shadow-lg">
            <CardContent className="p-4 flex flex-col h-24 justify-between">
              <div className="text-sm font-medium">In Progress</div>
              <div className="absolute bottom-2 right-4 text-3xl font-bold">{data.inProgress}</div>
              <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-white/10 via-orange-300/20 to-transparent rounded-b-lg" />
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 text-white shadow-lg">
            <CardContent className="p-4 flex flex-col h-24 justify-between">
              <div className="text-sm font-medium">Pending BASO</div>
              <div className="absolute bottom-2 right-4 text-3xl font-bold">{data.pendingBaso}</div>
              <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-white/10 via-blue-300/20 to-transparent rounded-b-lg" />
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-pink-500 text-white shadow-lg">
            <CardContent className="p-4 flex flex-col h-24 justify-between">
              <div className="text-sm font-medium">Pending Billing Approval</div>
              <div className="absolute bottom-2 right-4 text-3xl font-bold">{data.pendingBillingApproval}</div>
              <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-white/10 via-red-300/20 to-transparent rounded-b-lg" />
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-500 to-lime-400 text-white shadow-lg">
            <CardContent className="p-4 flex flex-col h-24 justify-between">
              <div className="text-sm font-medium">Total Complete</div>
              <div className="absolute bottom-2 right-4 text-3xl font-bold">{data.totalComplete}</div>
              <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-white/10 via-green-300/20 to-transparent rounded-b-lg" />
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-red-400 text-white shadow-lg">
            <CardContent className="p-4 flex flex-col h-24 justify-between">
              <div className="text-sm font-medium">Total Failed</div>
              <div className="absolute bottom-2 right-4 text-3xl font-bold">{data.totalFailed}</div>
              <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-white/10 via-red-300/20 to-transparent rounded-b-lg" />
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-fuchsia-700 to-pink-600 text-white shadow-lg">
            <CardContent className="p-4 flex flex-col h-24 justify-between">
              <div className="text-sm font-medium">Overall % ACH</div>
              <div className="absolute bottom-2 right-4 text-3xl font-bold">{data.overallAchPercentage}%</div>
              <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-white/10 via-pink-300/20 to-transparent rounded-b-lg" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart */}
            <Card className="col-span-1 relative overflow-hidden bg-white shadow-lg border-0">
              {/* Decorative gradient blob */}

              <CardContent className="p-4 relative z-10">
                <h2 className="text-lg font-semibold mb-4 text-black flex items-center gap-2">
                Persentase Progress MTD
                </h2>
                <div className="h-[260px] w-full flex items-center justify-center relative">
                <canvas ref={pieChartRef} className="z-10" />
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
            <Card className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-500 to-lime-400 text-white shadow-lg">
              <CardContent className="p-4 flex flex-col h-24 justify-between">
                <div className="text-sm font-medium">Orders Complete (YTD)</div>
                <div className="absolute bottom-2 right-4 text-3xl font-bold">{data.ordersCompleteYTD}</div>
                <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-white/10 via-green-300/20 to-transparent rounded-b-lg" />
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-fuchsia-700 to-pink-600 text-white shadow-lg">
              <CardContent className="p-4 flex flex-col h-24 justify-between">
                <div className="text-sm font-medium">Ach Last Month</div>
                <div className="absolute bottom-2 right-4 text-3xl font-bold">{data.achLastMonth}%</div>
                <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-white/10 via-pink-300/20 to-transparent rounded-b-lg" />
              </CardContent>
            </Card>
          </div>

          {/* HOTDA Bar Chart */}
          <Card className="col-span-2">
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-4">Jumlah Orders berdasarkan HOTDA</h2>
              <div className="h-[300px] w-full">
                <canvas ref={hotdaBarChartRef} />
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
