// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iegtdzymftlrrsblwyyn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllZ3RkenltZnRscnJzYmx3eXluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MjU5NDQsImV4cCI6MjA3OTUwMTk0NH0.hrnPO-39zRjADAinLS77TWLnSzEbAMrXEC3fZvmn0OI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Define a proper error type
interface SupabaseErrorResponse {
  message: string;
  code?: string;
}

// Helper function to handle Supabase errors with proper typing
export const handleSupabaseError = (error: unknown): SupabaseErrorResponse => {
  console.error('Supabase error:', error);
  
  if (error && typeof error === 'object') {
    const errorObj = error as { message?: string; code?: string };
    return {
      message: errorObj.message || 'An error occurred',
      code: errorObj.code
    };
  }
  
  return {
    message: 'An unexpected error occurred'
  };
};