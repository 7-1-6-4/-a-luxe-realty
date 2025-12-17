// app/agents/page.tsx - UPDATED WITH FOOTER & REMOVED BADGES
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Phone, Mail, MapPin, Award, Star, 
  Calendar, Home, Shield, TrendingUp,
  MessageCircle, CheckCircle, Briefcase,
  DollarSign, Target, Globe, Users, Trophy, TrendingDown,
  ArrowRight, Sparkles, User, Menu, X,
  ChevronDown, Facebook, Instagram, Linkedin, Youtube
} from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

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

interface Agent {
  id: string
  user_id: string
  full_name: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  office_phone: string | null
  bio: string | null
  specialties: string[] | null
  years_experience: number | null
  rating: number | null
  total_sales: number | null
  license_number: string | null
  available_for_new_clients: boolean | null
  preferred_contact_method: string | null
  commission_rate: number | null
  is_active: boolean | null
  created_at: string
  updated_at: string
  avatar_url?: string
  user_full_name?: string
}

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

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [companyContact, setCompanyContact] = useState<CompanyContact>({})

  useEffect(() => {
    async function fetchAgents() {
      try {
        const supabase = createClient()
        
        // Fetch agents
        const { data: agentsData, error: agentsError } = await supabase
          .from('agents')
          .select('*')
          .eq('is_active', true)
          .order('rating', { ascending: false })

        if (agentsError) {
          console.error('Agents fetch error:', agentsError)
          throw agentsError
        }

        if (!agentsData || agentsData.length === 0) {
          setAgents([])
          return
        }

        const userIds = agentsData.map(agent => agent.user_id)
        
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, full_name, avatar_url, email, phone')
          .in('id', userIds)

        if (usersError) {
          console.error('Users fetch error:', usersError)
        }

        const combinedAgents = agentsData.map(agent => {
          const user = usersData?.find(u => u.id === agent.user_id)
          
          return {
            ...agent,
            avatar_url: user?.avatar_url || null,
            full_name: agent.full_name || user?.full_name || 'Agent',
            email: agent.email || user?.email || null,
            phone: agent.phone || user?.phone || null,
            user_full_name: user?.full_name
          }
        })

        setAgents(combinedAgents)
        
      } catch (err: any) {
        console.error('Full error details:', err)
        setError(err.message || 'Failed to load agents. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    // Load company contact settings
    async function loadCompanySettings() {
      try {
        const supabase = createClient()
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

    fetchAgents()
    loadCompanySettings()
  }, [])

  const formatSpecialties = (specialties: string[] | null) => {
    if (!specialties || specialties.length === 0) return []
    
    const specialtyMap: Record<string, string> = {
      'luxury_villas': 'Luxury Villas',
      'commercial': 'Commercial Real Estate',
      'penthouse': 'Penthouse',
      'beachfront': 'Beachfront Properties',
      'vacation_homes': 'Vacation Homes',
      'hotel_investments': 'Hotel Investments',
      'apartments': 'Luxury Apartments',
      'land': 'Land & Development',
      'investment': 'Investment Properties'
    }
    
    return specialties.map(s => specialtyMap[s] || s.replace('_', ' '))
  }

  const getContactInfo = (agent: Agent) => {
    const method = agent.preferred_contact_method || 'email'
    
    switch (method) {
      case 'phone':
        return { 
          icon: Phone, 
          value: agent.phone, 
          type: 'tel:',
          label: 'Phone'
        }
      case 'whatsapp':
        return { 
          icon: MessageCircle, 
          value: agent.whatsapp, 
          type: 'https://wa.me/',
          label: 'WhatsApp'
        }
      default:
        return { 
          icon: Mail, 
          value: agent.email, 
          type: 'mailto:',
          label: 'Email'
        }
    }
  }

  // Optimized AgentImage component for mobile and desktop
  const AgentImage = ({ agent }: { agent: Agent }) => {
    if (agent.avatar_url) {
      return (
        <div className="relative w-full h-64 sm:h-72 md:h-80 overflow-hidden">
          <Image
            src={agent.avatar_url}
            alt={agent.full_name || 'Agent'}
            fill
            className="object-cover object-center"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw"
            quality={90}
            priority={false}
            style={{ objectPosition: 'center 20%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      )
    }
    
    // Fallback with professional placeholder
    return (
      <div className="relative w-full h-64 sm:h-72 md:h-80 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="relative mb-3 sm:mb-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center shadow-lg">
            <User className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-amber-500" />
          </div>
          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full p-1 sm:p-1.5 shadow-lg">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
        </div>
        <span className="text-amber-800 font-semibold text-sm sm:text-base md:text-lg text-center">{agent.full_name || 'Agent'}</span>
        <span className="text-amber-600 text-xs sm:text-sm mt-1">Professional Agent</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-orange-50/20">
      {/* Navigation - Mobile Optimized */}
      <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-3 md:py-4">
            {/* Logo */}
            <Link href="/" className="text-gray-900 hover:text-amber-600 transition-colors group">
              <div className="text-lg sm:text-xl md:text-2xl font-bold tracking-wider bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                A-LUXE REALTY
              </div>
              <div className="text-xs tracking-widest text-gray-600 hidden sm:block">
                INVEST SMART. LIVE LUXE.
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-4 lg:space-x-8">
              <Link href="/" className="text-gray-600 hover:text-amber-600 transition-colors font-medium text-sm lg:text-base">Home</Link>
              <Link href="/properties" className="text-gray-600 hover:text-amber-600 transition-colors font-medium text-sm lg:text-base">Properties</Link>
              <Link href="/agents" className="text-amber-600 font-semibold border-b-2 border-amber-600 pb-1 text-sm lg:text-base">Agents</Link>
              <Link href="/about" className="text-gray-600 hover:text-amber-600 transition-colors font-medium text-sm lg:text-base">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-amber-600 transition-colors font-medium text-sm lg:text-base">Contact</Link>
            </div>
            
            {/* Mobile Menu Button & Sign In */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
              <Link href="/auth/login" className="hidden sm:block">
                <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all text-sm px-3 py-2">
                  Sign In
                </Button>
              </Link>
              
              <button 
                className="md:hidden text-gray-700 p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-2 bg-white/95 backdrop-blur-lg rounded-xl p-4 shadow-xl border border-gray-200 animate-in slide-in-from-top-5 duration-200">
              <div className="flex flex-col space-y-3">
                <Link href="/" className="text-gray-700 hover:text-amber-600 transition-colors py-2 px-2 text-base font-medium rounded-lg hover:bg-amber-50" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link href="/properties" className="text-gray-700 hover:text-amber-600 transition-colors py-2 px-2 text-base font-medium rounded-lg hover:bg-amber-50" onClick={() => setMobileMenuOpen(false)}>Properties</Link>
                <Link href="/agents" className="text-amber-600 font-medium py-2 px-2 text-base rounded-lg bg-amber-50" onClick={() => setMobileMenuOpen(false)}>Agents</Link>
                <Link href="/about" className="text-gray-700 hover:text-amber-600 transition-colors py-2 px-2 text-base font-medium rounded-lg hover:bg-amber-50" onClick={() => setMobileMenuOpen(false)}>About</Link>
                <Link href="/contact" className="text-gray-700 hover:text-amber-600 transition-colors py-2 px-2 text-base font-medium rounded-lg hover:bg-amber-50" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                <div className="pt-3 mt-3 border-t border-gray-200">
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-2.5 text-sm">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Header - Mobile Optimized */}
      <div className="relative py-6 md:py-8 lg:py-12 overflow-hidden">
        {/* Background Image - Optimized for mobile */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053')] bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-amber-50/60 to-orange-50/70"></div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-gradient-to-br from-amber-400/15 to-orange-400/15 rounded-full blur-2xl md:blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-gradient-to-tr from-amber-300/15 to-orange-300/15 rounded-full blur-2xl md:blur-3xl" />
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-6 md:mb-8 lg:mb-10">
            {/* Badge - Responsive */}
            <div className="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 mb-3 sm:mb-4 shadow-sm">
              <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-amber-600 mr-1.5 sm:mr-2" />
              <span className="text-xs sm:text-sm font-semibold text-amber-900">Kenya's Premier Real Estate Team</span>
            </div>
            
            {/* Heading - Responsive */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 leading-tight px-2">
              Meet Our <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Elite Agents</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-4 sm:mb-5 md:mb-6 max-w-2xl mx-auto leading-relaxed px-2 sm:px-4">
              Connect with Kenya's most trusted luxury real estate specialists. 
              Each agent brings expertise and personalized service to your property journey.
            </p>
            
            {/* Quick Stats - Responsive */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 max-w-2xl mx-auto px-2 sm:px-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 shadow-sm md:shadow-md border border-gray-100">
                <div className="text-base sm:text-lg md:text-2xl font-bold text-amber-600 mb-0.5 sm:mb-1">{agents.length}+</div>
                <div className="text-xs text-gray-600 font-medium">Expert Agents</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 shadow-sm md:shadow-md border border-gray-100">
                <div className="text-base sm:text-lg md:text-2xl font-bold text-amber-600 mb-0.5 sm:mb-1">50+</div>
                <div className="text-xs text-gray-600 font-medium">Properties Sold</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 shadow-sm md:shadow-md border border-gray-100">
                <div className="text-base sm:text-lg md:text-2xl font-bold text-amber-600 mb-0.5 sm:mb-1">4.8★</div>
                <div className="text-xs text-gray-600 font-medium">Average Rating</div>
              </div>
            </div>
          </div>

          {/* Elite Team Card - Responsive */}
          <div className="max-w-6xl mx-auto relative">
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl shadow-lg md:shadow-2xl">
              {/* Background Image with Overlay */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073')] bg-cover bg-center">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-900/95 via-orange-900/90 to-amber-800/95 backdrop-blur-[2px]"></div>
              </div>
              
              {/* Content - Responsive */}
              <div className="relative z-10 p-4 sm:p-6 md:p-8 lg:p-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 md:gap-6">
                  {/* Left Side - Text Content */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center mb-2 sm:mb-3">
                      <div className="bg-amber-400/20 backdrop-blur-sm rounded-full p-2 sm:p-2.5 md:p-3 mr-2 sm:mr-3 md:mr-4">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7 text-amber-200" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-0.5 sm:mb-1">Our Elite Team</h2>
                        <p className="text-amber-100 text-xs sm:text-sm md:text-base">
                          {agents.length} expert agents ready to help you
                        </p>
                      </div>
                    </div>
                    <p className="text-amber-50/90 text-xs sm:text-sm md:text-base max-w-xl leading-relaxed hidden sm:block">
                      Each member brings unparalleled market knowledge, proven track records, 
                      and a commitment to excellence in luxury real estate.
                    </p>
                  </div>
                  
                  {/* Right Side - Stats Grid - REMOVED AVG EXPERIENCE */}
                  <div className="flex gap-2 sm:gap-3 md:gap-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl md:rounded-2xl p-2.5 sm:p-3 md:p-4 lg:p-5 border border-white/20 text-center min-w-[90px] sm:min-w-[100px] md:min-w-[120px]">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-emerald-300 mx-auto mb-1 md:mb-2" />
                      <div className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-white mb-0.5 sm:mb-1">
                        {agents.filter(a => a.available_for_new_clients).length}
                      </div>
                      <div className="text-amber-100 text-xs font-medium">Available Now</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Accent Border */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Agents Grid - Mobile Optimized */}
      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12 lg:py-16 -mt-4 sm:-mt-6 md:-mt-8 relative z-20">
        {loading ? (
          <div className="text-center py-12 sm:py-16 md:py-20">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 border-4 border-amber-200 border-t-amber-600 mb-3 sm:mb-4 md:mb-6"></div>
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-1 sm:mb-2">Loading Our Team</h3>
            <p className="text-gray-600 text-sm sm:text-base">Fetching our expert agents...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 sm:py-12 md:py-20 bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-lg max-w-2xl mx-auto p-4 sm:p-6 md:p-12">
            <div className="text-red-500 text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 md:mb-6">⚠️</div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">Unable to Load Agents</h3>
            <p className="text-gray-600 mb-4 sm:mb-6 md:mb-8 text-sm sm:text-base">{error}</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center">
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base"
              >
                Try Again
              </Button>
              <Link href="/properties">
                <Button variant="outline" className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base">
                  Browse Properties
                </Button>
              </Link>
            </div>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-8 sm:py-12 md:py-20 bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-lg max-w-2xl mx-auto p-4 sm:p-6 md:p-12">
            <div className="text-5xl sm:text-6xl md:text-7xl mb-3 sm:mb-4 md:mb-6">👥</div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">No Active Agents Found</h2>
            <p className="text-gray-600 mb-4 sm:mb-6 md:mb-8 max-w-md mx-auto text-sm sm:text-base">
              We're currently assembling Kenya's finest luxury real estate team.
              Check back soon or browse our available properties.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center">
              <Link href="/properties">
                <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-3 text-xs sm:text-sm md:text-base">
                  Browse Properties
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-3 text-xs sm:text-sm md:text-base">
                  Contact Admin
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Photo Quality Tip Banner - Mobile Optimized */}
            <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg sm:rounded-xl border border-amber-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-amber-800">
                    💡 <span className="font-bold">HI:</span> Meet our agents
                  </p>
                </div>
              </div>
            </div>

            {/* Agents Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 mb-8 sm:mb-12 md:mb-16">
              {agents.map((agent) => {
                const contactInfo = getContactInfo(agent)
                const specialties = formatSpecialties(agent.specialties)
                
                return (
                  <div 
                    key={agent.id} 
                    className="group bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-md hover:shadow-xl overflow-hidden border border-gray-100 hover:border-amber-200 transition-all duration-500 hover:-translate-y-0.5 sm:hover:-translate-y-1"
                  >
                    {/* Agent Photo Section - Responsive */}
                    <div className="relative">
                      <AgentImage agent={agent} />
                      
                      {/* Status Badge - Responsive */}
                      <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 z-20">
                        {agent.available_for_new_clients ? (
                          <span className="inline-flex items-center px-2 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1.5 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-lg">
                            <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 md:mr-1.5" />
                            <span className="hidden sm:inline">Available</span>
                            <span className="sm:hidden">✓</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1.5 rounded-full text-xs font-semibold bg-gray-500 text-white shadow-lg">
                            <span className="hidden sm:inline">Busy</span>
                            <span className="sm:hidden">⏳</span>
                          </span>
                        )}
                      </div>
                      
                      {/* Rating Badge - Responsive */}
                      {agent.rating && agent.rating > 0 && (
                        <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 bg-white/95 backdrop-blur-sm px-2 py-1 sm:px-2 sm:py-1.5 md:px-3 md:py-2 rounded-lg sm:rounded-xl flex items-center space-x-0.5 sm:space-x-1 md:space-x-1.5 shadow-lg z-20">
                          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-amber-500 fill-amber-500" />
                          <span className="font-bold text-gray-900 text-xs sm:text-sm">{agent.rating.toFixed(1)}</span>
                        </div>
                      )}
                      
                      {/* REMOVED: Experience Badge */}
                    </div>

                    {/* Agent Info - Responsive */}
                    <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                      {/* Name & Title - FIXED: Only show license if it exists */}
                      <div className="mb-2 sm:mb-3 md:mb-4">
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-0.5 sm:mb-1 group-hover:text-amber-600 transition-colors line-clamp-1">
                          {agent.full_name}
                        </h3>
                        {/* ONLY SHOW LICENSE IF IT EXISTS IN DATABASE */}
                        {agent.license_number && (
                          <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                            <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1 sm:mr-1.5 md:mr-2 text-amber-600 flex-shrink-0" />
                            <span className="font-medium truncate">
                              License: {agent.license_number}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Bio */}
                      {agent.bio && (
                        <p className="text-gray-600 mb-3 sm:mb-4 md:mb-6 line-clamp-2 text-xs sm:text-sm leading-relaxed">
                          {agent.bio}
                        </p>
                      )}

                      {/* Specialties */}
                      {specialties.length > 0 && (
                        <div className="mb-3 sm:mb-4 md:mb-6">
                          <div className="flex items-center mb-1.5 sm:mb-2 md:mb-3">
                            <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1 sm:mr-1.5 md:mr-2 text-amber-600" />
                            <span className="text-xs sm:text-sm font-semibold text-gray-700">Specialties</span>
                          </div>
                          <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2">
                            {specialties.slice(0, 3).map((specialty, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded border border-amber-200"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* REMOVED: Stats Row */}

                      {/* Contact Buttons - Responsive */}
                      <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
                        {contactInfo.value && (
                          <Link 
                            href={`${contactInfo.type}${contactInfo.value}`}
                            className="block"
                          >
                            <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-2 sm:py-2.5 md:py-4 lg:py-6 font-semibold shadow-md hover:shadow-lg transition-all text-xs sm:text-sm md:text-base">
                              <contactInfo.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1 sm:mr-1.5 md:mr-2" />
                              <span className="hidden sm:inline">Contact via </span>{contactInfo.label}
                            </Button>
                          </Link>
                        )}
                        
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-3">
                          {agent.email && (
                            <Link href={`mailto:${agent.email}`}>
                              <Button
                                variant="outline"
                                className="w-full border-gray-300 text-gray-700 hover:bg-amber-500 py-1.5 sm:py-2 md:py-3 lg:py-5 text-xs sm:text-sm"
                              >
                                <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-0.5 sm:mr-1 md:mr-1.5" />
                                <span className="hidden xs:inline">Email</span>
                                <span className="xs:hidden">✉️</span>
                              </Button>
                            </Link>
                          )}
                          {agent.phone && (
                            <Link href={`tel:${agent.phone}`}>
                              <Button
                                variant="outline"
                                className="w-full border-gray-300 text-gray-700 hover:bg-amber-500 py-1.5 sm:py-2 md:py-3 lg:py-5 text-xs sm:text-sm"
                              >
                                <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-0.5 sm:mr-1 md:mr-1.5" />
                                <span className="hidden xs:inline">Call</span>
                                <span className="xs:hidden">📞</span>
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Call to Action - Mobile Optimized */}
            <div className="mt-8 sm:mt-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl sm:rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 text-center text-white relative overflow-hidden shadow-xl sm:shadow-2xl">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-2xl sm:blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-2xl sm:blur-3xl" />
              
              <div className="relative z-10">
                <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-amber-200" />
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Ready to Begin Your Journey?</h2>
                <p className="text-sm sm:text-base md:text-xl text-amber-50 mb-6 sm:mb-8 max-w-2xl mx-auto">
                  Our elite agents combine market expertise with personalized service 
                  to guide you through every step.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link href="/contact">
                    <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-500 px-6 sm:px-8 py-3 sm:py-6 text-sm sm:text-lg font-semibold shadow-xl">
                      Contact Our Team
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/properties">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-2 border-white text-amber-600 hover:bg-amber-300 px-6 sm:px-8 py-3 sm:py-6 text-sm sm:text-lg font-semibold"
                    >
                      Browse Properties
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
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
  )
}