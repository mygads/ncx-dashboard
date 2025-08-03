import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import * as XLSX from "xlsx"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client with service key for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const sheetName = searchParams.get('sheetName') || 'DataAutoGSlide'

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Get current data source from database
    const { data: dataSource, error } = await supabase
      .from('data_sources')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !dataSource) {
      return NextResponse.json(
        { error: "No data source found for user" },
        { status: 404 }
      )
    }

    let sheetData: any[] = []

    if (dataSource.type === 'spreadsheet') {
      // Handle Google Spreadsheet
      const apiKey = process.env.NEXT_PUBLIC_SPREADSHEET_API_KEY
      if (!apiKey) {
        return NextResponse.json(
          { error: "Google API key not configured" },
          { status: 500 }
        )
      }

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${dataSource.url}/values/${sheetName}?key=${apiKey}`
      const response = await fetch(url)
      
      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to fetch spreadsheet data: ${response.statusText}` },
          { status: response.status }
        )
      }

      const data = await response.json()
      sheetData = data.values || []

    } else if (dataSource.type === 'file') {
      // Handle uploaded file
      if (!dataSource.filename) {
        return NextResponse.json(
          { error: "Filename not found in data source" },
          { status: 400 }
        )
      }

      const filePath = join(process.cwd(), 'public', 'uploads', dataSource.filename)
      // console.log("Reading file:", filePath, "for sheet:", sheetName)
      
      try {
        const fileBuffer = await readFile(filePath)
        
        if (dataSource.filename.endsWith('.csv')) {
          // Handle CSV file
          const csvText = fileBuffer.toString('utf8')
          const lines = csvText.split('\n').filter(line => line.trim())
          sheetData = lines.map(line => {
            // Simple CSV parsing - you might want to use a more robust CSV parser
            return line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
          })
        } else {
          // Handle Excel file (.xlsx, .xls)
          const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
          
          // console.log("Available sheets:", workbook.SheetNames)
          
          // Try to find the specific sheet, or use the first sheet
          let worksheetName = sheetName
          if (!workbook.SheetNames.includes(sheetName)) {
            if (workbook.SheetNames.includes('DataAutoGSlide')) {
              worksheetName = 'DataAutoGSlide'
            } else {
              worksheetName = workbook.SheetNames[0]
            }
          }
          
          // console.log("Using worksheet:", worksheetName)
          
          const worksheet = workbook.Sheets[worksheetName]
          if (!worksheet) {
            return NextResponse.json(
              { error: `Sheet '${sheetName}' not found. Available sheets: ${workbook.SheetNames.join(', ')}` },
              { status: 404 }
            )
          }

          // Convert sheet to array of arrays
          sheetData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            raw: false,
            dateNF: 'yyyy-mm-dd'
          })
          
          // console.log("Sheet data loaded:", sheetData.length, "rows")
        }
        
      } catch (fileError) {
        console.error("Error reading file:", fileError)
        return NextResponse.json(
          { error: "Failed to read uploaded file" },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      dataSource: {
        type: dataSource.type,
        name: dataSource.name,
        uploadedAt: dataSource.uploadedAt
      },
      sheetName: sheetName,
      values: sheetData,
      rowCount: sheetData.length
    })

  } catch (error) {
    console.error("Error reading data:", error)
    return NextResponse.json(
      { error: "Failed to read data" },
      { status: 500 }
    )
  }
}
