"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Chart, registerables } from "chart.js"
// @ts-ignore
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DynamicHeader } from "@/components/dashboard/dinamic-header"
import { LastUpdatedDate, LastUpdatedFooter } from "@/components/dashboard/last-updated"
import { ModernStatCard } from "@/components/dashboard/modern-stat-card"
import { ModernPieChart } from "@/components/dashboard/modern-pie-chart"
import { ModernBarChart } from "@/components/dashboard/modern-bar-chart"
import { ModernHotdaBarChart } from "@/components/dashboard/modern-hotda-bar-chart"
import { chartConfig } from "@/lib/chart-config"
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
// async function fetchProgressData(): Promise<ProgressType> {
//   const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
//   const apiKey = process.env.NEXT_PUBLIC_SPREADSHEET_API_KEY;
//   const sheetName = 'MTDProgress NCX';
//   const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;
//   const res = await fetch(url);
//   const json = await res.json();
//   if (!json.values || json.values.length < 2) return {
//     COMPLETE: "-",
//     "IN PROGRESS": "-",
//     "PENDING BASO": "-",
//     "PENDING BILLING APROVAL": "-",
//   };
//   const rows: [string, string][] = json.values.slice(1); // skip header
//   const result: ProgressType = {
//     COMPLETE: '-',
//     "IN PROGRESS": '-',
//     "PENDING BASO": '-',
//     "PENDING BILLING APROVAL": '-',
//   };
//   rows.forEach(([status, count]) => {
//     const key = status.trim().toUpperCase() as keyof ProgressType;
//     if (result.hasOwnProperty(key)) {
//       result[key] = Number(count);
//     }
//   });
//   return result;
// }

// Fungsi untuk fetch data summary dari sheet UNIT NCX
async function fetchUnitSummary() {
  const spreadsheetId = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
  const apiKey = process.env.NEXT_PUBLIC_SPREADSHEET_API_KEY;
  const sheetName = 'UNIT NCX';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!json.values || json.values.length < 2) return {
    totalOrders: '-',
    totalFailed: '-',
    inProgress: '-',
    pendingBaso: '-',
    pendingBillingApproval: '-',
    totalComplete: '-',
    overallAchPercentage: '-',
  };
  const rows = json.values.slice(1); // skip header
  let totalOrders = 0;
  let totalFailed = 0;
  let inProgress = 0;
  let pendingBaso = 0;
  let pendingBillingApproval = 0;
  let totalComplete = 0;
  let achSum = 0;
  let achCount = 0;
  rows.forEach((cols: string[]) => {
    // Kolom: Total(1), Failed(2), In Progress Total(6), Pending BASO(7), Pending Bill Approval(9), Complete(10), % ACH(12)
    totalOrders += Number(cols[1]) || 0;
    totalFailed += Number(cols[2]) || 0;
    inProgress += Number(cols[6]) || 0;
    pendingBaso += Number(cols[7]) || 0;
    pendingBillingApproval += Number(cols[9]) || 0;
    totalComplete += Number(cols[10]) || 0;
    let ach = cols[12] || "0";
    ach = ach.replace(/%/g, "");
    const achNum = Number(ach);
    if (!isNaN(achNum)) {
      achSum += achNum;
      achCount++;
    }
  });
  return {
    totalOrders: totalOrders.toString(),
    totalFailed: totalFailed.toString(),
    inProgress: inProgress.toString(),
    pendingBaso: pendingBaso.toString(),
    pendingBillingApproval: pendingBillingApproval.toString(),
    totalComplete: totalComplete.toString(),
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
  // Filter hanya bulan di tahun ini dan <= bulan sekarang
  const filteredRows = rows.filter((cols: string[]) => {
    const [year, month] = (cols[0] || '').split('-');
    return Number(year) === currentYear && Number(month) >= 1 && Number(month) <= currentMonth;
  });
  // Penjumlahan YTD hanya bulan yang totalOrders > 0 DAN bulan <= bulan sekarang
  let ordersCompleteYTD = 0;
  filteredRows.forEach((cols: string[]) => {
    let totalOrders = Number(cols[1]);
    // Hanya jumlahkan bulan yang totalOrders > 0 DAN bulan <= bulan sekarang
    const [year, month] = (cols[0] || '').split('-');
    if (!isNaN(totalOrders) && totalOrders > 0 && Number(month) <= currentMonth) {
      ordersCompleteYTD += totalOrders;
    }
  });
  // Ach last month: ambil % ach pada bulan sebelum bulan sekarang, tidak peduli totalOrders
  let achLastMonth = 0;
  const lastMonthRow = filteredRows.find((cols: string[]) => {
    const [year, month] = (cols[0] || '').split('-');
    return Number(month) === currentMonth - 1;
  });
  if (lastMonthRow) {
    let ach = Number(lastMonthRow[2]);
    achLastMonth = isNaN(ach) ? 0 : ach;
  }
  const monthlyData = filteredRows.map((cols: string[], idx: number) => {
    const month = cols[0] || "";
    let totalOrders = Number(cols[1]);
    let achPercentage = Number(cols[2]);
    if (isNaN(totalOrders)) totalOrders = 0;
    if (isNaN(achPercentage)) achPercentage = 0;
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

  const [unitSummary, setUnitSummary] = useState({
    totalOrders: '-',
    totalFailed: '-',
    inProgress: '-',
    pendingBaso: '-',
    pendingBillingApproval: '-',
    totalComplete: '-',
    overallAchPercentage: '-',
  });
  const [ytdProgress, setYtdProgress] = useState<{ monthlyData: any[]; ordersCompleteYTD: string; achLastMonth: string }>({ monthlyData: [], ordersCompleteYTD: '-', achLastMonth: '-' });
  const [hotdaData, setHotdaData] = useState<{ location: string; count: number }[]>([]);

  // Fetch data dari Google Sheets saat mount
  useEffect(() => {
    fetchUnitSummary().then(setUnitSummary);
    fetchYTDProgress().then((result) =>
      setYtdProgress({
        ...result,
        achLastMonth: result.achLastMonth.toString(),
      })
    );
    FetchHotdaData().then(setHotdaData);
  }, []);

  // Build data object using unitSummary
  const data = {
    totalOrders: unitSummary.totalOrders,
    inProgress: unitSummary.inProgress,
    pendingBaso: unitSummary.pendingBaso,
    pendingBillingApproval: unitSummary.pendingBillingApproval,
    totalComplete: unitSummary.totalComplete,
    totalFailed: unitSummary.totalFailed,
    overallAchPercentage: unitSummary.overallAchPercentage,
    ordersCompleteYTD: ytdProgress.ordersCompleteYTD,
    achLastMonth: ytdProgress.achLastMonth,
    progressData: [
      { status: "PENDING BASO", percentage: Number(unitSummary.totalOrders) ? (Number(unitSummary.pendingBaso) / Number(unitSummary.totalOrders)) * 100 : 0, color: "#4169E1" },
      { status: "IN PROGRESS", percentage: Number(unitSummary.totalOrders) ? (Number(unitSummary.inProgress) / Number(unitSummary.totalOrders)) * 100 : 0, color: "#FFA500" },
      { status: "COMPLETE", percentage: Number(unitSummary.totalOrders) ? (Number(unitSummary.totalComplete) / Number(unitSummary.totalOrders)) * 100 : 0, color: "#32CD32" },
      { status: "PENDING BILLING APROVAL", percentage: Number(unitSummary.totalOrders) ? (Number(unitSummary.pendingBillingApproval) / Number(unitSummary.totalOrders)) * 100 : 0, color: "#DC3545" },
    ],
    monthlyData: ytdProgress.monthlyData.length ? ytdProgress.monthlyData : [],
    hotdaData: [hotdaData.length ? hotdaData : []],
  }

  // Add colors to progress data
  const progressDataWithColors = data.progressData.map((item) => ({
    ...item,
    color:
      item.status === "PENDING BASO"
        ? chartConfig.colors.pending
        : item.status === "IN PROGRESS"
        ? chartConfig.colors.inProgress
        : item.status === "COMPLETE"
        ? chartConfig.colors.complete
        : chartConfig.colors.pendingBilling,
  }))

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
      <div className="p-6 space-y-6 flex-1">
        <div className="flex justify-between items-center mb-2 px-2 py-2 rounded-lg bg-white shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700 tracking-tight text-sm">Last Update</span>
            <LastUpdatedDate className="text-rose-600 font-semibold px-2 py-0.5 rounded bg-rose-50 border border-rose-100 text-xs" dateFormat="date" />
          </div>
          <span className="text-xs font-medium text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 shadow-sm">Month to Date</span>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
          <ModernStatCard
            title="Total Orders"
            value={data.totalOrders}
            className="bg-gradient-to-br from-purple-800 via-purple-700 to-purple-900 text-white xl:col-span-1"
          />
          <ModernStatCard
            title="In Progress"
            value={data.inProgress}
            className="bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-500 text-white xl:col-span-1"
          />
          <ModernStatCard
            title="Pending BASO"
            value={data.pendingBaso}
            className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 text-white xl:col-span-1"
          />
          <ModernStatCard
            title="Pending Billing Approval"
            value={data.pendingBillingApproval}
            className="bg-gradient-to-br from-red-600 via-red-500 to-pink-500 text-white xl:col-span-1"
          />
          <ModernStatCard
            title="Total Complete"
            value={data.totalComplete}
            className="bg-gradient-to-br from-green-600 via-green-500 to-lime-400 text-white xl:col-span-1"
          />
          <ModernStatCard
            title="Total Failed"
            value={data.totalFailed}
            className="bg-gradient-to-br from-red-700 via-red-600 to-red-400 text-white xl:col-span-1"
          />
          <ModernStatCard
            title="Overall % ACH"
            value={`${data.overallAchPercentage}%`}
            className="bg-gradient-to-br from-purple-900 via-fuchsia-700 to-pink-600 text-white xl:col-span-1"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ModernPieChart data={progressDataWithColors} title="Persentase Progress MTD" />
          <ModernBarChart data={data.monthlyData} title="Orders Complete YTD" className="lg:col-span-2" />
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
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ach Last Month</span>
                {/* Trend label */}
                {Number(data.achLastMonth) > Number(data.overallAchPercentage) ? (
                <span className="flex items-center text-green-200 text-xs font-semibold bg-green-700/40 px-2 py-0.5 rounded">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                  Naik
                </span>
                ) : Number(data.achLastMonth) < Number(data.overallAchPercentage) ? (
                <span className="flex items-center text-rose-200 text-xs font-semibold bg-rose-700/40 px-2 py-0.5 rounded">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                  Turun
                </span>
                ) : (
                <span className="flex items-center text-gray-200 text-xs font-semibold bg-gray-700/40 px-2 py-0.5 rounded">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
                  Stabil
                </span>
                )}
              </div>
              <div className="absolute bottom-2 right-4 text-3xl font-bold">{data.achLastMonth}%</div>
              <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-white/10 via-pink-300/20 to-transparent rounded-b-lg" />
              </CardContent>
            </Card>
          </div>

          {/* HOTDA Bar Chart */}
          <ModernHotdaBarChart data={hotdaData} title="Jumlah Orders berdasarkan HOTDA" className="col-span-2" />
        </div>

        {/* Footer */}
        <LastUpdatedFooter />
      </div>
    </div>
  )
}
