// app/page.tsx - UPDATED WITH NATURAL BACKGROUND TRANSITION
'use client'

import { useEffect, useState, useRef } from 'react'
import { getSupabase } from '@/lib/supabase-optimized'
const supabase = getSupabase()
import { Property } from '@/lib/types'
import { Button } from '@/components/ui/button'
import OptimizedSearchBar from '@/components/ui/SegmentedSearchBar'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Mail, 
  Phone, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Youtube, 
  MessageCircle, 
  Menu, 
  X, 
  ChevronDown, 
  Home as HomeIcon, 
  Search,
  MapPin,
  DollarSign,
  Building,
  Tag,
  Music // TikTok icon from Lucide
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

// Luxury real estate background images
const HERO_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    type: 'image'
  },
  {
    url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80',
    type: 'image'
  },
  {
    url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    type: 'image'
  },
  {
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    type: 'image'
  },
  {
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    type: 'image'
  },
]

// Fixed CompanyContact interface to match your JSON structure
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
    tiktok?: string  // ADDED: TikTok support
  }
}

export default function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [companyContact, setCompanyContact] = useState<CompanyContact>({})
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false) // ADDED: For sticky nav
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null)

  // Handle scroll for sticky navigation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-slide functionality
  useEffect(() => {
    autoSlideRef.current = setTimeout(() => {
      nextImage()
    }, 8000)

    return () => {
      if (autoSlideRef.current) {
        clearTimeout(autoSlideRef.current)
      }
    }
  }, [currentImageIndex])

  // Load company contact settings - UPDATED WITH TIKTOK
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

  // Load featured properties - UPDATED WITH FEATURED PRIORITY
  useEffect(() => {
    async function loadFeaturedProperties() {
      try {
        // Fetch 6 properties: featured first, then others
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('featured', { ascending: false }) // Featured properties first
          .order('created_at', { ascending: false }) // Then by creation date
          .limit(6)

        if (error) {
          console.error('Properties query failed:', error)
          return
        }

        setFeaturedProperties(data || [])
        
      } catch (error) {
        console.error('Unexpected error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFeaturedProperties()
  }, [])

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length)
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  // Get listing type display info for property cards
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Images with Fade Animation */}
        {HERO_IMAGES.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={image.url}
              alt="Luxury Property"
              fill
              priority={index === 0}
              className="object-cover"
              sizes="100vw"
              quality={90}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECIgDRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
          </div>
        ))}
        
        {/* STICKY Navigation */}
        <nav className={`fixed top-0 left-0 right-0 z-50 py-4 px-4 lg:px-8 transition-all duration-300 ${
          isScrolled 
            ? 'bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-2xl' 
            : 'bg-black/50 backdrop-blur-md border-b border-white/10'
        }`}>
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="group">
                <div className="text-2xl font-bold tracking-wider text-amber-400">A-LUXE REALTY</div>
                <div className="text-xs tracking-widest text-gray-300 group-hover:text-amber-400 transition-colors">
                  INVEST SMART. LIVE LUXE.
                </div>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 space-x-8">
                <Link 
                  href="/" 
                  className="text-white/90 hover:text-amber-400 transition-colors duration-300 text-sm font-medium tracking-wide relative group"
                >
                  Home
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link 
                  href="/properties" 
                  className="text-white/90 hover:text-amber-400 transition-colors duration-300 text-sm font-medium tracking-wide relative group"
                >
                  Properties
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link 
                  href="/agents" 
                  className="text-white/90 hover:text-amber-400 transition-colors duration-300 text-sm font-medium tracking-wide relative group"
                >
                  Agents
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link 
                  href="/about" 
                  className="text-white/90 hover:text-amber-400 transition-colors duration-300 text-sm font-medium tracking-wide relative group"
                >
                  About
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link 
                  href="/contact" 
                  className="text-white/90 hover:text-amber-400 transition-colors duration-300 text-sm font-medium tracking-wide relative group"
                >
                  Contact
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </div>
              
              {/* Desktop CTA Button */}
              <div className="hidden lg:block">
                <Link href="/auth/login">
                  <Button className="bg-transparent border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-gray-900 transition-all duration-300 px-6 py-2 text-sm font-medium">
                    Sign In
                  </Button>
                </Link>
              </div>
              
              {/* Mobile Menu Button */}
              <button 
                className="lg:hidden text-white z-50"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
            
            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="lg:hidden mt-4 bg-black/95 backdrop-blur-xl rounded-xl p-4">
                <div className="flex flex-col space-y-4">
                  <Link href="/" className="text-white hover:text-amber-400 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                  <Link href="/properties" className="text-white hover:text-amber-400 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Properties</Link>
                  <Link href="/agents" className="text-white hover:text-amber-400 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Agents</Link>
                  <Link href="/about" className="text-white hover:text-amber-400 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>About</Link>
                  <Link href="/contact" className="text-white hover:text-amber-400 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                  <Link href="/auth/login" className="text-amber-400 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Contact Icons - Fixed Top Right - UPDATED WITH TIKTOK */}
        <div className="fixed top-24 right-6 z-40 flex flex-col gap-3 bg-black/20 backdrop-blur-md rounded-2xl p-3 border border-white/10">
          {companyContact.email && (
            <a
              href={`mailto:${companyContact.email}`}
              className="w-10 h-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center hover:bg-amber-400 hover:border-amber-400 transition-all duration-300 group"
              title="Email us"
            >
              <Mail className="w-4 h-4 text-white group-hover:text-gray-900" />
            </a>
          )}
          {companyContact.phone && (
            <a
              href={`tel:${companyContact.phone}`}
              className="w-10 h-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center hover:bg-amber-400 hover:border-amber-400 transition-all duration-300 group"
              title="Call us"
            >
              <Phone className="w-4 h-4 text-white group-hover:text-gray-900" />
            </a>
          )}
          {companyContact.whatsapp && (
            <a
              href={`https://wa.me/${companyContact.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center hover:bg-green-500 hover:border-green-500 transition-all duration-300 group"
              title="WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-white" />
            </a>
          )}
          {companyContact.social_media?.facebook && (
            <a
              href={companyContact.social_media.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-all duration-300 group"
              title="Facebook"
            >
              <Facebook className="w-4 h-4 text-white" />
            </a>
          )}
          {companyContact.social_media?.instagram && (
            <a
              href={companyContact.social_media.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 hover:border-pink-600 transition-all duration-300 group"
              title="Instagram"
            >
              <Instagram className="w-4 h-4 text-white" />
            </a>
          )}
          {companyContact.social_media?.tiktok && (
            <a
              href={companyContact.social_media.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center hover:bg-black hover:border-black transition-all duration-300 group"
              title="TikTok"
            >
              <TikTokIcon className="w-4 h-4 text-white" />
            </a>
          )}
          {companyContact.social_media?.linkedin && (
            <a
              href={companyContact.social_media.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center hover:bg-blue-700 hover:border-blue-700 transition-all duration-300 group"
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4 text-white" />
            </a>
          )}
          {companyContact.social_media?.youtube && (
            <a
              href={companyContact.social_media.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center hover:bg-red-600 hover:border-red-600 transition-all duration-300 group"
              title="YouTube"
            >
              <Youtube className="w-4 h-4 text-white" />
            </a>
          )}
        </div>

        {/* Hero Content - Updated padding for sticky nav */}
        <div className="relative z-20 flex items-center justify-center h-full pt-32 px-4">
          <div className="text-center text-white max-w-6xl w-full">
            {/* Main Headline */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-light mb-4 tracking-tight leading-tight text-white">
                FIND YOUR PERFECT
              </h1>
              <div className="flex items-center justify-center gap-2 mb-6">
                <h1 className="text-5xl md:text-6xl font-bold leading-tight animate-pulse">
                  <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                    LUXURY HOME
                  </span>
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-gray-200 font-light max-w-3xl mx-auto leading-relaxed">
                Premium real estate solutions in Kenya's most exclusive neighborhoods
              </p>
            </div>
            
            {/* OPTIMIZED SEARCH BAR - Dropdowns now appear above stats */}
            <div className="relative z-50">
              <OptimizedSearchBar />
            </div>

            {/* Stats - Moved down to avoid dropdown overlap */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto mt-16">
              <div className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-3xl font-bold text-amber-400">50+</div>
                <div className="text-sm text-gray-300 mt-1">Premium Properties</div>
              </div>
              <div className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-3xl font-bold text-amber-400">2+</div>
                <div className="text-sm text-gray-300 mt-1">Expert Agents</div>
              </div>
              <div className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-3xl font-bold text-amber-400">Vast</div>
                <div className="text-sm text-gray-300 mt-1">Experience</div>
              </div>
              <div className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-3xl font-bold text-amber-400">100%</div>
                <div className="text-sm text-gray-300 mt-1">Client Satisfaction</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-amber-400/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-amber-400/60 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* **ENHANCED NATURAL TRANSITION SECTION** */}
      <div className="relative">
        {/* Main transition gradient - starts from black, slowly lightens */}
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-black via-gray-900/90 via-30% via-gray-800/70 via-50% via-gray-200/40 via-70% to-gray-50/20 transform -translate-y-16"></div>
        
        {/* Soft warm overlay for smooth transition */}
        <div className="absolute inset-x-0 top-0 h-128 bg-gradient-to-b from-transparent via-amber-900/10 via-40% via-amber-800/5 via-60% via-amber-100/3 to-transparent transform -translate-y-32"></div>
        
        {/* Featured Properties Section with natural layered background */}
        <section className="relative py-32">
          {/* Background layers for natural gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50/0 via-gray-100/10 via-20% via-gray-50/30 via-40% via-gray-50/50 via-60% to-gray-50"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-gray-100/0 via-amber-50/5 via-30% via-amber-50/10 via-50% via-amber-50/15 to-amber-50/20"></div>
          
          {/* Soft decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-amber-200/5 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-amber-100/3 via-transparent to-transparent"></div>
          </div>
          
          <div className="container mx-auto px-4 relative">
            {/* Section Header */}
            <div className="text-center mb-20">
              <h2 className="text-5xl font-light text-amber-700 mb-4 tracking-tight leading-tight">
                FEATURED <span className="font-bold text-amber-600">PROPERTIES</span>
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto mb-8"></div>
              <p className="text-2xl text-white max-w-3xl mx-auto leading-relaxed font-light">
                Handpicked luxury properties that redefine modern living and investment potential
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500 mx-auto"></div>
                <p className="mt-6 text-gray-600 text-lg">Loading exclusive properties...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {featuredProperties.map((property) => {
                  const listingTypeInfo = getListingTypeInfo(property.listing_type || 'sale')
                  
                  return (
                    <div key={property.id} className="group bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-200 hover:border-amber-500/30 transform hover:-translate-y-2">
                      <div className="relative h-72 bg-gray-200 overflow-hidden">
                        {property.images && property.images.length > 0 ? (
                          <Image 
                            src={property.images[0]}
                            alt={property.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECIgDRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                            <span className="text-gray-600">Image Coming Soon</span>
                          </div>
                        )}
                        
                        {/* FEATURED BADGE */}
                        {property.featured && (
                          <div className="absolute top-4 left-4 z-20">
                            <span className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full text-xs font-bold text-white shadow-lg shadow-amber-500/30 flex items-center gap-1 animate-pulse">
                              <span>⭐</span> FEATURED
                            </span>
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        <div className={`absolute top-4 ${property.featured ? 'right-4' : 'left-4'} flex flex-col gap-1`}>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            property.status === 'available' ? 'bg-green-500 text-white' :
                            property.status === 'pending' ? 'bg-yellow-500 text-white' :
                            property.status === 'sold' ? 'bg-red-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>
                            {property.status.toUpperCase()}
                          </span>
                        </div>
                        
                        {/* Listing Type Badge */}
                        <div className="absolute bottom-4 right-4 z-20">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${listingTypeInfo.color} text-white border ${listingTypeInfo.borderColor} shadow-md`}>
                            {listingTypeInfo.label}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-amber-700 transition-colors">{property.title}</h3>
                        <p className="text-gray-600 mb-5 flex items-center text-sm">
                          <MapPin className="w-4 h-4 mr-2 text-amber-500" />
                          {property.city}, {property.state}
                        </p>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                          <span className="flex items-center gap-2">
                            <span className="text-lg">🛏️</span>
                            <span className="font-semibold">{property.bedrooms || 0}</span>
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="text-lg">🚿</span>
                            <span className="font-semibold">{property.bathrooms || 0}</span>
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="text-lg">📐</span>
                            <span className="font-semibold">{property.square_feet ? `${property.square_feet.toLocaleString()} sqft` : 'N/A'}</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                          <div>
                            <p className="text-3xl font-bold text-amber-600">
                              {formatPrice(property.price)}
                            </p>
                            {property.featured && (
                              <p className="text-xs text-amber-500 font-medium mt-1 flex items-center gap-1">
                                <span>⭐</span> Premium Featured Listing
                              </p>
                            )}
                          </div>
                          <Link href={`/properties/${property.id}`}>
                            <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-amber-500/25 transition-all duration-300">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Brand Promise Section - now with more natural light background */}
      <section className="py-24 bg-gradient-to-b from-gray-50/80 via-gray-100/90 to-gray-100">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-5xl mx-auto">
            <div className="text-5xl font-light mb-10 text-gray-900">
              <span className="font-bold text-amber-600">A-LUXE REALTY</span> — WHERE EVERY PROPERTY TELLS A STORY OF 
              <span className="font-bold text-amber-600"> LUXURY</span> AND 
              <span className="font-bold text-amber-600"> PRESTIGE</span>
            </div>
            <p className="text-2xl text-gray-700 mb-10 leading-relaxed font-light">
              We don't just sell properties; we curate lifestyles and secure investments for discerning clients who appreciate the finer things in life.
            </p>
            <div className="flex justify-center space-x-4">
              {/* Contact Icons - HORIZONTAL LAYOUT - UPDATED WITH TIKTOK */}
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                {companyContact.email && (
                  <a
                    href={`mailto:${companyContact.email}`}
                    className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-50 rounded-full flex items-center justify-center hover:from-amber-200 hover:to-amber-100 transition-all duration-300 group border border-amber-200 hover:shadow-lg hover:shadow-amber-200/30"
                    title="Email us"
                  >
                    <Mail className="w-6 h-6 text-amber-600 group-hover:text-amber-700" />
                  </a>
                )}
                {companyContact.phone && (
                  <a
                    href={`tel:${companyContact.phone}`}
                    className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-50 rounded-full flex items-center justify-center hover:from-amber-200 hover:to-amber-100 transition-all duration-300 group border border-amber-200 hover:shadow-lg hover:shadow-amber-200/30"
                    title="Call us"
                  >
                    <Phone className="w-6 h-6 text-amber-600 group-hover:text-amber-700" />
                  </a>
                )}
                {companyContact.whatsapp && (
                  <a
                    href={`https://wa.me/${companyContact.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center hover:from-green-200 hover:to-green-100 transition-all duration-300 group border border-green-200 hover:shadow-lg hover:shadow-green-200/30"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </a>
                )}
                {companyContact.social_media?.facebook && (
                  <a
                    href={companyContact.social_media.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center hover:from-blue-200 hover:to-blue-100 transition-all duration-300 group border border-blue-200 hover:shadow-lg hover:shadow-blue-200/30"
                    title="Facebook"
                  >
                    <Facebook className="w-6 h-6 text-blue-600" />
                  </a>
                )}
                {companyContact.social_media?.instagram && (
                  <a
                    href={companyContact.social_media.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center hover:from-pink-200 hover:to-purple-200 transition-all duration-300 group border border-pink-200 hover:shadow-lg hover:shadow-pink-200/30"
                    title="Instagram"
                  >
                    <Instagram className="w-6 h-6 text-pink-600" />
                  </a>
                )}
                {companyContact.social_media?.tiktok && (
                  <a
                    href={companyContact.social_media.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center hover:from-gray-800 hover:to-gray-900 transition-all duration-300 group border border-gray-800 hover:shadow-lg hover:shadow-gray-800/30"
                    title="TikTok"
                  >
                    <TikTokIcon className="w-6 h-6 text-white" />
                  </a>
                )}
                {companyContact.social_media?.linkedin && (
                  <a
                    href={companyContact.social_media.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-50 rounded-full flex items-center justify-center hover:from-blue-200 hover:to-cyan-100 transition-all duration-300 group border border-blue-200 hover:shadow-lg hover:shadow-blue-200/30"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-6 h-6 text-blue-700" />
                  </a>
                )}
                {companyContact.social_media?.youtube && (
                  <a
                    href={companyContact.social_media.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center hover:from-red-200 hover:to-red-100 transition-all duration-300 group border border-red-200 hover:shadow-lg hover:shadow-red-200/30"
                    title="YouTube"
                  >
                    <Youtube className="w-6 h-6 text-red-600" />
                  </a>
                )}
              </div>
            </div>
            <Link href="/about">
              <Button className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-10 py-6 text-xl font-semibold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-600/25 transform hover:scale-105">
                Discover Our Story
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Helpful Links Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-amber-50/30 border-t border-gray-200/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-6">Quick Links</h3>
            <div className="w-20 h-1.5 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto mb-10"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Quick Links Section 1 */}
            <div>
              <ul className="space-y-5">
                <li>
                  <Link href="/properties" className="text-gray-800 hover:text-amber-600 transition-colors flex items-center gap-3 text-xl font-medium group">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg flex items-center justify-center group-hover:from-amber-200 group-hover:to-amber-100 transition-all">
                      <ChevronDown className="w-5 h-5 rotate-90 text-amber-500" />
                    </div>
                    <span>Browse All Properties</span>
                  </Link>
                </li>
                <li>
                  <Link href="/properties?type=for-sale" className="text-gray-800 hover:text-amber-600 transition-colors flex items-center gap-3 text-xl font-medium group">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg flex items-center justify-center group-hover:from-amber-200 group-hover:to-amber-100 transition-all">
                      <ChevronDown className="w-5 h-5 rotate-90 text-amber-500" />
                    </div>
                    <span>Properties for Sale</span>
                  </Link>
                </li>
                <li>
                  <Link href="/properties?type=for-rent" className="text-gray-800 hover:text-amber-600 transition-colors flex items-center gap-3 text-xl font-medium group">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg flex items-center justify-center group-hover:from-amber-200 group-hover:to-amber-100 transition-all">
                      <ChevronDown className="w-5 h-5 rotate-90 text-amber-500" />
                    </div>
                    <span>Properties for Rent</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Quick Links Section 2 */}
            <div>
              <ul className="space-y-5">
                <li>
                  <Link href="/agents" className="text-gray-800 hover:text-amber-600 transition-colors flex items-center gap-3 text-xl font-medium group">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg flex items-center justify-center group-hover:from-amber-200 group-hover:to-amber-100 transition-all">
                      <ChevronDown className="w-5 h-5 rotate-90 text-amber-500" />
                    </div>
                    <span>Meet Our Agents</span>
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-800 hover:text-amber-600 transition-colors flex items-center gap-3 text-xl font-medium group">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg flex items-center justify-center group-hover:from-amber-200 group-hover:to-amber-100 transition-all">
                      <ChevronDown className="w-5 h-5 rotate-90 text-amber-500" />
                    </div>
                    <span>About Our Company</span>
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-800 hover:text-amber-600 transition-colors flex items-center gap-3 text-xl font-medium group">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg flex items-center justify-center group-hover:from-amber-200 group-hover:to-amber-100 transition-all">
                      <ChevronDown className="w-5 h-5 rotate-90 text-amber-500" />
                    </div>
                    <span>Contact Us Today</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - UPDATED WITH TIKTOK */}
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
  )
}