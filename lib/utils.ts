// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getImageUrl(path: string): string {
  const supabaseUrl = 'https://iegtdzymftlrrsblwyyn.supabase.co'
  return `${supabaseUrl}/storage/v1/object/public/${path}`
}
export function getSupabaseImageUrl(imagePath: string): string {
  if (!imagePath) return ''
  
  if (imagePath.startsWith('http')) return imagePath
  
  const cleanPath = imagePath.replace(/^\//, '')
  
  // UPDATE THIS LINE with your actual bucket name:
  return `https://iegtdzymftlrrsblwyyn.supabase.co/storage/v1/object/public/property-images/${cleanPath}`
  // OR if your bucket is different:
  // return `https://iegtdzymftlrrsblwyyn.supabase.co/storage/v1/object/public/properties/${cleanPath}`
  // return `https://iegtdzymftlrrsblwyyn.supabase.co/storage/v1/object/public/images/${cleanPath}`
}