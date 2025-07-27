import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";

const API_KEY = process.env.NEXT_GOOGLE_API_KEY;

export async function GET(request: NextRequest) {
    try {
        // Check if required environment variables are set
        if (!API_KEY) {
            return NextResponse.json(
                { error: 'Missing Google API key' },
                { status: 400 }
            );
        }

        // Create Supabase client with service key for server-side operations
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Get the active spreadsheet data source from database
        const { data: dataSource, error } = await supabase
            .from('data_sources')
            .select('url, type, name')
            .eq('user_id', userId)
            .eq('type', 'spreadsheet')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !dataSource) {
            return NextResponse.json(
                { error: 'No active spreadsheet data source found for user' },
                { status: 404 }
            );
        }

        const SPREADSHEET_ID = dataSource.url;

        if (!SPREADSHEET_ID) {
            return NextResponse.json(
                { error: 'Spreadsheet ID not found in data source' },
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
