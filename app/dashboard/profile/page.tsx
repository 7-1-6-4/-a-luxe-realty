// app/dashboard/profile/page.tsx - COMPLETELY FIXED WITH PASSWORD FIXES
'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase-optimized'
import { Avatar } from '@/components/ui/avatar'
import Link from 'next/link'
import { useRef } from 'react'
import { 
  Phone, Mail, MessageCircle, Briefcase, 
  Target, Award, DollarSign, Calendar,
  CheckCircle, XCircle, Home, Star, Shield
} from 'lucide-react'

const supabase = getSupabase()

// Agent-specific interface
interface AgentData {
  id: string;
  user_id: string;
  bio: string | null;
  specialties: string[] | null;
  years_experience: number | null;
  rating: number | null;
  total_sales: number | null;
  license_number: string | null;
  license_expiry_date: string | null;
  available_for_new_clients: boolean | null;
  preferred_contact_method: 'email' | 'phone' | 'whatsapp' | null;
  commission_rate: number | null;
  whatsapp: string | null;
  office_phone: string | null;
  is_active: boolean | null;
  phone: string | null;
  email: string | null;
  full_name: string | null;
}

// Specialty options
const SPECIALTY_OPTIONS = [
  { value: 'luxury_villas', label: 'Luxury Villas' },
  { value: 'commercial', label: 'Commercial Real Estate' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'beachfront', label: 'Beachfront Properties' },
  { value: 'vacation_homes', label: 'Vacation Homes' },
  { value: 'hotel_investments', label: 'Hotel Investments' },
  { value: 'apartments', label: 'Luxury Apartments' },
  { value: 'land', label: 'Land & Development' },
  { value: 'investment', label: 'Investment Properties' }
];

export default function ProfilePage() {
  const { user } = useAuth() // Removed signOut from destructuring
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [imageError, setImageError] = useState(false)
  const [isAgent, setIsAgent] = useState(false)
  const [agentLoading, setAgentLoading] = useState(true)
  
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    avatar_url: '',
  })
  
  // Agent form state
  const [agentForm, setAgentForm] = useState<AgentData>({
    id: '',
    user_id: '',
    bio: '',
    specialties: [],
    years_experience: 0,
    rating: 0,
    total_sales: 0,
    license_number: '',
    license_expiry_date: '',
    available_for_new_clients: true,
    preferred_contact_method: 'email',
    commission_rate: 0,
    whatsapp: '',
    office_phone: '',
    is_active: true,
    phone: '',
    email: '',
    full_name: ''
  })
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  
  const [passwordMessage, setPasswordMessage] = useState('')
  const [profileMessage, setProfileMessage] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Initialize form with user data and check if agent
  useEffect(() => {
    async function initializeData() {
      if (!user) return
      
      // Set basic profile form
      setProfileForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
        avatar_url: user.avatar_url || '',
      })
      
      // Check if user is an agent
      try {
        const { data: agentData, error } = await supabase
          .from('agents')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error checking agent status:', error)
        }
        
        if (agentData) {
          setIsAgent(true)
          console.log('Agent data loaded:', agentData)
          // Initialize agent form with database data
          setAgentForm({
            id: agentData.id || '',
            user_id: agentData.user_id || user.id,
            bio: agentData.bio || '',
            specialties: agentData.specialties || [],
            years_experience: agentData.years_experience || 0,
            rating: agentData.rating || 0,
            total_sales: agentData.total_sales || 0,
            license_number: agentData.license_number || '',
            license_expiry_date: agentData.license_expiry_date || '',
            available_for_new_clients: agentData.available_for_new_clients !== false,
            preferred_contact_method: agentData.preferred_contact_method || 'email',
            commission_rate: agentData.commission_rate || 0,
            whatsapp: agentData.whatsapp || '',
            office_phone: agentData.office_phone || '',
            is_active: agentData.is_active !== false,
            phone: agentData.phone || user.phone || '',
            email: agentData.email || user.email || '',
            full_name: agentData.full_name || user.full_name || ''
          })
        } else {
          console.log('No agent data found for user')
        }
      } catch (error) {
        console.error('Error initializing agent data:', error)
      } finally {
        setAgentLoading(false)
      }
    }
    
    initializeData()
  }, [user])

  // Handle avatar upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setImageError(false)
      const file = event.target.files?.[0]
      if (!file || !user) return

      if (file.size > 5 * 1024 * 1024) {
        setProfileMessage({
          type: 'error',
          text: '❌ File size should be less than 5MB'
        })
        setUploading(false)
        return
      }

      // Check file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif']
      if (!validTypes.includes(file.type)) {
        setProfileMessage({
          type: 'error',
          text: '❌ Please upload PNG, JPEG, SVG, WEBP, or GIF files only'
        })
        setUploading(false)
        return
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      // Create unique filename
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      
      // Upload directly to user's folder
      const filePath = `${user.id}/${fileName}`
      
      console.log('📁 Uploading to path:', filePath)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        })

      if (uploadError) {
        console.error('Upload error details:', uploadError)
        setProfileMessage({
          type: 'error',
          text: `❌ Upload failed: ${uploadError.message}`
        })
        throw uploadError
      }

      console.log('✅ Upload successful:', uploadData)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      console.log('🔗 Public URL:', publicUrl)

      setProfileForm(prev => ({ ...prev, avatar_url: publicUrl }))
      setImageError(false)
      
      setProfileMessage({
        type: 'success',
        text: '✅ Profile picture uploaded! Save profile to apply.'
      })
      
    } catch (error: any) {
      console.error('Error uploading image:', error)
      setProfileMessage({
        type: 'error',
        text: `❌ Error uploading image: ${error.message || 'Unknown error'}`
      })
      setImageError(true)
    } finally {
      setUploading(false)
      // Reset the file input
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  // Handle profile update - FIXED AGENT UPDATE
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setProfileMessage(null)

    try {
      console.log('Starting profile update...')
      console.log('Profile form data:', profileForm)
      console.log('Agent form data (if agent):', isAgent ? agentForm : 'Not an agent')
      
      // First update the users table
      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          avatar_url: profileForm.avatar_url || null
        })
        .eq('id', user?.id)

      if (userError) {
        console.error('User update error:', userError)
        throw userError
      }

      console.log('✅ User table updated successfully')

      // If user is an agent, update the agents table
      if (isAgent && !agentLoading) {
        console.log('Updating agent data...')
        
        // Prepare agent update data
        const agentUpdateData: any = {
          bio: agentForm.bio?.trim() || null,
          specialties: agentForm.specialties?.length ? agentForm.specialties : null,
          years_experience: agentForm.years_experience || 0,
          total_sales: agentForm.total_sales || 0,
          license_number: agentForm.license_number?.trim() || null,
          license_expiry_date: agentForm.license_expiry_date || null,
          available_for_new_clients: agentForm.available_for_new_clients,
          preferred_contact_method: agentForm.preferred_contact_method || 'email',
          commission_rate: agentForm.commission_rate || 0,
          whatsapp: agentForm.whatsapp?.trim() || null,
          office_phone: agentForm.office_phone?.trim() || null,
          phone: profileForm.phone || agentForm.phone || null, // Use profile phone for consistency
          email: user?.email || null,
          full_name: profileForm.full_name || agentForm.full_name || null,
          updated_at: new Date().toISOString()
        }

        console.log('Agent update data:', agentUpdateData)

        // Try to update first, if fails, try to insert
        const { error: agentError } = await supabase
          .from('agents')
          .update(agentUpdateData)
          .eq('user_id', user?.id)

        if (agentError) {
          console.error('Agent update error, trying to insert:', agentError)
          
          // If agent doesn't exist, insert new record
          const { error: insertError } = await supabase
            .from('agents')
            .insert({
              user_id: user?.id,
              ...agentUpdateData
            })

          if (insertError) {
            console.error('Agent insert error:', insertError)
            throw insertError
          }
          console.log('✅ Agent record created successfully')
        } else {
          console.log('✅ Agent table updated successfully')
        }
      }

      setProfileMessage({
        type: 'success',
        text: '✅ Profile updated successfully! Refreshing page...'
      })
      
      setTimeout(() => {
        window.location.reload()
      }, 1500)
      
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setProfileMessage({
        type: 'error',
        text: `❌ Error updating profile: ${error.message || 'Unknown error'}`
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle password update - FIXED VERSION
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordMessage('')
    setProfileMessage(null)

    try {
      // Validation
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setPasswordMessage('❌ New passwords do not match.')
        setPasswordLoading(false)
        return
      }

      if (passwordForm.newPassword.length < 6) {
        setPasswordMessage('❌ Password must be at least 6 characters long.')
        setPasswordLoading(false)
        return
      }

      console.log('🔄 Starting password update...')

      // Direct password update using Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })

      if (updateError) {
        console.error('Password update error:', updateError)
        
        if (updateError.message.includes('should be different')) {
          setPasswordMessage('❌ New password must be different from current password.')
        } else if (updateError.message.includes('rate limit')) {
          setPasswordMessage('❌ Too many attempts. Please try again later.')
        } else {
          setPasswordMessage(`❌ Error: ${updateError.message}`)
        }
        setPasswordLoading(false)
        return
      }

      console.log('✅ Password updated successfully!')
      
      // Show success message
      setPasswordMessage('✅ Password updated successfully! Logging out in 3 seconds...')
      
      // Clear the form
      setPasswordForm({
        newPassword: '',
        confirmPassword: ''
      })
      
      // Wait 3 seconds to show success message, then logout
      setTimeout(async () => {
        try {
          console.log('🚪 Logging out after password change...')
          
          // Sign out from Supabase
          const { error: signOutError } = await supabase.auth.signOut()
          
          if (signOutError) {
            console.error('Sign out error:', signOutError)
            // Force logout anyway
            localStorage.removeItem('supabase.auth.token')
            window.location.href = '/auth/signin?message=password-changed'
          } else {
            // Redirect to login with success message
            window.location.href = '/auth/signin?message=password-changed-success'
          }
        } catch (logoutError) {
          console.error('Logout error:', logoutError)
          // Force redirect
          window.location.href = '/auth/signin'
        }
      }, 3000)
      
    } catch (error: unknown) {
      console.error('Unexpected error updating password:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setPasswordMessage(`❌ Unexpected error: ${errorMessage}`)
      setPasswordLoading(false)
    }
  }

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    console.log(`Profile form change: ${name} = ${value}`)
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }))
    if (name === 'avatar_url') {
      setImageError(false)
    }
  }

  // Handle agent form changes - FIXED HANDLER
  const handleAgentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    console.log(`Agent form change: ${name} = ${value}, type: ${type}`)
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement
      setAgentForm(prev => ({
        ...prev,
        [name]: checkbox.checked
      }))
    } else if (type === 'number') {
      setAgentForm(prev => ({
        ...prev,
        [name]: value === '' ? 0 : Number(value)
      }))
    } else {
      setAgentForm(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  // Handle specialty selection - FIXED
  const handleSpecialtyChange = (specialtyValue: string) => {
    console.log('Specialty change:', specialtyValue)
    setAgentForm(prev => {
      const currentSpecialties = prev.specialties || []
      const newSpecialties = currentSpecialties.includes(specialtyValue)
        ? currentSpecialties.filter(s => s !== specialtyValue)
        : [...currentSpecialties, specialtyValue]
      
      console.log('New specialties:', newSpecialties)
      return {
        ...prev,
        specialties: newSpecialties
      }
    })
  }

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    // Clear any previous messages when user starts typing
    if (passwordMessage) {
      setPasswordMessage('')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Navigation */}
      <nav className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link href="/dashboard" className="text-white">
              <div className="text-xl font-bold tracking-wider">A-LUXE REALTY</div>
              <div className="text-xs tracking-widest text-gray-300">
                {isAgent ? 'AGENT PROFILE' : 'EDIT PROFILE'}
                {agentLoading && ' (Loading...)'}
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-gray-900">
                  ← Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              {isAgent ? 'Agent Profile Settings' : 'Edit Your Profile'}
            </h1>
            <p className="text-gray-400">
              {isAgent 
                ? 'Manage your professional agent profile and personal settings' 
                : 'Manage your account settings and preferences'
              }
            </p>
            
            {isAgent && !agentLoading && (
              <div className="inline-flex items-center mt-4 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                <Award className="w-4 h-4 text-amber-400 mr-2" />
                <span className="text-amber-300 font-semibold text-sm">Certified Real Estate Agent</span>
              </div>
            )}
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-700 mb-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 text-center font-medium text-lg transition-colors ${
                activeTab === 'profile'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {isAgent ? '👤 Agent & Profile Info' : '👤 Profile Information'}
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-3 text-center font-medium text-lg transition-colors ${
                activeTab === 'password'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              🔒 Change Password
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* Avatar Preview Section */}
                <div className="flex flex-col items-center">
                  <div className="mb-6 text-center">
                    <h3 className="text-lg font-semibold text-white mb-4">Profile Picture Preview</h3>
                    <div className="relative">
                      <Avatar 
                        src={profileForm.avatar_url && !imageError ? profileForm.avatar_url : undefined}
                        name={profileForm.full_name || user?.email}
                        email={user?.email}
                        size={140}
                        className="mb-4"
                      />
                      {profileForm.avatar_url && imageError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-full">
                          <span className="text-red-400 text-sm font-semibold">Image Error</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Upload Section */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="text-center mb-2">
                        <p className="text-sm text-amber-300 mb-1">
                          📁 Upload your profile picture
                        </p>
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                      
                      <div>
                        <Button
                          variant="outline"
                          className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-gray-900 transition-colors"
                          disabled={uploading}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {uploading ? '📤 Uploading...' : '📁 Choose & Upload Photo'}
                        </Button>
                      </div>
                      
                      <p className="text-xs text-gray-400 text-center">
                        Supports: PNG, JPEG, SVG, WEBP, GIF (Max 5MB)
                      </p>
                      
                      {profileForm.avatar_url && (
                        <Button
                          variant="outline"
                          className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-gray-900 mt-2"
                          onClick={() => {
                            setProfileForm(prev => ({ ...prev, avatar_url: '' }))
                            setImageError(false)
                            setProfileMessage({
                              type: 'info',
                              text: '✅ Profile picture removed from form'
                            })
                          }}
                        >
                          🗑️ Remove Current Photo
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleProfileSubmit} className="space-y-8 max-w-2xl mx-auto">
                  {/* Basic Information Section */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white border-b border-gray-700 pb-2">Basic Information</h3>
                    
                    <div>
                      <label className="block text-gray-300 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="full_name"
                        value={profileForm.full_name}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={user?.email}
                        disabled
                        className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-gray-500 text-sm mt-1">Email cannot be changed</p>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    {/* Avatar URL Section */}
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="avatar_url" className="block text-sm font-medium text-white mb-2">
                          Profile Picture URL (or upload above)
                        </label>
                        <input
                          type="url"
                          id="avatar_url"
                          name="avatar_url"
                          value={profileForm.avatar_url}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* AGENT-SPECIFIC FIELDS - Only show if user is an agent */}
                  {isAgent && !agentLoading && (
                    <div className="space-y-6 pt-6 border-t border-gray-700">
                      <h3 className="text-xl font-bold text-white border-b border-gray-700 pb-2">
                        <Briefcase className="inline w-5 h-5 mr-2 text-amber-400" />
                        Professional Information
                      </h3>
                      
                      {/* Bio */}
                      <div>
                        <label className="block text-gray-300 mb-2">Professional Bio</label>
                        <textarea
                          name="bio"
                          value={agentForm.bio || ''}
                          onChange={handleAgentChange}
                          rows={4}
                          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                          placeholder="Tell clients about your experience, expertise, and approach..."
                        />
                        <p className="text-gray-500 text-sm mt-1">This will appear on your public agent profile</p>
                      </div>
                      
                      {/* Specialties */}
                      <div>
                        <label className="block text-gray-300 mb-3">
                          <Target className="inline w-4 h-4 mr-2 text-amber-400" />
                          Specialties
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {SPECIALTY_OPTIONS.map((specialty) => (
                            <label
                              key={specialty.value}
                              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                                agentForm.specialties?.includes(specialty.value)
                                  ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                                  : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={agentForm.specialties?.includes(specialty.value) || false}
                                onChange={() => handleSpecialtyChange(specialty.value)}
                                className="mr-3 h-4 w-4 rounded border-gray-600 bg-gray-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-gray-800"
                              />
                              <span className="text-sm">{specialty.label}</span>
                            </label>
                          ))}
                        </div>
                        <p className="text-gray-500 text-sm mt-2">
                          Selected: {agentForm.specialties?.length || 0} specialties
                        </p>
                      </div>
                      
                      {/* Experience & Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-gray-300 mb-2">Years of Experience</label>
                          <input
                            type="number"
                            name="years_experience"
                            value={agentForm.years_experience || 0}
                            onChange={handleAgentChange}
                            min="0"
                            max="50"
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-300 mb-2">Total Sales</label>
                          <input
                            type="number"
                            name="total_sales"
                            value={agentForm.total_sales || 0}
                            onChange={handleAgentChange}
                            min="0"
                            max="10000"
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-300 mb-2">Commission Rate (%)</label>
                          <input
                            type="number"
                            name="commission_rate"
                            value={agentForm.commission_rate || 0}
                            onChange={handleAgentChange}
                            min="0"
                            max="100"
                            step="0.01"
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                          />
                        </div>
                      </div>
                      
                      {/* License Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 mb-2">
                            <Shield className="inline w-4 h-4 mr-2 text-amber-400" />
                            License Number
                          </label>
                          <input
                            type="text"
                            name="license_number"
                            value={agentForm.license_number || ''}
                            onChange={handleAgentChange}
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                            placeholder="e.g., LREA-123456"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-300 mb-2">
                            <Calendar className="inline w-4 h-4 mr-2 text-amber-400" />
                            License Expiry Date
                          </label>
                          <input
                            type="date"
                            name="license_expiry_date"
                            value={agentForm.license_expiry_date || ''}
                            onChange={handleAgentChange}
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                          />
                        </div>
                      </div>
                      
                      {/* Contact Information */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Contact Preferences</h4>
                        
                        <div>
                          <label className="block text-gray-300 mb-2">Preferred Contact Method</label>
                          <select
                            name="preferred_contact_method"
                            value={agentForm.preferred_contact_method || 'email'}
                            onChange={handleAgentChange}
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                          >
                            <option value="email">📧 Email</option>
                            <option value="phone">📞 Phone</option>
                            <option value="whatsapp">💬 WhatsApp</option>
                          </select>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-300 mb-2">
                              <MessageCircle className="inline w-4 h-4 mr-2 text-amber-400" />
                              WhatsApp Number
                            </label>
                            <input
                              type="tel"
                              name="whatsapp"
                              value={agentForm.whatsapp || ''}
                              onChange={handleAgentChange}
                              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                              placeholder="+254 700 123 456"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-gray-300 mb-2">
                              <Phone className="inline w-4 h-4 mr-2 text-amber-400" />
                              Office Phone
                            </label>
                            <input
                              type="tel"
                              name="office_phone"
                              value={agentForm.office_phone || ''}
                              onChange={handleAgentChange}
                              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                              placeholder="+254 20 123 4567"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Availability */}
                      <div className="flex items-center p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                        <input
                          type="checkbox"
                          id="available_for_new_clients"
                          name="available_for_new_clients"
                          checked={agentForm.available_for_new_clients || false}
                          onChange={handleAgentChange}
                          className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-gray-800"
                        />
                        <label htmlFor="available_for_new_clients" className="ml-3 text-gray-300">
                          <span className="font-medium">Available for new clients</span>
                          <p className="text-sm text-gray-400">When checked, you'll appear as available to potential clients</p>
                        </label>
                      </div>
                    </div>
                  )}
                  
                  {/* Profile Message Display */}
                  {profileMessage && (
                    <div className={`p-3 rounded-lg ${
                      profileMessage.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                        : profileMessage.type === 'error'
                        ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                        : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                    }`}>
                      {profileMessage.text}
                    </div>
                  )}

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25"
                    >
                      {loading ? 'Saving...' : '💾 Save Profile Changes'}
                    </Button>
                    <p className="text-gray-500 text-sm mt-2 text-center">
                      {isAgent ? 'Saves both personal info and agent profile' : 'Saves personal information'}
                    </p>
                  </div>
                </form>
              </div>
            )}

            {/* PASSWORD TAB - FIXED VERSION */}
            {activeTab === 'password' && (
              <div className="max-w-2xl mx-auto">
                {/* Security Info */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-8">
                  <div className="flex items-start">
                    <div className="text-blue-400 mr-3 mt-1">🔒</div>
                    <div>
                      <p className="text-blue-400 font-semibold">Password Security</p>
                      <ul className="text-blue-300 text-sm mt-2 space-y-1">
                        <li>• New password must be different from current password</li>
                        <li>• Use at least 6 characters</li>
                        <li>• You will be automatically logged out after changing password</li>
                        <li>• You must login again with your new password</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Password Message Display - FIXED VISIBILITY */}
                {passwordMessage && (
                  <div className={`p-4 rounded-lg mb-6 ${passwordMessage.includes('✅') 
                    ? 'bg-green-500/20 border border-green-500/40 text-green-300' 
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}>
                    <div className="flex items-center">
                      {passwordMessage.includes('✅') ? (
                        <>
                          <div className="animate-spin mr-2">🔄</div>
                          <span>{passwordMessage}</span>
                        </>
                      ) : (
                        <>
                          <span className="mr-2">❌</span>
                          <span>{passwordMessage}</span>
                        </>
                      )}
                    </div>
                    
                    {passwordMessage.includes('✅') && passwordMessage.includes('Logging out') && (
                      <div className="mt-2 pt-2 border-t border-green-500/30">
                        <div className="flex items-center text-green-200 text-sm">
                          <div className="w-full bg-green-500/20 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-green-400 h-full rounded-full" 
                              style={{ animation: 'progress 3s ease-in-out forwards' }}
                            ></div>
                          </div>
                          <span className="ml-2">3s</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Password Form */}
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-white mb-2">
                      New Password *
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                      placeholder="Enter your new password"
                      required
                      minLength={6}
                      disabled={passwordLoading && passwordMessage.includes('✅')}
                    />
                    {passwordForm.newPassword.length > 0 && passwordForm.newPassword.length < 6 && (
                      <p className="text-amber-400 text-xs mt-1">⚠️ Password must be at least 6 characters</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                      placeholder="Confirm your new password"
                      required
                      minLength={6}
                      disabled={passwordLoading && passwordMessage.includes('✅')}
                    />
                    {passwordForm.confirmPassword.length > 0 && 
                     passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">⚠️ Passwords do not match</p>
                    )}
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={passwordLoading || 
                        passwordForm.newPassword.length < 6 ||
                        passwordForm.newPassword !== passwordForm.confirmPassword ||
                        passwordMessage.includes('✅') // Disable if success message showing
                      }
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {passwordLoading ? (
                        passwordMessage.includes('✅') ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Logging out...
                          </>
                        ) : (
                          <>
                            <span className="animate-spin mr-2">🔄</span>
                            Updating Password...
                          </>
                        )
                      ) : '🔐 Update Password'}
                    </Button>
                  </div>
                </form>

                {/* Additional Info */}
                <div className="mt-8 p-4 bg-gray-700/30 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <span className="text-amber-400 font-semibold">Note:</span> After changing your password, you will be automatically logged out and redirected to the login page. You must login again with your new password.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Back to Dashboard */}
          <div className="mt-8 text-center">
            <Link href="/dashboard">
              <Button 
                variant="outline" 
                className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-gray-900"
              >
                ← Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Add CSS for progress animation */}
      <style jsx global>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  )
}