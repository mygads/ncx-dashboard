export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      data_sources: {
        Row: {
          id: string
          user_id: string
          type: 'spreadsheet' | 'file'
          name: string
          url: string | null
          filename: string | null
          uploaded_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'spreadsheet' | 'file'
          name: string
          url?: string | null
          filename?: string | null
          uploaded_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'spreadsheet' | 'file'
          name?: string
          url?: string | null
          filename?: string | null
          uploaded_at?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
