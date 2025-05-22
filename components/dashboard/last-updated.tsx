"use client"

import { useEffect, useState } from "react"

const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

export function useLastUpdated() {
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    useEffect(() => {
        let cancelled = false;
        async function fetchLastUpdated() {
            try {
                const url = `https://www.googleapis.com/drive/v3/files/${SPREADSHEET_ID}?fields=modifiedTime&key=${API_KEY}`;
                const res = await fetch(url);
                const json = await res.json();
                if (!cancelled && json?.modifiedTime) {
                setLastUpdated(new Date(json.modifiedTime));
                }
            } catch (e) {
                if (!cancelled) {
                setLastUpdated(null);
                }
            }
        }
        fetchLastUpdated();
        return () => { cancelled = true }
    }, [])

    return lastUpdated;
}

export function LastUpdatedDate({ className = "", dateFormat = "date" }: { className?: string, dateFormat?: "date" | "datetime" }) {
    const lastUpdated = useLastUpdated();
    return (
        <span className={className}>
        {lastUpdated
            ? dateFormat === "datetime"
            ? lastUpdated.toLocaleString()
            : lastUpdated.toLocaleDateString()
            : "Loading..."}
        </span>
    )
}

export function LastUpdatedFooter({ className = "" }: { className?: string }) {
    const lastUpdated = useLastUpdated();
    return (
        <div className={"text-xs text-gray-500 " + className}>
        Data Last Updated: {lastUpdated ? lastUpdated.toLocaleString() : "Loading..."}
        </div>
    )
}
