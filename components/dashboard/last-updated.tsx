"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

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

                // Get the current active data source
                const { data: dataSources, error: dataSourceError } = await supabase
                    .from('data_sources')
                    .select('uploaded_at, updated_at, type, url')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false })
                    .limit(1)

                if (dataSourceError || !dataSources || dataSources.length === 0) {
                    // Fallback to dashboard_data if data_sources table doesn't exist or no data
                    console.warn('data_sources table not accessible, using dashboard_data as fallback')
                    
                    const { data: dashboardData, error: dataError } = await supabase
                        .from('dashboard_data')
                        .select('created_at, updated_at')
                        .order('updated_at', { ascending: false })
                        .limit(1)

                    if (!dataError && dashboardData && dashboardData.length > 0) {
                        const latestData = dashboardData[0]
                        setLastUpdated(new Date(latestData.updated_at || latestData.created_at))
                        setDataSource('file') // Assume file upload for dashboard_data fallback
                    } else {
                        setLastUpdated(new Date())
                        setDataSource(null)
                    }
                    return
                }

                const activeDataSource = dataSources[0]
                
                if (activeDataSource.type === 'spreadsheet') {
                    // For spreadsheet data source, get last updated time from Google Drive API
                    try {
                        const response = await fetch(`/api/spreadsheet-last-updated?userId=${user.id}`)
                        if (response.ok) {
                            const data = await response.json()
                            if (data.lastUpdated) {
                                setLastUpdated(new Date(data.lastUpdated))
                                setDataSource('spreadsheet')
                                return
                            }
                        }
                    } catch (driveError) {
                        console.warn('Could not fetch spreadsheet last updated time:', driveError)
                    }
                    
                    // Fallback to database updated_at if Google API fails
                    setLastUpdated(new Date(activeDataSource.updated_at || activeDataSource.uploaded_at))
                    setDataSource('spreadsheet')
                    
                } else if (activeDataSource.type === 'file') {
                    // For file upload data source, use database updated_at
                    setLastUpdated(new Date(activeDataSource.updated_at || activeDataSource.uploaded_at))
                    setDataSource('file')
                } else {
                    // Unknown type, fallback
                    setLastUpdated(new Date(activeDataSource.updated_at || activeDataSource.uploaded_at))
                    setDataSource(activeDataSource.type)
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
