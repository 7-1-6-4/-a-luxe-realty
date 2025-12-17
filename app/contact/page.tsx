// app/contact/page.tsx
'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { 
  Phone, Mail, MapPin, Clock, MessageCircle, 
  Facebook, Instagram, Linkedin, Send,
  CheckCircle, AlertCircle, Loader2,
  Menu, X, Home, Building, Users, Info, User
} from 'lucide-react'

// TikTok Icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.33 6.33 0 0 0-1-.05A6.34 6.34 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

interface ContactInfo {
  company_name: string
  tagline: string
  address: string
  phone: string
  email: string
  whatsapp?: string
  business_hours: {
    weekdays: string
    saturday: string
    sunday?: string
  }
  social_media?: {
    facebook?: string
    instagram?: string
    tiktok?: string
    linkedin?: string
  }
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    fetchContactInfo()
    
    // Sticky navigation scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchContactInfo = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('company_settings')
        .select('setting_value')
        .eq('setting_key', 'contact_info')
        .single()

      if (error) throw error

      if (data) {
        setContactInfo(data.setting_value as ContactInfo)
      }
    } catch (error) {
      console.error('Error fetching contact info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      // First, save to database
      const supabase = createClient()
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            subject: formData.subject || null,
            message: formData.message,
            status: 'unread'
          }
        ])

      if (dbError) throw dbError

      // Then, send email to company's mailbox
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          companyEmail: contactInfo?.email || 'info@aluxerealty.com'
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email')
      }

      setSubmitStatus('success')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000)
    } catch (error: any) {
      console.error('Error submitting form:', error)
      setSubmitStatus('error')
      setErrorMessage(error.message || 'Failed to send message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return Facebook
      case 'instagram': return Instagram
      case 'tiktok': return TikTokIcon
      case 'linkedin': return Linkedin
      default: return null
    }
  }

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/properties', label: 'Properties', icon: Building },
    { href: '/agents', label: 'Agents', icon: Users },
    { href: '/about', label: 'About', icon: Info },
    { href: '/contact', label: 'Contact', icon: Mail },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/30 to-orange-50/20">
      {/* Sticky Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg py-3' 
          : 'bg-white/80 backdrop-blur-xl border-b border-gray-200 py-5'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-gray-900 hover:text-amber-600 transition-colors group">
              <div className="text-2xl font-bold tracking-wider bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent group-hover:from-amber-700 group-hover:to-orange-700 transition-all">
                {contactInfo?.company_name || 'A-LUXE REALTY'}
              </div>
              <div className="text-xs tracking-widest text-gray-600 group-hover:text-gray-700 transition-colors">
                {contactInfo?.tagline || 'INVEST SMART. LIVE LUXE.'}
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-10">
              {navLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className={`flex items-center space-x-2 text-gray-600 hover:text-amber-600 transition-colors font-medium hover:scale-105 duration-200 ${
                      link.href === '/contact' ? 'text-amber-600 font-semibold border-b-2 border-amber-600 pb-1' : ''
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="outline" className="hidden md:flex border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-600/20">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-amber-600 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Fixed positioning */}
        <div className={`md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg transition-all duration-300 ease-in-out ${
          mobileMenuOpen 
            ? 'opacity-100 translate-y-0 visible' 
            : 'opacity-0 -translate-y-4 invisible'
        }`}>
          <div className="container mx-auto px-4 py-4">
            <div className="space-y-3">
              {navLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                      link.href === '/contact'
                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                )
              })}
              <Link 
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl border border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Add padding for fixed nav */}
      <div className="pt-24"></div>

      {/* Hero Header with Villa Background */}
      <div className="relative h-[400px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80"
            alt="Luxury Villa"
            fill
            className="object-cover"
            style={{ objectPosition: 'center' }}
            priority
            sizes="100vw"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-amber-900/50" />
          {/* Bottom fade to white */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-50 to-transparent" />
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 h-full flex items-center justify-center">
          <div className="max-w-4xl mx-auto w-full">
            {/* Glass Card */}
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/30 transform hover:scale-[1.02] transition-all duration-300">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight text-center drop-shadow-2xl">
                Get in <span className="text-amber-400">Touch</span>
              </h1>
              <p className="text-lg md:text-xl text-white/95 leading-relaxed text-center drop-shadow-lg font-light">
                Have questions about luxury real estate in Kenya? Our expert team is here to help you find your perfect property.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Content */}
      <div className="container mx-auto px-4 py-16 -mt-12 relative z-20">
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading contact information...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Contact Form */}
            <div className="bg-white backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-gray-200 shadow-2xl shadow-gray-900/10 hover:shadow-3xl transition-all duration-300">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Send us a Message</h2>
              <p className="text-gray-600 mb-6">Fill out the form and we'll get back to you within 24 hours</p>
              
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start animate-in fade-in slide-in-from-top-2 duration-300">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-emerald-900 font-semibold">Message sent successfully!</p>
                    <p className="text-emerald-700 text-sm mt-1">We'll get back to you soon.</p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-900 font-semibold">Failed to send message</p>
                    <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white transition-all group-hover:border-gray-400"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white transition-all group-hover:border-gray-400"
                      placeholder="+254 700 000 000"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white transition-all group-hover:border-gray-400"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white transition-all group-hover:border-gray-400"
                    placeholder="Property inquiry"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white transition-all resize-none group-hover:border-gray-400"
                    placeholder="Tell us about your real estate needs..."
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-4 lg:py-6 text-lg font-semibold shadow-lg shadow-amber-600/30 hover:shadow-xl hover:shadow-amber-600/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              {/* Main Contact Card */}
              <div className="bg-white backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-gray-200 shadow-2xl shadow-gray-900/10">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
                
                <div className="space-y-4">
                  {/* Address */}
                  {contactInfo?.address && (
                    <div className="flex items-start group hover:bg-amber-50 p-3 lg:p-4 rounded-xl transition-all">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center mr-3 lg:mr-4 group-hover:from-amber-200 group-hover:to-orange-200 transition-all border border-amber-200 group-hover:shadow-md flex-shrink-0">
                        <MapPin className="w-5 h-5 lg:w-6 lg:h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-semibold mb-1 text-sm lg:text-lg">Office Location</h3>
                        <p className="text-gray-600 text-sm lg:text-base">{contactInfo.address}</p>
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {contactInfo?.phone && (
                    <div className="flex items-start group hover:bg-amber-50 p-3 lg:p-4 rounded-xl transition-all">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center mr-3 lg:mr-4 group-hover:from-amber-200 group-hover:to-orange-200 transition-all border border-amber-200 group-hover:shadow-md flex-shrink-0">
                        <Phone className="w-5 h-5 lg:w-6 lg:h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-semibold mb-1 text-sm lg:text-lg">Phone</h3>
                        <a 
                          href={`tel:${contactInfo.phone}`}
                          className="text-gray-600 hover:text-amber-600 transition-colors font-medium text-sm lg:text-base"
                        >
                          {contactInfo.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* WhatsApp - This stays in Contact Information, not Follow Us */}
                  {contactInfo?.whatsapp && (
                    <div className="flex items-start group hover:bg-amber-50 p-3 lg:p-4 rounded-xl transition-all">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mr-3 lg:mr-4 group-hover:from-green-200 group-hover:to-emerald-200 transition-all border border-green-200 group-hover:shadow-md flex-shrink-0">
                        <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-semibold mb-1 text-sm lg:text-lg">WhatsApp</h3>
                        <a 
                          href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-green-600 transition-colors font-medium text-sm lg:text-base"
                        >
                          {contactInfo.whatsapp}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {contactInfo?.email && (
                    <div className="flex items-start group hover:bg-amber-50 p-3 lg:p-4 rounded-xl transition-all">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center mr-3 lg:mr-4 group-hover:from-amber-200 group-hover:to-orange-200 transition-all border border-amber-200 group-hover:shadow-md flex-shrink-0">
                        <Mail className="w-5 h-5 lg:w-6 lg:h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-semibold mb-1 text-sm lg:text-lg">Email</h3>
                        <a 
                          href={`mailto:${contactInfo.email}`}
                          className="text-gray-600 hover:text-amber-600 transition-colors font-medium break-all text-sm lg:text-base"
                        >
                          {contactInfo.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Business Hours */}
                  {contactInfo?.business_hours && (
                    <div className="flex items-start group hover:bg-amber-50 p-3 lg:p-4 rounded-xl transition-all">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center mr-3 lg:mr-4 group-hover:from-amber-200 group-hover:to-orange-200 transition-all border border-amber-200 group-hover:shadow-md flex-shrink-0">
                        <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-semibold mb-2 text-sm lg:text-lg">Business Hours</h3>
                        <div className="space-y-1">
                          {contactInfo.business_hours.weekdays && (
                            <p className="text-gray-600 text-sm lg:text-base">{contactInfo.business_hours.weekdays}</p>
                          )}
                          {contactInfo.business_hours.saturday && (
                            <p className="text-gray-600 text-sm lg:text-base">{contactInfo.business_hours.saturday}</p>
                          )}
                          {contactInfo.business_hours.sunday && (
                            <p className="text-gray-600 text-sm lg:text-base">{contactInfo.business_hours.sunday}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Media Card - ONLY shows actual social media platforms */}
              {contactInfo?.social_media && Object.keys(contactInfo.social_media).length > 0 && (
                <div className="bg-white backdrop-blur-lg rounded-3xl p-6 border border-gray-200 shadow-2xl shadow-gray-900/10">
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Follow Us</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(contactInfo.social_media).map(([platform, url]) => {
                      if (!url) return null
                      const Icon = getSocialIcon(platform)
                      if (!Icon) return null // Skip unknown platforms
                      
                      const colorClasses = {
                        facebook: 'from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 border-blue-200',
                        instagram: 'from-pink-100 to-purple-200 hover:from-pink-200 hover:to-purple-300 border-pink-200',
                        tiktok: 'from-gray-100 to-black hover:from-gray-200 hover:to-black border-gray-300',
                        linkedin: 'from-blue-100 to-cyan-200 hover:from-blue-200 hover:to-cyan-300 border-blue-200'
                      }
                      
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-center space-x-2 px-3 py-3 lg:px-4 lg:py-4 bg-gradient-to-br ${colorClasses[platform as keyof typeof colorClasses] || 'from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 border-gray-200'} rounded-xl border transition-all group hover:shadow-md hover:scale-105`}
                        >
                          <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-gray-700 group-hover:text-gray-900" />
                          <span className="text-gray-700 group-hover:text-gray-900 font-medium capitalize text-xs lg:text-sm">
                            {platform === 'tiktok' ? 'TikTok' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </span>
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Company Info */}
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-4">
                {contactInfo?.company_name || 'A-LUXE REALTY'}
              </h3>
              <p className="text-gray-300 mb-4">
                {contactInfo?.tagline || 'INVEST SMART. LIVE LUXE.'}
              </p>
              <p className="text-gray-400 text-sm">
                Leading luxury real estate agency in Kenya, providing premium properties and exceptional service.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-amber-400 transition-colors flex items-center space-x-2"
                    >
                      <span>→</span>
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Contact Us</h4>
              <ul className="space-y-3">
                {contactInfo?.address && (
                  <li className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">{contactInfo.address}</span>
                  </li>
                )}
                {contactInfo?.phone && (
                  <li className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <a href={`tel:${contactInfo.phone}`} className="text-gray-300 hover:text-amber-400 transition-colors">
                      {contactInfo.phone}
                    </a>
                  </li>
                )}
                {contactInfo?.email && (
                  <li className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <a href={`mailto:${contactInfo.email}`} className="text-gray-300 hover:text-amber-400 transition-colors">
                      {contactInfo.email}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* Newsletter Section - Commented out for future use */}
            {/*
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Newsletter</h4>
              <p className="text-gray-300 mb-4">Subscribe to get updates on new properties</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 px-4 py-2 rounded-r-lg font-medium transition-all hover:scale-105">
                  Subscribe
                </button>
              </div>
            </div>
            */}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 mb-8"></div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} {contactInfo?.company_name || 'A-LUXE REALTY'}. All rights reserved.
            </p>
            
            {/* Social Links - Only show actual social media */}
            <div className="flex space-x-4">
              {contactInfo?.social_media?.facebook && (
                <a 
                  href={contactInfo.social_media.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {contactInfo?.social_media?.instagram && (
                <a 
                  href={contactInfo.social_media.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {contactInfo?.social_media?.tiktok && (
                <a 
                  href={contactInfo.social_media.tiktok} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
                >
                  <TikTokIcon className="w-5 h-5" />
                </a>
              )}
              {contactInfo?.social_media?.linkedin && (
                <a 
                  href={contactInfo.social_media.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}