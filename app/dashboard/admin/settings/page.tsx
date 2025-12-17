'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { 
  Save, Loader2, CheckCircle, AlertCircle, 
  Building2, Mail, Phone, MapPin, Clock, MessageCircle,
  Facebook, Instagram, Twitter, Linkedin, X,
  ArrowLeft
} from 'lucide-react'

interface ContactInfo {
  company_name: string
  tagline: string
  address: string
  phone: string
  email: string
  whatsapp: string
  business_hours: {
    weekdays: string
    saturday: string
    sunday: string
  }
  social_media: {
    facebook: string
    instagram: string
    twitter: string
    linkedin: string
  }
}

interface ContactInfoFormData extends ContactInfo {}

export default function AdminSettingsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const hasLoadedSettings = useRef(false) // ← Prevent re-fetching

  const [contactInfo, setContactInfo] = useState<ContactInfoFormData>({
    company_name: 'A-LUXE REALTY',
    tagline: 'INVEST SMART. LIVE LUXE.',
    address: 'Nairobi, Kenya',
    phone: '+254 700 000 000',
    email: 'info@aluxerealty.com',
    whatsapp: '+254 700 000 000',
    business_hours: {
      weekdays: 'Mon - Fri: 8:00 AM - 6:00 PM',
      saturday: 'Sat: 9:00 AM - 4:00 PM',
      sunday: 'Closed'
    },
    social_media: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: ''
    }
  })

  const fetchSettings = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('company_settings')
        .select('setting_value')
        .eq('setting_key', 'contact_info')
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error)
        throw error
      }

      if (data && data.setting_value) {
        setContactInfo(data.setting_value as ContactInfoFormData)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      setErrorMessage('Failed to load settings. Using defaults.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load settings only once on mount
  useEffect(() => {
    if (!authLoading && !hasLoadedSettings.current) {
      if (!user || !isAdmin) {
        router.push('/dashboard')
        return
      }
      hasLoadedSettings.current = true
      fetchSettings()
    }
  }, [authLoading, user, isAdmin, router, fetchSettings])

  const handleChange = useCallback((path: string, value: string) => {
    setContactInfo(prev => {
      const newState = { ...prev }
      const keys = path.split('.')
      
      if (keys.length === 1) {
        (newState as any)[keys[0]] = value
      } else if (keys.length === 2) {
        const [parent, child] = keys
        if (parent === 'business_hours' || parent === 'social_media') {
          ;(newState[parent as keyof ContactInfoFormData] as any)[child] = value
        }
      }
      
      return newState
    })
    
    setIsDirty(true)
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveStatus('idle')
    setErrorMessage('')

    try {
      const supabase = createClient()
      
      const { data: existingData } = await supabase
        .from('company_settings')
        .select('setting_key')
        .eq('setting_key', 'contact_info')
        .single()

      let error
      
      if (existingData) {
        const { error: updateError } = await supabase
          .from('company_settings')
          .update({ 
            setting_value: contactInfo,
            updated_by: user?.id,
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', 'contact_info')
        
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from('company_settings')
          .insert({ 
            setting_key: 'contact_info',
            setting_value: contactInfo,
            created_by: user?.id,
            updated_by: user?.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        
        error = insertError
      }

      if (error) throw error

      setSaveStatus('success')
      setIsDirty(false)
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error: any) {
      console.error('Error saving settings:', error)
      setSaveStatus('error')
      setErrorMessage(error.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.push('/dashboard')
      }
    } else {
      router.push('/dashboard')
    }
  }

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all changes?')) {
      await fetchSettings()
      setIsDirty(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
        <p className="text-gray-400">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header with Back Button */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={handleBack}
              variant="outline"
              className="border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center gap-4">
              {isDirty && (
                <span className="text-sm text-amber-400 bg-amber-900/30 px-3 py-1 rounded-full">
                  ⚠️ Unsaved changes
                </span>
              )}
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Company Settings</h1>
          <p className="text-gray-400">Manage your company contact information and social media links</p>
        </div>

        {/* Status Messages */}
        {saveStatus === 'success' && (
          <div className="mb-6 p-4 bg-emerald-900/30 border border-emerald-700/50 rounded-xl animate-fade-in">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-emerald-300 font-semibold">Settings saved successfully!</p>
                <p className="text-emerald-400/80 text-sm mt-1">Your changes are now live on the contact page.</p>
              </div>
            </div>
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl animate-fade-in">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-300 font-semibold">Failed to save settings</p>
                <p className="text-red-400/80 text-sm mt-1">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Company Info Section */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-800">
            <div className="flex items-center mb-6">
              <Building2 className="w-6 h-6 text-amber-400 mr-3" />
              <h2 className="text-xl md:text-2xl font-bold text-white">Company Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                <input
                  type="text"
                  value={contactInfo.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tagline</label>
                <input
                  type="text"
                  value={contactInfo.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Details Section */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-800">
            <div className="flex items-center mb-6">
              <Phone className="w-6 h-6 text-amber-400 mr-3" />
              <h2 className="text-xl md:text-2xl font-bold text-white">Contact Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MessageCircle className="w-4 h-4 inline mr-2" />
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={contactInfo.whatsapp}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Office Address
                </label>
                <input
                  type="text"
                  value={contactInfo.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Business Hours Section */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-800">
            <div className="flex items-center mb-6">
              <Clock className="w-6 h-6 text-amber-400 mr-3" />
              <h2 className="text-xl md:text-2xl font-bold text-white">Business Hours</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Weekdays</label>
                <input
                  type="text"
                  value={contactInfo.business_hours.weekdays}
                  onChange={(e) => handleChange('business_hours.weekdays', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all focus:outline-none"
                  placeholder="Mon - Fri: 8:00 AM - 6:00 PM"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Saturday</label>
                <input
                  type="text"
                  value={contactInfo.business_hours.saturday}
                  onChange={(e) => handleChange('business_hours.saturday', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all focus:outline-none"
                  placeholder="Sat: 9:00 AM - 4:00 PM"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sunday</label>
                <input
                  type="text"
                  value={contactInfo.business_hours.sunday}
                  onChange={(e) => handleChange('business_hours.sunday', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all focus:outline-none"
                  placeholder="Closed"
                  required
                />
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-800">
            <div className="flex items-center mb-6">
              <Facebook className="w-6 h-6 text-amber-400 mr-3" />
              <h2 className="text-xl md:text-2xl font-bold text-white">Social Media Links</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Facebook className="w-4 h-4 inline mr-2" />
                  Facebook
                </label>
                <input
                  type="url"
                  value={contactInfo.social_media.facebook}
                  onChange={(e) => handleChange('social_media.facebook', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all focus:outline-none"
                  placeholder="https://facebook.com/yourpage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Instagram className="w-4 h-4 inline mr-2" />
                  Instagram
                </label>
                <input
                  type="url"
                  value={contactInfo.social_media.instagram}
                  onChange={(e) => handleChange('social_media.instagram', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all focus:outline-none"
                  placeholder="https://instagram.com/yourpage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <X className="w-4 h-4 inline mr-2" />
                  X (Twitter)
                </label>
                <input
                  type="url"
                  value={contactInfo.social_media.twitter}
                  onChange={(e) => handleChange('social_media.twitter', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all focus:outline-none"
                  placeholder="https://x.com/yourpage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Linkedin className="w-4 h-4 inline mr-2" />
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={contactInfo.social_media.linkedin}
                  onChange={(e) => handleChange('social_media.linkedin', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all focus:outline-none"
                  placeholder="https://linkedin.com/company/yourpage"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="sticky bottom-6 bg-gradient-to-t from-gray-950 via-gray-950/95 to-transparent pb-6 pt-4 -mx-4 px-4 md:-mx-0 md:px-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-400">
                {isDirty ? 'You have unsaved changes' : 'All changes saved'}
              </div>
              
              <div className="flex gap-4">
                {isDirty && (
                  <Button
                    type="button"
                    onClick={handleReset}
                    variant="outline"
                    className="border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
                  >
                    Reset Changes
                  </Button>
                )}
                
                <Button
                  type="submit"
                  disabled={saving || !isDirty}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-6 text-lg font-semibold shadow-lg shadow-amber-900/30 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px] transition-all"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* Add CSS for animations */}
        <style jsx>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  )
}