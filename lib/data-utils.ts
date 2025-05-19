import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

export type DashboardData = {
  totalOrders: number
  inProgress: number
  pendingBaso: number
  pendingBillingApproval: number
  totalComplete: number
  totalFailed: number
  overallAchPercentage: number
  ordersCompleteYTD: number
  achLastMonth: number
  monthlyData: {
    month: string
    totalOrders: number
    achPercentage: number
  }[]
  progressData: {
    status: string
    percentage: number
  }[]
  regionData: {
    region: string
    count: number
  }[]
}

export async function fetchCSVData(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: ${response.statusText}`)
  }
  return await response.text()
}

export function parseCSVData(csvText: string): any[] {
  const lines = csvText.split("\n")
  const headers = lines[0].split(",")

  return lines
    .slice(1)
    .map((line) => {
      const values = line.split(",")
      const entry: Record<string, string> = {}

      headers.forEach((header, index) => {
        entry[header.trim()] = values[index]?.trim() || ""
      })

      return entry
    })
    .filter((entry) => Object.values(entry).some((value) => value))
}

export async function processAndStoreData(csvUrl: string) {
  const supabase = createClientComponentClient<Database>()

  try {
    // Fetch CSV data
    const csvText = await fetchCSVData(csvUrl)
    const parsedData = parseCSVData(csvText)

    // Process and insert data into Supabase
    const dataToInsert = parsedData.map((item) => ({
      slide_number: Number.parseInt(item.Slide) || 0,
      slide_section: item["Bagian Slide"] || "",
      label: item.Label || "",
      value: item["Data Connector - Input Disini!"] || "",
      clean_value: item["Data Clean"] || "",
    }))

    // Clear existing data
    await supabase.from("dashboard_data").delete().neq("id", 0)

    // Insert new data in batches
    const batchSize = 100
    for (let i = 0; i < dataToInsert.length; i += batchSize) {
      const batch = dataToInsert.slice(i, i + batchSize)
      const { error } = await supabase.from("dashboard_data").insert(batch)
      if (error) {
        console.error("Error inserting data:", error)
      }
    }

    return true
  } catch (error) {
    console.error("Error processing data:", error)
    return false
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = createClientComponentClient<Database>()

  // This is a simplified version - in a real app, you would query the actual data
  // For now, we'll return mock data based on the screenshot

  return {
    totalOrders: 224,
    inProgress: 78,
    pendingBaso: 103,
    pendingBillingApproval: 8,
    totalComplete: 35,
    totalFailed: 0,
    overallAchPercentage: 15.63,
    ordersCompleteYTD: 932,
    achLastMonth: -82.05,
    monthlyData: [
      { month: "Jan 2025", totalOrders: 159, achPercentage: 0 },
      { month: "Feb 2025", totalOrders: 213, achPercentage: 41 },
      { month: "Mar 2025", totalOrders: 330, achPercentage: 0 },
      { month: "Apr 2025", totalOrders: 195, achPercentage: -82 },
      { month: "May 2025", totalOrders: 35, achPercentage: -100 },
      { month: "Jun 2025", totalOrders: 0, achPercentage: 0 },
      { month: "Jul 2025", totalOrders: 0, achPercentage: 0 },
      { month: "Aug 2025", totalOrders: 0, achPercentage: 0 },
      { month: "Sep 2025", totalOrders: 0, achPercentage: 0 },
      { month: "Oct 2025", totalOrders: 0, achPercentage: 0 },
      { month: "Nov 2025", totalOrders: 0, achPercentage: 0 },
      { month: "Dec 2025", totalOrders: 0, achPercentage: 0 },
    ],
    progressData: [
      { status: "PENDING BASO", percentage: 46 },
      { status: "IN PROGRESS", percentage: 34.8 },
      { status: "COMPLETE", percentage: 15.6 },
      { status: "PENDING BILLING APPROVAL", percentage: 3.6 },
    ],
    regionData: [
      { region: "CENTRAL SULAWESI", count: 35 },
      { region: "SOUTH SULAWESI", count: 42 },
      { region: "WEST SULAWESI", count: 18 },
      { region: "NORTH SULAWESI", count: 11 },
    ],
  }
}
