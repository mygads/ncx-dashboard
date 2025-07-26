-- Create data_sources table to store user data source information
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('spreadsheet', 'file')),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500), -- For spreadsheet ID
    filename VARCHAR(255), -- For uploaded files
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_data_sources_user_id ON data_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_data_sources_type ON data_sources(type);

-- Add RLS (Row Level Security) policies
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data sources
CREATE POLICY "Users can view their own data sources" ON data_sources
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own data sources
CREATE POLICY "Users can insert their own data sources" ON data_sources
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own data sources
CREATE POLICY "Users can update their own data sources" ON data_sources
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own data sources
CREATE POLICY "Users can delete their own data sources" ON data_sources
    FOR DELETE USING (auth.uid() = user_id);
