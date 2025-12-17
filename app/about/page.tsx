// app/about/page.tsx - FINAL FIXED VERSION
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  Target, 
  Eye, 
  Gem, 
  Handshake, 
  Globe,
  CheckCircle,
  Users,
  MapPin,
  Award,
  Shield,
  TrendingUp,
  Home,
  Briefcase,
  Menu,
  X,
  Phone,
  Mail,
  MessageCircle,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
} from 'lucide-react'
import { getSupabase } from '@/lib/supabase-optimized'
const supabase = getSupabase()

// Custom TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.10-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
)

interface BusinessHours {
  weekdays?: string
  saturday?: string
  sunday?: string
}

interface SocialMedia {
  facebook?: string
  instagram?: string
  twitter?: string
  linkedin?: string
  youtube?: string
  tiktok?: string
}

interface CompanyContact {
  company_name?: string
  tagline?: string
  address?: string
  phone?: string
  email?: string
  whatsapp?: string
  business_hours?: BusinessHours
  social_media?: SocialMedia
}

// Define the database row type
interface CompanySettingsRow {
  id: string
  setting_key: string
  setting_value: any
  updated_at: string
  updated_by: string | null
}

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [companyContact, setCompanyContact] = useState<CompanyContact>({})
  const [loading, setLoading] = useState(true)

  // Handle scroll for sticky navigation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Load company contact settings - FINAL FIXED VERSION
  useEffect(() => {
    async function loadCompanySettings() {
      setLoading(true)
      try {
        // Try to get contact_info setting first
        const { data: contactData, error: contactError } = await supabase
          .from('company_settings')
          .select('*')
          .eq('setting_key', 'contact_info')
          .maybeSingle()

        // Type guard to check if data exists
        if (!contactError && contactData) {
          const typedData = contactData as CompanySettingsRow
          if (typedData.setting_value) {
            setCompanyContact(typedData.setting_value as CompanyContact)
            setLoading(false)
            return
          }
        }

        // Try company_info as fallback
        const { data: companyData, error: companyError } = await supabase
          .from('company_settings')
          .select('*')
          .eq('setting_key', 'company_info')
          .maybeSingle()
        
        // Type guard to check if data exists
        if (!companyError && companyData) {
          const typedData = companyData as CompanySettingsRow
          if (typedData.setting_value) {
            setCompanyContact(typedData.setting_value as CompanyContact)
            setLoading(false)
            return
          }
        }

        // Fallback defaults
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
          },
          social_media: {
            facebook: '#',
            instagram: '#',
            twitter: '#',
            linkedin: '#',
            youtube: '#',
            tiktok: '#'
          }
        })
      } catch (error) {
        console.error('Failed to load company settings:', error)
        // Fallback defaults on error
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
          },
          social_media: {
            facebook: '#',
            instagram: '#',
            twitter: '#',
            linkedin: '#',
            youtube: '#',
            tiktok: '#'
          }
        })
      } finally {
        setLoading(false)
      }
    }

    loadCompanySettings()
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      {/* STICKY Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 py-4 px-4 lg:px-8 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-2xl' 
          : 'bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm'
      }`}>
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="group">
              <div className="text-2xl font-bold tracking-wider text-amber-600">
                {companyContact.company_name || 'A-LUXE REALTY'}
              </div>
              <div className="text-xs tracking-widest text-gray-600 group-hover:text-amber-400 transition-colors">
                {companyContact.tagline || 'INVEST SMART. LIVE LUXE.'}
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
                className="text-gray-600 hover:text-amber-600 transition-colors duration-300 text-sm font-medium tracking-wide relative group"
              >
                Properties
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-600 group-hover:w-full transition-all duration-300"></span>
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
                className="text-amber-600 font-semibold transition-colors duration-300 text-sm font-medium tracking-wide relative group"
              >
                About
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-amber-600"></span>
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
            <div className="lg:hidden mt-4 bg-white/95 backdrop-blur-xl rounded-xl p-4 border border-gray-200 shadow-lg">
              <div className="flex flex-col space-y-4">
                <Link href="/" className="text-gray-600 hover:text-amber-600 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link href="/properties" className="text-gray-600 hover:text-amber-600 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Properties</Link>
                <Link href="/agents" className="text-gray-600 hover:text-amber-600 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Agents</Link>
                <Link href="/about" className="text-amber-600 font-semibold py-2" onClick={() => setMobileMenuOpen(false)}>About</Link>
                <Link href="/contact" className="text-gray-600 hover:text-amber-600 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                <Link href="/auth/login" className="text-amber-600 font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-20"></div>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.15) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 60% 80%, rgba(217, 119, 6, 0.08) 0%, transparent 50%)`
        }}></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23f59e0b' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`
        }}></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="inline-block p-1 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center mx-auto">
              <Building2 className="w-8 h-8 text-white shrink-0" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">Story</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Redefining luxury real estate in Kenya through exceptional service, 
            unparalleled expertise, and a commitment to excellence.
          </p>
        </div>
      </section>

      {/* Mission & Vision Cards */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50/50"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(30deg, transparent 0%, rgba(251, 191, 36, 0.03) 50%, transparent 100%)`
        }}></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mission Card */}
            <div className="group relative overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-orange-500/5 to-transparent rounded-full translate-y-20 -translate-x-20"></div>
              <div className="relative z-10 p-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Target className="w-10 h-10 text-white shrink-0" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <div className="space-y-4">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    To transform the luxury real estate landscape in Kenya by providing 
                    discerning clients with access to exceptional properties and expert guidance.
                  </p>
                  <div className="flex items-start space-x-3 pt-4 border-t border-gray-100">
                    <CheckCircle className="w-5 h-5 text-amber-600 mt-1 shrink-0" />
                    <p className="text-gray-600">Every property tells a unique story</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-amber-600 mt-1 shrink-0" />
                    <p className="text-gray-600">Personalized service that exceeds expectations</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vision Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `radial-gradient(circle at 30% 30%, rgba(251, 191, 36, 0.3) 0%, transparent 50%),
                                 radial-gradient(circle at 70% 70%, rgba(245, 158, 11, 0.2) 0%, transparent 50%)`
              }}></div>
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
              <div className="relative z-10 p-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Eye className="w-10 h-10 text-gray-900 shrink-0" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-6">Our Vision</h2>
                <div className="space-y-4">
                  <p className="text-lg text-gray-300 leading-relaxed">
                    To become Kenya's most trusted and prestigious real estate partner, 
                    recognized for integrity, innovation, and delivering exceptional value.
                  </p>
                  <div className="flex items-start space-x-3 pt-4 border-t border-gray-700">
                    <Award className="w-5 h-5 text-amber-400 mt-1 shrink-0" />
                    <p className="text-gray-300">Setting industry standards in luxury real estate</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-amber-400 mt-1 shrink-0" />
                    <p className="text-gray-300">Building lasting relationships through trust</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 10% 20%, rgba(251, 191, 36, 0.05) 0%, transparent 50%),
                           radial-gradient(circle at 90% 80%, rgba(251, 191, 36, 0.05) 0%, transparent 50%)`
        }}></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              The principles that guide every decision and interaction at {companyContact.company_name || 'A-LUXE REALTY'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Gem className="w-8 h-8 shrink-0" />,
                title: "Excellence",
                description: "We strive for perfection in every detail, from property selection to client service, ensuring an unparalleled experience.",
                gradient: "from-amber-500/20 to-orange-500/20"
              },
              {
                icon: <Handshake className="w-8 h-8 shrink-0" />,
                title: "Integrity",
                description: "Honest, transparent dealings form the foundation of our relationships with clients, partners, and the community.",
                gradient: "from-emerald-500/20 to-teal-500/20"
              },
              {
                icon: <Globe className="w-8 h-8 shrink-0" />,
                title: "Innovation",
                description: "We embrace cutting-edge technology and creative solutions to deliver superior results in a rapidly evolving market.",
                gradient: "from-blue-500/20 to-indigo-500/20"
              }
            ].map((value, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 hover:border-amber-500/50 transition-all duration-500 hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-2xl bg-gray-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <div className="text-amber-500">
                      {value.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{value.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-50 to-white"></div>
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(45deg, #f59e0b 25%, transparent 25%, transparent 75%, #f59e0b 75%, #f59e0b),
                           linear-gradient(45deg, #f59e0b 25%, transparent 25%, transparent 75%, #f59e0b 75%, #f59e0b)`,
          backgroundSize: '60px 60px',
          backgroundPosition: '0 0, 30px 30px'
        }}></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Home className="w-8 h-8 shrink-0" />, value: "50+", label: "Luxury Properties" },
              { icon: <Users className="w-8 h-8 shrink-0" />, value: "2+", label: "Expert Agents" },
              { icon: <MapPin className="w-8 h-8 shrink-0" />, value: "Nairobi", label: "Prime Location" },
              { icon: <Award className="w-8 h-8 shrink-0" />, value: "1+", label: "Years Excellence" }
            ].map((stat, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-8 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-amber-600 mb-4 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Promise */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-amber-50/50"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 50% 0%, rgba(251, 191, 36, 0.08) 0%, transparent 40%)`
        }}></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-10 border border-gray-200 shadow-2xl overflow-hidden">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose {companyContact.company_name || 'A-LUXE REALTY'}?</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Comprehensive solutions tailored to your unique real estate needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* For Buyers */}
              <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl p-8 border border-amber-100">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center mr-4">
                    <Briefcase className="w-7 h-7 text-white shrink-0" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">For Buyers</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Exclusive access to off-market properties",
                    "Expert market analysis and valuation",
                    "Personalized property matching",
                    "Negotiation expertise"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start group">
                      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center mr-3 mt-1 group-hover:scale-110 transition-transform shrink-0">
                        <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      </div>
                      <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* For Sellers */}
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-8 border border-blue-100">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mr-4">
                    <TrendingUp className="w-7 h-7 text-white shrink-0" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">For Sellers</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Premium marketing strategies",
                    "Vast network of qualified buyers",
                    "Professional photography & staging",
                    "Maximum value realization"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start group">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1 group-hover:scale-110 transition-transform shrink-0">
                        <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                      </div>
                      <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-50 to-white"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(45deg, transparent 0%, rgba(251, 191, 36, 0.05) 50%, transparent 100%)`
        }}></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Begin Your Luxury Journey?
            </h2>
            <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto">
              Join the discerning clients who trust {companyContact.company_name || 'A-LUXE REALTY'} for their most important property decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/properties">
                <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-10 py-4 text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 font-semibold">
                  Explore Properties
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white px-10 py-4 text-lg rounded-xl transition-all duration-300 font-semibold hover:scale-105">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - UPDATED WITH PROPER LOGIC */}
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
                  <a 
                    href={companyContact.social_media.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-100 hover:text-white transition-colors transform hover:scale-110 duration-300"
                  >
                    <Facebook className="w-6 h-6 shrink-0" />
                  </a>
                )}
                {companyContact.social_media?.instagram && (
                  <a 
                    href={companyContact.social_media.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-100 hover:text-white transition-colors transform hover:scale-110 duration-300"
                  >
                    <Instagram className="w-6 h-6 shrink-0" />
                  </a>
                )}
                {companyContact.social_media?.tiktok && (
                  <a 
                    href={companyContact.social_media.tiktok} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-100 hover:text-white transition-colors transform hover:scale-110 duration-300"
                  >
                    <TikTokIcon className="w-6 h-6 shrink-0" />
                  </a>
                )}
                {companyContact.social_media?.linkedin && (
                  <a 
                    href={companyContact.social_media.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-100 hover:text-white transition-colors transform hover:scale-110 duration-300"
                  >
                    <Linkedin className="w-6 h-6 shrink-0" />
                  </a>
                )}
                {companyContact.social_media?.youtube && (
                  <a 
                    href={companyContact.social_media.youtube} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-100 hover:text-white transition-colors transform hover:scale-110 duration-300"
                  >
                    <Youtube className="w-6 h-6 shrink-0" />
                  </a>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-xl font-semibold text-white mb-6">Contact Us</h4>
              <div className="space-y-4">
                {companyContact.email && (
                  <a 
                    href={`mailto:${companyContact.email}`} 
                    className="flex items-center gap-3 text-amber-100 hover:text-white transition-colors text-lg"
                  >
                    <Mail className="w-5 h-5 shrink-0" />
                    {companyContact.email}
                  </a>
                )}
                {companyContact.phone && (
                  <a 
                    href={`tel:${companyContact.phone}`} 
                    className="flex items-center gap-3 text-amber-100 hover:text-white transition-colors text-lg"
                  >
                    <Phone className="w-5 h-5 shrink-0" />
                    {companyContact.phone}
                  </a>
                )}
                {companyContact.whatsapp && (
                  <a 
                    href={`https://wa.me/${companyContact.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-amber-100 hover:text-green-300 transition-colors text-lg"
                  >
                    <MessageCircle className="w-5 h-5 shrink-0" />
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
  );
}