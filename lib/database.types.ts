// lib/database.types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: string
          full_name: string
          phone: string | null
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: string
          full_name: string
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // Add other tables as you need them
      properties: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          // ... other properties columns
        }
        Insert: {
          id?: string
          title: string
          description: string
          price: number
          // ... other properties columns
        }
        Update: {
          id?: string
          title?: string
          description?: string
          price?: number
          // ... other properties columns
        }
      }
    }
  }
}