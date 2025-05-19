import { AMData, InsightData, ProgressType } from "./types"

export async function fetchProgressData(): Promise<ProgressType> {
  const spreadsheetId = "1BerM6n1xjD9f8zRM0sn7Wz-YYNsmPxLJ4WmA7hwnCbc"
  const apiKey = "AIzaSyANCiHKoVF1zyeBHIVCGrefzjPssZXYj34"
  const sheetName = "MTDProgress NCX"
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`

  try {
    const res = await fetch(url)
    const json = await res.json()
    if (!json.values || json.values.length < 2)
      return {
        COMPLETE: 0,
        "IN PROGRESS": 0,
        "PENDING BASO": 0,
        "PENDING BILLING APROVAL": 0,
      }

    const rows: [string, string][] = json.values.slice(1) // skip header
    const result: ProgressType = {
      COMPLETE: 0,
      "IN PROGRESS": 0,
      "PENDING BASO": 0,
      "PENDING BILLING APROVAL": 0,
    }

    rows.forEach(([status, count]) => {
      const key = status.trim().toUpperCase() as keyof ProgressType
      if (result.hasOwnProperty(key)) {
        result[key] = Number(count)
      }
    })

    return result
  } catch (error) {
    console.error("Error fetching progress data:", error)
    return {
      COMPLETE: 0,
      "IN PROGRESS": 0,
      "PENDING BASO": 0,
      "PENDING BILLING APROVAL": 0,
    }
  }
}

export async function fetchAMData(): Promise<AMData[]> {
  const spreadsheetId = "1BerM6n1xjD9f8zRM0sn7Wz-YYNsmPxLJ4WmA7hwnCbc"
  const apiKey = "AIzaSyANCiHKoVF1zyeBHIVCGrefzjPssZXYj34"
  const sheetName = "AM NCX"
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`

  try {
    const res = await fetch(url)
    const json = await res.json()
    if (!json.values || json.values.length < 2) return []

    const headers = json.values[0]
    const rows = json.values.slice(1) // skip header

    return rows.map((row: any[]) => {
      return {
        name: row[0] || "",
        total: Number(row[1]) || 0,
        failed: Number(row[2]) || 0,
        provisionStart: Number(row[3]) || 0,
        provisionDesign: Number(row[4]) || 0,
        provisionIssued: Number(row[5]) || 0,
        inProgressTotal: Number(row[6]) || 0,
        pendingBASO: Number(row[7]) || 0,
        pendingBillFulfill: Number(row[8]) || 0,
        pendingBillApproval: Number(row[9]) || 0,
        complete: Number(row[10]) || 0,
        cancelAbandoned: Number(row[11]) || 0,
        achPercentage: Number.parseFloat(row[12]) || 0,
        rank: Number(row[13]) || 0,
      }
    })
  } catch (error) {
    console.error("Error fetching AM data:", error)
    return []
  }
}

export async function fetchInsightData(): Promise<InsightData | null> {
  const spreadsheetId = "1BerM6n1xjD9f8zRM0sn7Wz-YYNsmPxLJ4WmA7hwnCbc"
  const apiKey = "AIzaSyANCiHKoVF1zyeBHIVCGrefzjPssZXYj34"
  const sheetName = "Update Text (Looker Studio)"
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`

  try {
    const res = await fetch(url)
    const json = await res.json()
    if (!json.values || json.values.length < 2) return null

    // Assuming the first row contains headers and the second row contains values
    const headers = json.values[0]
    const values = json.values[1]

    return {
      date: values[0] || "",
      insightUnit: values[2] || "",
      insightInputer: values[3] || "",
      insightAM: values[4] || "",
      insightTipeOrder: values[5] || "",
      insightBranch: values[6] || "",
      insightUmurOrder: values[7] || "",
    }
  } catch (error) {
    console.error("Error fetching insight data:", error)
    return null
  }
}
