import { NextRequest, NextResponse } from 'next/server';

const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID;
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

export async function GET(request: NextRequest) {
    try {
        // Check if required environment variables are set
        if (!SPREADSHEET_ID || !API_KEY) {
            return NextResponse.json(
                { error: 'Missing required environment variables' },
                { status: 400 }
            );
        }

        // Fetch modification time from Google Drive API
        const url = `https://www.googleapis.com/drive/v3/files/${SPREADSHEET_ID}?fields=modifiedTime&key=${API_KEY}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Google Drive API error:', response.status, response.statusText);
            return NextResponse.json(
                { error: 'Failed to fetch spreadsheet information' },
                { status: response.status }
            );
        }

        const data = await response.json();
        
        if (!data.modifiedTime) {
            return NextResponse.json(
                { error: 'No modification time found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            lastUpdated: data.modifiedTime,
            source: 'google_drive',
            spreadsheetId: SPREADSHEET_ID
        });

    } catch (error) {
        console.error('Error fetching spreadsheet last updated:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
