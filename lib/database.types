export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      dashboard_data: {
        Row: {
          id: number
          slide_number: number
          slide_section: string
          label: string
          value: string
          clean_value: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          slide_number: number
          slide_section: string
          label: string
          value: string
          clean_value: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          slide_number?: number
          slide_section?: string
          label?: string
          value?: string
          clean_value?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
