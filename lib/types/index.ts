// lib/types/index.ts
export interface User {
  id: string
  email: string
  role: 'admin' | 'agent' | 'user'
  created_at: string
  updated_at: string
  profile_image?: string
  phone_number?: string
  first_name?: string
  last_name?: string
}

export interface Agent {
  id: string
  user_id: string
  license_number?: string
  bio?: string
  experience_years?: number
  specialization?: string
  agency_name?: string
  is_verified: boolean
  created_at: string
  updated_at: string
  user?: User
}

export interface Property {
  id: string
  title: string
  description: string
  price: number
  property_type: 'house' | 'apartment' | 'condo' | 'villa' | 'land' | 'commercial'
  status: 'available' | 'sold' | 'pending' | 'rented'
  bedrooms: number
  bathrooms: number
  square_feet: number
  city: string
  state: string
  address: string
  zip_code?: string
  latitude?: number
  longitude?: number
  year_built?: number
  features: string[]
  agent_id: string
  created_at: string
  updated_at: string
  images: string[]
  floor_plan_url?: string
   property_videos?: Array<{
    url: string
    title?: string
    thumbnail?: string
  }>
  virtual_tour_url?: string
  agent?: Agent
}

export interface Appointment {
  id: string
  property_id: string
  user_id: string
  agent_id: string
  appointment_date: string
  appointment_time: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
  property?: Property
  user?: User
  agent?: Agent
}

export interface Favorite {
  id: string
  user_id: string
  property_id: string
  created_at: string
  property?: Property
}

export interface Inquiry {
  id: string
  property_id: string
  user_id: string
  agent_id: string
  message: string
  status: 'new' | 'responded' | 'closed'
  response?: string
  created_at: string
  updated_at: string
  property?: Property
  user?: User
  agent?: Agent
}

export interface PropertyReview {
  id: string
  property_id: string
  user_id: string
  rating: number
  comment?: string
  created_at: string
  updated_at: string
  property?: Property
  user?: User
}

export interface Review {
  id: string
  agent_id: string
  user_id: string
  rating: number
  comment?: string
  created_at: string
  updated_at: string
  agent?: Agent
  user?: User
}

// Database enums for TypeScript
export type PropertyStatus = 'available' | 'sold' | 'pending' | 'rented'
export type PropertyType = 'house' | 'apartment' | 'condo' | 'villa' | 'land' | 'commercial'
export type UserRole = 'admin' | 'agent' | 'user'
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled'
export type InquiryStatus = 'new' | 'responded' | 'closed'

// API Response types for better type safety
export interface ApiResponse<T = unknown> {
  data: T | null
  error: string | null
  success: boolean
}

// Form data types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  first_name: string
  last_name: string
  phone_number?: string
}

export interface PropertyFormData {
  title: string
  description: string
  price: number
  property_type: PropertyType
  bedrooms: number
  bathrooms: number
  area_sqft: number
  city: string
  state: string
  address: string
  zip_code?: string
  year_built?: number
  features: string[]
}