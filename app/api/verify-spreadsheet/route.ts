import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const spreadsheetId = searchParams.get('id')

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "Spreadsheet ID is required" },
        { status: 400 }
      )
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google API key not configured" },
        { status: 500 }
      )
    }

    // Try to access the spreadsheet metadata to verify it exists and is accessible
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}&fields=properties.title,sheets.properties.title`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Spreadsheet not found or not accessible" },
          { status: 404 }
        )
      }
      if (response.status === 403) {
        return NextResponse.json(
          { error: "Spreadsheet access denied. Make sure it's publicly accessible or shared with the correct permissions." },
          { status: 403 }
        )
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      title: data.properties?.title || "Untitled",
      sheets: data.sheets?.map((sheet: any) => sheet.properties?.title) || []
    })

  } catch (error) {
    console.error("Error verifying spreadsheet:", error)
    return NextResponse.json(
      { error: "Failed to verify spreadsheet access" },
      { status: 500 }
    )
  }
}
