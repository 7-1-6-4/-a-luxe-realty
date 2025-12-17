// app/properties/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase-optimized'
const supabase = getSupabase()
import { Property } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { formatPrice, getImageUrl } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Home, Building2, Hotel, MapPin, Bed, Bath, 
  Maximize, TrendingUp, Filter, Star,
  Eye, Heart, Share2, ChevronRight, ChevronLeft,
  Tag, Mail, Phone, MessageCircle, Facebook, Instagram, Linkedin, Youtube,
  Menu, X // Added for mobile menu
} from 'lucide-react'

// Custom TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
)

// CompanyContact interface matching homepage
interface CompanyContact {
  company_name?: string
  tagline?: string
  address?: string
  phone?: string
  email?: string
  whatsapp?: string
  business_hours?: {
    weekdays?: string
    saturday?: string
    sunday?: string
  }
  social_media?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
    youtube?: string
    tiktok?: string
  }
}

const ITEMS_PER_PAGE = 12

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProperties, setTotalProperties] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [companyContact, setCompanyContact] = useState<CompanyContact>({})

  // Handle scroll for sticky navigation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Load company contact settings
  useEffect(() => {
    async function loadCompanySettings() {
      try {
        const { data, error } = await supabase
          .from('company_settings')
          .select('setting_value')
          .eq('setting_key', 'contact_info')
          .single()

        if (error) {
          const { data: fallbackData } = await supabase
            .from('company_settings')
            .select('setting_value')
            .eq('setting_key', 'company_info')
            .single()
          
          if (fallbackData && fallbackData.setting_value) {
            setCompanyContact(fallbackData.setting_value as CompanyContact)
          } else {
            setCompanyContact({
              company_name: 'A-LUXE REALTY',
              tagline: 'INVEST SMART. LIVE LUXE.',
              email: 'info@aluxerealty.com',
              phone: '+254 700 000 000',
              whatsapp: '+254 700 000 000',
              address: 'Nairobi, Kenya',
              business_hours: {
                weekdays: '8:00 AM - 6:00 PM',
                saturday: '9:00 AM - 4:00 PM',
                sunday: 'Closed'
              }
            })
          }
          return
        }

        if (data && data.setting_value) {
          setCompanyContact(data.setting_value as CompanyContact)
        }
      } catch (error) {
        setCompanyContact({
          company_name: 'A-LUXE REALTY',
          tagline: 'INVEST SMART. LIVE LUXE.',
          email: 'info@aluxerealty.com',
          phone: '+254 700 000 000',
          whatsapp: '+254 700 000 000',
          address: 'Nairobi, Kenya',
          business_hours: {
            weekdays: '8:00 AM - 6:00 PM',
            saturday: '9:00 AM - 4:00 PM',
            sunday: 'Closed'
          }
        })
      }
    }

    loadCompanySettings()
  }, [])

  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true)
        
        let query = supabase
          .from('properties')
          .select('*', { count: 'exact' })
          .order('featured', { ascending: false }) // Featured properties first
          .order('created_at', { ascending: false }) // Then by creation date

        if (filter !== 'all') {
          query = query.eq('property_type', filter)
        }

        const from = (currentPage - 1) * ITEMS_PER_PAGE
        const to = from + ITEMS_PER_PAGE - 1
        
        query = query.range(from, to)

        const { data, error, count } = await query

        if (error) {
          console.error('Error loading properties:', error)
          return
        }

        setProperties(data || [])
        setTotalProperties(count || 0)
        setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE))
      } catch (error) {
        console.error('Unexpected error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [filter, currentPage])

  useEffect(() => {
    async function loadAllPropertiesForFilter() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error loading all properties:', error)
          return
        }

        setFilteredProperties(data || [])
      } catch (error) {
        console.error('Unexpected error:', error)
      }
    }

    loadAllPropertiesForFilter()
  }, [])

  const toggleFavorite = (propertyId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId)
      } else {
        newFavorites.add(propertyId)
      }
      return newFavorites
    })
  }

  const handleShare = async (property: Property) => {
    const shareData = {
      title: property.title,
      text: `Check out this ${property.property_type} in ${property.city}! ${formatPrice(property.price)}`,
      url: `${window.location.origin}/properties/${property.id}`
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log('Share canceled')
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareData.url)
      alert('Link copied to clipboard!')
    }
  }

  const propertyTypes = [
    { value: 'all', label: 'All Properties', icon: Home },
    { value: 'house', label: 'Houses', icon: Home },
    { value: 'apartment', label: 'Apartments', icon: Building2 },
    { value: 'villa', label: 'Villas', icon: Hotel },
    { value: 'condo', label: 'Condos', icon: Building2 },
    { value: 'penthouse', label: 'Penthouse', icon: Star },
    { value: 'maisonette', label: 'Maisonette', icon: Home },
    { value: 'townhouse', label: 'Townhouse', icon: Home },
    { value: 'duplex', label: 'Duplex', icon: Building2 },
    { value: 'beachfront', label: 'Beachfront', icon: Hotel },
    { value: 'commercial', label: 'Commercial', icon: Building2 },
  ]

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    const propertiesSection = document.getElementById('properties-grid')
    if (propertiesSection) {
      propertiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const renderPagination = () => {
    const pages = []
    const maxVisiblePages = 5
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            currentPage === i
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-amber-50 border border-amber-100'
          }`}
        >
          {i}
        </button>
      )
    }
    
    return (
      <div className="flex items-center justify-center gap-2 mt-12">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg bg-white border border-amber-100 text-gray-700 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-4 py-2 rounded-lg bg-white border border-amber-100 text-gray-700 hover:bg-amber-50"
            >
              1
            </button>
            {startPage > 2 && (
              <span className="px-2 text-gray-400">...</span>
            )}
          </>
        )}
        
        {pages}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="px-2 text-gray-400">...</span>
            )}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-4 py-2 rounded-lg bg-white border border-amber-100 text-gray-700 hover:bg-amber-50"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-lg bg-white border border-amber-100 text-gray-700 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  // Format square feet for display
  const formatSquareFeet = (sqft: number | null) => {
    if (!sqft) return '0'
    
    if (sqft >= 1000) {
      if (sqft % 1000 === 0) {
        return `${sqft / 1000}K` // 4000 -> 4K
      }
      return `${(sqft / 1000).toFixed(1)}K` // 1500 -> 1.5K
    }
    return sqft.toString() // 850 -> 850
  }

  // Get listing type display info
  const getListingTypeInfo = (listingType: string) => {
    switch (listingType) {
      case 'sale':
        return { label: 'FOR SALE', color: 'bg-green-500', textColor: 'text-green-500', borderColor: 'border-green-500' }
      case 'rent':
        return { label: 'FOR RENT', color: 'bg-blue-500', textColor: 'text-blue-500', borderColor: 'border-blue-500' }
      default:
        return { label: 'FOR SALE', color: 'bg-green-500', textColor: 'text-green-500', borderColor: 'border-green-500' }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background Layer - Fixed with lower z-index */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-gray-50 to-orange-50" />
        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org0/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23f59e0b' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '400px 400px'
          }} />
        </div>

        <div className="absolute top-0 -left-32 w-96 h-96 bg-gradient-to-br from-amber-200/40 to-orange-200/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-amber-200/30 to-orange-200/20 rounded-full blur-[120px]" />
      </div>

      {/* STICKY Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 py-4 px-4 lg:px-8 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl border-b border-amber-100 shadow-2xl' 
          : 'bg-white/90 backdrop-blur-md border-b border-amber-100 shadow-lg'
      }`}>
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="group">
              <div className="text-2xl font-bold tracking-wider text-amber-600">A-LUXE REALTY</div>
              <div className="text-xs tracking-widest text-gray-600 group-hover:text-amber-400 transition-colors">
                INVEST SMART. LIVE LUXE.
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 space-x-8">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-amber-600 transition-colors duration-300 text-sm font-medium tracking-wide relative group"
              >
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                href="/properties" 
                className="text-amber-600 font-semibold transition-colors duration-300 text-sm font-medium tracking-wide relative group"
              >
                Properties
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-amber-600"></span>
              </Link>
              <Link 
                href="/agents" 
                className="text-gray-600 hover:text-amber-600 transition-colors duration-300 text-sm font-medium tracking-wide relative group"
              >
                Agents
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                href="/about" 
                className="text-gray-600 hover:text-amber-600 transition-colors duration-300 text-sm font-medium tracking-wide relative group"
              >
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                href="/contact" 
                className="text-gray-600 hover:text-amber-600 transition-colors duration-300 text-sm font-medium tracking-wide relative group"
              >
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>
            
            {/* Desktop CTA Button */}
            <div className="hidden lg:block">
              <Link href="/auth/login">
                <Button className="bg-transparent border border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white transition-all duration-300 px-6 py-2 text-sm font-medium">
                  Sign In
                </Button>
              </Link>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden text-gray-700 z-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 bg-white/95 backdrop-blur-xl rounded-xl p-4 border border-amber-100 shadow-lg">
              <div className="flex flex-col space-y-4">
                <Link href="/" className="text-gray-600 hover:text-amber-600 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link href="/properties" className="text-amber-600 font-semibold py-2" onClick={() => setMobileMenuOpen(false)}>Properties</Link>
                <Link href="/agents" className="text-gray-600 hover:text-amber-600 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Agents</Link>
                <Link href="/about" className="text-gray-600 hover:text-amber-600 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>About</Link>
                <Link href="/contact" className="text-gray-600 hover:text-amber-600 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                <Link href="/auth/login" className="text-amber-600 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-20"></div>

      {/* Content wrapper - this contains everything except the background and nav */}
      <div className="relative z-10">
        {/* Enhanced Hero Header with Background Image Card */}
        <div className="relative py-12 md:py-16 overflow-hidden">
          {/* Card-style background with image */}
          <div className="absolute inset-x-4 inset-y-12 md:inset-x-8 lg:inset-x-16 z-0">
            <div className="relative h-full w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
              {/* Background Image */}
              <Image
                src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1920&q=80"
                alt="Luxury Modern Villa"
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
              
              {/* Gradient overlay for better readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-black/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/40" />
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 via-transparent to-orange-600/10" />
              
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org0/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '60px 60px'
                }} />
              </div>
            </div>
          </div>
          
          {/* Content overlay */}
          <div className="relative z-10 container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Breadcrumb - smaller */}
              <div className="flex items-center gap-2 mb-6 text-sm text-white/90">
                <Link href="/" className="hover:text-amber-300 transition-colors">Home</Link>
                <ChevronRight className="w-3 h-3 text-amber-300" />
                <span className="text-amber-300 font-medium">Properties</span>
              </div>
              
              {/* Main Title - with white text for contrast */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4 border border-white/30">
                  <TrendingUp className="w-4 h-4 text-amber-300" />
                  <span className="text-sm font-medium text-white">Premium Properties</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  Find Your Dream
                  <span className="block mt-2 bg-gradient-to-r from-amber-300 via-orange-300 to-amber-300 bg-clip-text text-transparent">
                    Property
                  </span>
                </h1>
                
                <p className="text-white/90 max-w-2xl mx-auto mb-6">
                  Browse our curated collection of quality properties
                </p>
              </div>
              
              {/* Compact Stats - with card style */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex items-center gap-2 shadow-lg border border-white/30 hover:bg-white/30 transition-all">
                  <div className="p-2 bg-amber-400/20 rounded-lg border border-amber-300/30">
                    <Home className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{totalProperties}</div>
                    <div className="text-xs text-white/80">Properties</div>
                  </div>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex items-center gap-2 shadow-lg border border-white/30 hover:bg-white/30 transition-all">
                  <div className="p-2 bg-amber-400/20 rounded-lg border border-amber-300/30">
                    <MapPin className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">Kenya</div>
                    <div className="text-xs text-white/80">Nationwide</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Filters - Simplified */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-amber-100 shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Filter Properties</h2>
                <p className="text-sm text-gray-600">Showing {properties.length} of {totalProperties} properties</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Page</span>
                <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-semibold">
                  {currentPage} of {totalPages}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {propertyTypes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    setFilter(value)
                    setCurrentPage(1)
                  }}
                  className={`group relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    filter === value
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow'
                      : 'bg-amber-50 text-gray-700 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <Icon className={`w-3 h-3 ${
                    filter === value ? 'text-white' : 'text-amber-600 group-hover:text-amber-700'
                  }`} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Properties Grid */}
          <div id="properties-grid">
            {loading ? (
              <div className="text-center py-16 bg-white/90 backdrop-blur-xl rounded-2xl border border-amber-100 shadow">
                <div className="relative inline-block">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-600"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-6">Loading Properties</h3>
                <p className="text-gray-600">Loading page {currentPage} of {totalPages}</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-16 bg-white/90 backdrop-blur-xl rounded-2xl border border-amber-100 shadow">
                <div className="inline-flex p-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl mb-6">
                  <Home className="w-12 h-12 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">No Properties Found</h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  No properties match your current filter. Try selecting a different category.
                </p>
                <Button 
                  onClick={() => {
                    setFilter('all')
                    setCurrentPage(1)
                  }}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-4 font-semibold shadow"
                >
                  View All Properties
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {properties.map((property) => {
                    const isFavorite = favorites.has(property.id)
                    const listingTypeInfo = getListingTypeInfo(property.listing_type || 'sale')
                    
                    return (
                      <div 
                        key={property.id} 
                        className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 border border-amber-100 hover:border-amber-300 hover:-translate-y-1"
                      >
                        <div className="relative h-48 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
                          {property.images && property.images.length > 0 ? (
                            <>
                              <Image 
                                src={property.images[0]}
                                alt={property.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                            </>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                              <Home className="w-12 h-12 text-amber-300" />
                            </div>
                          )}
                          
                          {/* Status Badge */}
                          <div className="absolute top-3 left-3 z-20">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow ${
                              property.status === 'available' ? 'bg-emerald-500 text-white' :
                              property.status === 'sold' ? 'bg-red-500 text-white' :
                              'bg-amber-500 text-white'
                            }`}>
                              {property.status.toUpperCase()}
                            </span>
                          </div>
                          
                          {/* Featured Badge (replaces property type badge) */}
                          {property.featured && (
                            <div className="absolute top-3 right-3 z-20">
                              <span className="px-2 py-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full text-xs font-bold text-white shadow-lg shadow-amber-500/30 flex items-center gap-1">
                                <span>⭐</span> FEATURED
                              </span>
                            </div>
                          )}

                          {/* Listing Type Badge - moved below status badge */}
                          <div className="absolute top-10 left-3 z-20">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow ${listingTypeInfo.color} text-white border ${listingTypeInfo.borderColor}`}>
                              {listingTypeInfo.label}
                            </span>
                          </div>

                          {/* Quick Actions */}
                          <div className="absolute bottom-3 right-3 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button 
                              onClick={(e) => {
                                e.preventDefault()
                                toggleFavorite(property.id)
                              }}
                              className={`p-1.5 backdrop-blur-sm rounded-full border transition-all ${
                                isFavorite 
                                  ? 'bg-red-500 border-red-500' 
                                  : 'bg-white/90 border-amber-200 hover:bg-amber-500 hover:border-amber-500'
                              }`}
                            >
                              <Heart className={`w-3 h-3 ${isFavorite ? 'fill-white text-white' : 'text-amber-700'}`} />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.preventDefault()
                                handleShare(property)
                              }}
                              className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full border border-amber-200 hover:bg-amber-500 hover:border-amber-500 transition-all"
                            >
                              <Share2 className="w-3 h-3 text-amber-700 hover:text-white" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-1 group-hover:text-amber-700 transition-colors">
                            {property.title}
                          </h3>
                          
                          <p className="text-gray-600 text-xs mb-3 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-600 flex-shrink-0" />
                            <span className="line-clamp-1">{property.city}, {property.state}</span>
                          </p>
                          
                          <div className="grid grid-cols-3 gap-2 mb-4 pb-3 border-b border-amber-100">
                            <div className="text-center p-1.5 bg-amber-50 rounded-lg">
                              <Bed className="w-3 h-3 text-amber-600 mx-auto mb-1" />
                              <span className="text-white font-semibold text-xs bg-amber-500 rounded-full w-5 h-5 flex items-center justify-center mx-auto mb-0.5">
                                {property.bedrooms}
                              </span>
                              <span className="text-gray-500 text-xs">Beds</span>
                            </div>
                            <div className="text-center p-1.5 bg-amber-50 rounded-lg">
                              <Bath className="w-3 h-3 text-amber-600 mx-auto mb-1" />
                              <span className="text-white font-semibold text-xs bg-amber-500 rounded-full w-5 h-5 flex items-center justify-center mx-auto mb-0.5">
                                {property.bathrooms}
                              </span>
                              <span className="text-gray-500 text-xs">Baths</span>
                            </div>
                            <div className="text-center p-1.5 bg-amber-50 rounded-lg">
                              <Maximize className="w-3 h-3 text-amber-600 mx-auto mb-1" />
                              <span className="text-white font-semibold text-xs bg-amber-500 rounded-full w-auto min-w-[24px] h-5 flex items-center justify-center mx-auto mb-0.5 px-1">
                                {formatSquareFeet(property.square_feet)}
                              </span>
                              <span className="text-gray-500 text-xs"> Size: sqft</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">Price</p>
                              <p className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                {formatPrice(property.price)}
                              </p>
                            </div>
                            <Link href={`/properties/${property.id}`}>
                              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm px-3 py-2 shadow group-hover:scale-105 transition-transform">
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                      <div className="text-sm text-gray-600">
                        Showing <span className="font-semibold text-amber-600">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                        <span className="font-semibold text-amber-600">{Math.min(currentPage * ITEMS_PER_PAGE, totalProperties)}</span> of{' '}
                        <span className="font-semibold text-amber-600">{totalProperties}</span> properties
                      </div>
                      <div className="text-sm text-gray-600">
                        Page <span className="font-semibold text-amber-600">{currentPage}</span> of{' '}
                        <span className="font-semibold text-amber-600">{totalPages}</span>
                      </div>
                    </div>
                    
                    {renderPagination()}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Call to Action - Simplified */}
        <div className="mt-12 py-12 border-t border-amber-100 bg-gradient-to-r from-amber-50/50 via-orange-50/50 to-amber-50/50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 mb-4">
                <Star className="w-4 h-4 text-amber-700 mr-2" />
                <span className="text-sm font-medium text-amber-800">Need Help?</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Can't Find What You're Looking For?
              </h2>
              
              <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                Our expert agents can help you find properties that match your specific requirements.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/contact">
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 shadow hover:scale-105 transition-all">
                    Contact an Agent
                  </Button>
                </Link>
                <Link href="/agents">
                  <Button className="bg-transparent border border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white px-8 py-4 transition-all hover:scale-105">
                    Browse Agents
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Identical to Homepage */}
        <footer className="bg-gradient-to-b from-amber-600 to-amber-800 py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              {/* Company Info */}
              <div>
                <h3 className="text-3xl font-bold text-white mb-6">
                  {companyContact.company_name || 'A-LUXE REALTY'}
                </h3>
                <p className="text-amber-100 mb-6 text-lg leading-relaxed">
                  {companyContact.tagline || 'Premium real estate services across Kenya. Your trusted partner in luxury property investments.'}
                </p>
                <div className="flex space-x-4">
                  {companyContact.social_media?.facebook && (
                    <a href={companyContact.social_media.facebook} className="text-amber-100 hover:text-white transition-colors transform hover:scale-110 duration-300">
                      <Facebook className="w-6 h-6" />
                    </a>
                  )}
                  {companyContact.social_media?.instagram && (
                    <a href={companyContact.social_media.instagram} className="text-amber-100 hover:text-white transition-colors transform hover:scale-110 duration-300">
                      <Instagram className="w-6 h-6" />
                    </a>
                  )}
                  {companyContact.social_media?.tiktok && (
                    <a href={companyContact.social_media.tiktok} className="text-amber-100 hover:text-white transition-colors transform hover:scale-110 duration-300">
                      <TikTokIcon className="w-6 h-6" />
                    </a>
                  )}
                  {companyContact.social_media?.linkedin && (
                    <a href={companyContact.social_media.linkedin} className="text-amber-100 hover:text-white transition-colors transform hover:scale-110 duration-300">
                      <Linkedin className="w-6 h-6" />
                    </a>
                  )}
                  {companyContact.social_media?.youtube && (
                    <a href={companyContact.social_media.youtube} className="text-amber-100 hover:text-white transition-colors transform hover:scale-110 duration-300">
                      <Youtube className="w-6 h-6" />
                    </a>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-xl font-semibold text-white mb-6">Contact Us</h4>
                <div className="space-y-4">
                  {companyContact.email && (
                    <a href={`mailto:${companyContact.email}`} className="flex items-center gap-3 text-amber-100 hover:text-white transition-colors text-lg">
                      <Mail className="w-5 h-5" />
                      {companyContact.email}
                    </a>
                  )}
                  {companyContact.phone && (
                    <a href={`tel:${companyContact.phone}`} className="flex items-center gap-3 text-amber-100 hover:text-white transition-colors text-lg">
                      <Phone className="w-5 h-5" />
                      {companyContact.phone}
                    </a>
                  )}
                  {companyContact.whatsapp && (
                    <a 
                      href={`https://wa.me/${companyContact.whatsapp.replace(/[^0-9]/g, '')}`}
                      className="flex items-center gap-3 text-amber-100 hover:text-green-300 transition-colors text-lg"
                    >
                      <MessageCircle className="w-5 h-5" />
                      WhatsApp: {companyContact.whatsapp}
                    </a>
                  )}
                </div>
              </div>

              {/* Office Hours */}
              <div>
                <h4 className="text-xl font-semibold text-white mb-6">Office Hours</h4>
                <div className="space-y-3 text-amber-100 text-lg">
                  {companyContact.business_hours?.weekdays ? (
                    <p className="flex justify-between">
                      <span>Mon - Fri:</span>
                      <span className="font-medium">{companyContact.business_hours.weekdays}</span>
                    </p>
                  ) : (
                    <p className="flex justify-between">
                      <span>Mon - Fri:</span>
                      <span className="font-medium">8:00 AM - 6:00 PM</span>
                    </p>
                  )}
                  {companyContact.business_hours?.saturday ? (
                    <p className="flex justify-between">
                      <span>Saturday:</span>
                      <span className="font-medium">{companyContact.business_hours.saturday}</span>
                    </p>
                  ) : (
                    <p className="flex justify-between">
                      <span>Saturday:</span>
                      <span className="font-medium">9:00 AM - 4:00 PM</span>
                    </p>
                  )}
                  {companyContact.business_hours?.sunday ? (
                    <p className="flex justify-between">
                      <span>Sunday:</span>
                      <span className="font-medium">{companyContact.business_hours.sunday}</span>
                    </p>
                  ) : (
                    <p className="flex justify-between">
                      <span>Sunday:</span>
                      <span className="font-medium">Closed</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="pt-12 border-t border-amber-500 text-center bg-amber-900/30 rounded-2xl p-8">
              <p className="text-amber-200 text-lg">
                &copy; {new Date().getFullYear()} {companyContact.company_name || 'A-LUXE REALTY'}. All rights reserved. | 
                <Link href="/privacy" className="ml-2 hover:text-white transition-colors">Privacy Policy</Link> | 
                <Link href="/terms" className="ml-2 hover:text-white transition-colors">Terms of Service</Link>
              </p>
              <p className="text-amber-300/90 text-base mt-3 font-light">
                Designed with excellence for discerning clients
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}