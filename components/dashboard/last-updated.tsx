"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

export function useLastUpdated() {
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [dataSource, setDataSource] = useState<'spreadsheet' | 'file' | null>(null)
    const supabase = createClientComponentClient()

    useEffect(() => {
        async function fetchLastUpdated() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    setLastUpdated(new Date()) // Fallback for non-authenticated users
                    return
                }

                // Check if we should prioritize spreadsheet over uploaded files
                const prioritizeSpreadsheet = process.env.NEXT_PUBLIC_PRIORITIZE_SPREADSHEET === 'true'

                let spreadsheetDate: Date | null = null
                let fileDate: Date | null = null
                let actualDataSourceType: 'spreadsheet' | 'file' | null = null

                // Try to get spreadsheet last updated time if credentials are available
                if (SPREADSHEET_ID && API_KEY) {
                    try {
                        const response = await fetch('/api/spreadsheet-last-updated')
                        if (response.ok) {
                            const data = await response.json()
                            if (data.lastUpdated) {
                                spreadsheetDate = new Date(data.lastUpdated)
                            }
                        }
                    } catch (driveError) {
                        console.warn('Could not fetch spreadsheet last updated time:', driveError)
                    }
                }

                // Try to get the most recent data source upload/update
                try {
                    const { data: dataSources, error: dataSourceError } = await supabase
                        .from('data_sources')
                        .select('uploaded_at, updated_at, type')
                        .eq('user_id', user.id)
                        .order('updated_at', { ascending: false })
                        .limit(1)

                    if (!dataSourceError && dataSources && dataSources.length > 0) {
                        const latestSource = dataSources[0]
                        fileDate = new Date(latestSource.updated_at || latestSource.uploaded_at)
                        actualDataSourceType = latestSource.type // Use the actual type from database
                    }
                } catch (dataSourceError) {
                    // data_sources table might not exist, try dashboard_data as fallback
                    console.warn('data_sources table not accessible, using dashboard_data as fallback')
                    
                    const { data: dashboardData, error: dataError } = await supabase
                        .from('dashboard_data')
                        .select('created_at, updated_at')
                        .order('updated_at', { ascending: false })
                        .limit(1)

                    if (!dataError && dashboardData && dashboardData.length > 0) {
                        const latestData = dashboardData[0]
                        fileDate = new Date(latestData.updated_at || latestData.created_at)
                        actualDataSourceType = 'file' // Assume file upload for dashboard_data fallback
                    }
                }

                // Determine which date to use based on priority and availability
                if (prioritizeSpreadsheet && spreadsheetDate) {
                    setLastUpdated(spreadsheetDate)
                    setDataSource('spreadsheet')
                } else if (fileDate && (!spreadsheetDate || fileDate > spreadsheetDate)) {
                    setLastUpdated(fileDate)
                    setDataSource(actualDataSourceType) // Use the actual type from database
                } else if (spreadsheetDate) {
                    setLastUpdated(spreadsheetDate)
                    setDataSource('spreadsheet')
                } else {
                    // Fallback to current time
                    setLastUpdated(new Date())
                    setDataSource(null)
                }
                
            } catch (error) {
                console.error('Error in fetchLastUpdated:', error)
                setLastUpdated(new Date()) // Fallback to current time
                setDataSource(null)
            }
        }

        fetchLastUpdated()
    }, [supabase])

    return { lastUpdated, dataSource };
}

export function LastUpdatedDate({ className = "", dateFormat = "date" }: { className?: string, dateFormat?: "date" | "datetime" }) {
    const { lastUpdated, dataSource } = useLastUpdated();
    return (
        <span className={className}>
        {lastUpdated
            ? dateFormat === "datetime"
            ? lastUpdated.toLocaleString()
            : lastUpdated.toLocaleDateString()
            : "Loading..."}
        {dataSource && (
            <span className="text-xs text-gray-400 ml-1">
                ({dataSource === 'file' ? 'Data Upload' : 'Spreadsheet'})
            </span>
        )}
        </span>
    )
}

export function LastUpdatedFooter({ className = "" }: { className?: string }) {
    const { lastUpdated, dataSource } = useLastUpdated();
    return (
        <div className={"text-xs text-gray-500 " + className}>
        Data Last Updated: {lastUpdated ? lastUpdated.toLocaleString() : "Loading..."}
        {dataSource && (
            <span className="ml-2 text-gray-400">
                (Source: {dataSource === 'file' ? 'Data Upload' : 'Google Spreadsheet'})
            </span>
        )}
        </div>
    )
}
