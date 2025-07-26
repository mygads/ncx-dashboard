import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface DataSourceResult {
  success: boolean
  data?: any[]
  error?: string
  dataSource?: {
    type: 'spreadsheet' | 'file'
    name: string
    uploadedAt: string
  }
}

/**
 * Fetch data from the user's active data source (Google Spreadsheet or uploaded file)
 * @param userId - The user ID
 * @param sheetName - The sheet name to fetch (default: 'DataAutoGSlide')
 * @returns Promise<DataSourceResult>
 */
export async function fetchDataFromSource(
  userId: string, 
  sheetName: string = 'DataAutoGSlide'
): Promise<DataSourceResult> {
  try {
    const response = await fetch(`/api/read-data?userId=${userId}&sheetName=${encodeURIComponent(sheetName)}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`
      }
    }

    const result = await response.json()
    
    return {
      success: true,
      data: result.values || [],
      dataSource: result.dataSource
    }
  } catch (error) {
    console.error("Error fetching data from source:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }
  }
}

/**
 * Check if user has an active data source
 * @param userId - The user ID
 * @returns Promise<boolean>
 */
export async function hasActiveDataSource(userId: string): Promise<boolean> {
  try {
    const supabase = createClientComponentClient()
    const { data, error } = await supabase
      .from('data_sources')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .single()

    return !error && !!data
  } catch (error) {
    console.error("Error checking data source:", error)
    return false
  }
}

/**
 * Get user's current data source info
 * @param userId - The user ID
 * @returns Promise<DataSource | null>
 */
export async function getCurrentDataSource(userId: string) {
  try {
    const supabase = createClientComponentClient()
    const { data, error } = await supabase
      .from('data_sources')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return null
    }

    return {
      id: data.id,
      type: data.type as 'spreadsheet' | 'file',
      name: data.name,
      url: data.url,
      filename: data.filename,
      uploadedAt: data.uploaded_at,
      userId: data.user_id
    }
  } catch (error) {
    console.error("Error getting current data source:", error)
    return null
  }
}
