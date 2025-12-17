// app/dashboard/page.tsx - FULLY FIXED FOR YOUR TABLE STRUCTURE
'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase-optimized'
import Image from 'next/image'

const supabase = getSupabase()

interface AgentStats {
  assignedProperties: number
  phone: string
  email: string
  full_name: string
  profile_picture?: string
}

interface UserProfile {
  full_name: string
  email: string
  phone?: string
  avatar_url?: string
  role: string
  created_at: string
}

interface CompanySettings {
  office_numbers?: string[]
  company_name?: string
  company_email?: string
  company_address?: string
  phone?: string
  whatsapp?: string
}

interface ListedProperty {
  id: string
  title: string
  price: number
  location: string
  status: string
  property_type: string
  created_at: string
}

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    activeProperties: 0,
    totalAgents: 0
  })
  const [agentStats, setAgentStats] = useState<AgentStats | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [companySettings, setCompanySettings] = useState<CompanySettings>({})
  const [listedProperties, setListedProperties] = useState<ListedProperty[]>([])
  const [loading, setLoading] = useState(false)
  const [agentLoading, setAgentLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [propertiesLoading, setPropertiesLoading] = useState(false)

  const fetchUserProfile = async () => {
    if (!user) return
    
    setProfileLoading(true)
    try {
      const { data: profileData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setUserProfile({
        full_name: profileData.full_name || user.full_name,
        email: profileData.email || user.email,
        phone: profileData.phone || user.phone,
        avatar_url: profileData.avatar_url || user.avatar_url,
        role: profileData.role || user.role,
        created_at: profileData.created_at || user.created_at
      })
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUserProfile({
        full_name: user.full_name || 'User',
        email: user.email || '',
        phone: user.phone || undefined,
        avatar_url: user.avatar_url || undefined,
        role: user.role || 'client',
        created_at: user.created_at || new Date().toISOString()
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const fetchCompanySettings = async () => {
    setSettingsLoading(true)
    try {
      console.log('Fetching company settings...')
      
      // Your table has 'contact_info' not 'company_info'
      const { data: settingsData, error } = await supabase
        .from('company_settings')
        .select('setting_key, setting_value')
        .eq('setting_key', 'contact_info') // CHANGED TO MATCH YOUR TABLE
        .single()

      console.log('Company settings query result:', { settingsData, error })

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No company settings found in database')
          setCompanySettings({})
        } else {
          console.error('Error fetching company settings:', error)
          setCompanySettings({})
        }
        return
      }

      if (settingsData?.setting_value) {
        const parsedSettings = settingsData.setting_value
        
        // Your JSON structure has 'phone' and 'whatsapp' fields
        const officeNumbers = []
        if (parsedSettings.phone) officeNumbers.push(parsedSettings.phone)
        if (parsedSettings.whatsapp) officeNumbers.push(parsedSettings.whatsapp)
        
        setCompanySettings({
          office_numbers: officeNumbers,
          company_name: parsedSettings.company_name || 'A-LUXE REALTY',
          company_email: parsedSettings.email || 'info@aluxerealty.com',
          company_address: parsedSettings.address || 'Nairobi, Kenya',
          phone: parsedSettings.phone,
          whatsapp: parsedSettings.whatsapp
        })
      } else {
        console.log('No valid company settings found')
        setCompanySettings({})
      }
    } catch (error) {
      console.error('Error fetching company settings:', error)
      setCompanySettings({})
    } finally {
      setSettingsLoading(false)
    }
  }

  const fetchPropertiesTable = async () => {
    setPropertiesLoading(true)
    try {
      const { data: propertiesData, error } = await supabase
        .from('properties')
        .select('id, title, price, address, city, state, country, zip_code, status, property_type, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          code: error.code,
          details: error.details
        })
        throw error
      }

      // Transform data to create location string
      const transformedData = (propertiesData || []).map((property: any) => {
        const locationParts = [
          property.address,
          property.city,
          property.state,
          property.zip_code,
          property.country
        ].filter(Boolean)
        
        return {
          id: property.id,
          title: property.title,
          price: property.price,
          property_type: property.property_type,
          status: property.status,
          created_at: property.created_at,
          location: locationParts.join(', ')
        }
      })

      setListedProperties(transformedData)
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setPropertiesLoading(false)
    }
  }

  const fetchStats = async () => {
    setLoading(true)
    try {
      console.log('Fetching stats for user role:', user?.role)
      
      // Get total properties (available to all users)
      const { count: totalPropertyCount, error: totalPropertyError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })

      if (totalPropertyError) {
        console.error('Error fetching total properties:', totalPropertyError)
      }

      // Only fetch admin-specific stats for admin users
      if (user?.role === 'admin') {
        // Get total users
        const { count: userCount, error: userError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })

        if (userError) console.error('Error fetching users:', userError)

        // Get active properties
        const { count: activePropertyCount, error: activePropertyError } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')

        if (activePropertyError) console.error('Error fetching active properties:', activePropertyError)

        // Get total agents
        const { count: agentCount, error: agentError } = await supabase
          .from('agents')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)

        if (agentError) console.error('Error fetching agents:', agentError)

        setStats({
          totalUsers: userCount || 0,
          totalProperties: totalPropertyCount || 0,
          activeProperties: activePropertyCount || 0,
          totalAgents: agentCount || 0
        })
      } else {
        // For non-admin users, only set total properties
        setStats(prev => ({
          ...prev,
          totalProperties: totalPropertyCount || 0
        }))
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAgentStats = async () => {
    if (user?.role !== 'agent') return
    
    setAgentLoading(true)
    try {
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (agentError) throw agentError

      if (agentData) {
        const { count: assignedProperties, error: propertiesError } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('agent_id', agentData.id)

        if (propertiesError) throw propertiesError

        setAgentStats({
          assignedProperties: assignedProperties || 0,
          phone: user.phone || agentData.phone || 'Not set',
          email: user.email || '',
          full_name: user.full_name || agentData.full_name || '',
          profile_picture: agentData.profile_picture
        })
      }
    } catch (error) {
      console.error('Error fetching agent stats:', error)
    } finally {
      setAgentLoading(false)
    }
  }

  useEffect(() => {
    const initializeDashboard = async () => {
      await fetchUserProfile()
      await fetchCompanySettings()
      await fetchStats() // Call fetchStats for ALL users
      
      if (user?.role === 'admin') {
        await fetchPropertiesTable()
      } else if (user?.role === 'agent') {
        await fetchAgentStats()
        await fetchPropertiesTable()
      }
    }

    initializeDashboard()
  }, [user])

  const getProfileImage = () => {
    if (agentStats?.profile_picture) {
      return agentStats.profile_picture
    }
    if (userProfile?.avatar_url) {
      return userProfile.avatar_url
    }
    return null
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Navigation */}
      <nav className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-white">
              <div className="text-xl font-bold tracking-wider">A-LUXE REALTY</div>
              <div className="text-xs tracking-widest text-gray-300">
                {user?.role === 'admin' ? 'ADMIN DASHBOARD' : 
                 user?.role === 'agent' ? 'AGENT DASHBOARD' : 'CLIENT DASHBOARD'}
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-600">
                  {getProfileImage() ? (
                    <Image
                      src={getProfileImage()!}
                      alt="Profile"
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs">
                      {getInitials(userProfile?.full_name || 'User')}
                    </div>
                  )}
                </div>
                <span className="text-gray-300">
                  Welcome, {userProfile?.full_name || user?.full_name} ({userProfile?.role || user?.role})
                </span>
              </div>
              <Link href="/">
                <Button variant="outline" className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-gray-900">
                  🏠 Website
                </Button>
              </Link>
              <Button 
                onClick={signOut}
                variant="outline" 
                className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-gray-900"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            {user?.role === 'admin' ? 'Admin Dashboard' : 
             user?.role === 'agent' ? 'Agent Dashboard' : 'Client Dashboard'}
          </h1>
          <p className="text-gray-400">
            {user?.role === 'admin' ? 'Manage your real estate platform' : 
             user?.role === 'agent' ? 'Manage your property listings and clients' : 
             'Welcome to A-LUXE REALTY - Your luxury property experts'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Profile Card with Image */}
          <div className="group bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:scale-105">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-500/30 transition-colors">
                <span className="text-blue-400">👤</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Your Profile</h3>
            </div>
            
            {profileLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-400">Loading profile...</p>
              </div>
            ) : (
              <>
                {/* Profile Image */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-700 mb-4 group-hover:border-blue-500/50 transition-colors">
                    {getProfileImage() ? (
                      <Image
                        src={getProfileImage()!}
                        alt="Profile"
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-2xl">
                        {getInitials(userProfile?.full_name || 'User')}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">{userProfile?.full_name}</h2>
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-semibold capitalize">
                    {userProfile?.role}
                  </span>
                </div>

                {/* Profile Details */}
                <div className="space-y-3 text-gray-300 mb-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg group-hover:bg-gray-700/70 transition-colors">
                    <div className="w-8 h-8 bg-gray-600/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-400">📧</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mb-1">Email</p>
                      <p className="text-white truncate">{userProfile?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg group-hover:bg-gray-700/70 transition-colors">
                    <div className="w-8 h-8 bg-gray-600/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-400">📱</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mb-1">Phone</p>
                      <p className="text-white">{userProfile?.phone || 'Not set'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg group-hover:bg-gray-700/70 transition-colors">
                    <div className="w-8 h-8 bg-gray-600/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-400">📅</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mb-1">Member since</p>
                      <p className="text-white">
                        {new Date(userProfile?.created_at || '').toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Link href="/dashboard/profile">
                  <Button 
                    variant="outline" 
                    className="w-full border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-gray-900 transition-all duration-300 group/profile-btn"
                  >
                    <span className="group-hover/profile-btn:translate-x-1 transition-transform">✏️ Edit Profile</span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="group bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 hover:border-amber-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 hover:scale-105">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-amber-500/30 transition-colors">
                <span className="text-amber-400">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <Link href="/properties">
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 group/browse">
                  <span className="group-hover/browse:translate-x-1 transition-transform">🏠 Browse Properties</span>
                </Button>
              </Link>
              
              {(user?.role === 'agent' || user?.role === 'admin') && (
                <Link href="/admin/properties/create">
                  <Button variant="outline" className="w-full border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-gray-900 transition-all duration-300 group/create">
                    <span className="group-hover/create:translate-x-1 transition-transform">➕ Create Property</span>
                  </Button>
                </Link>
              )}
              
              {user?.role === 'agent' && (
                <Link href="/agents/my-properties">
                  <Button variant="outline" className="w-full border-green-400 text-green-400 hover:bg-green-400 hover:text-gray-900 transition-all duration-300 group/myprop">
                    <span className="group-hover/myprop:translate-x-1 transition-transform">🏠 My Properties</span>
                  </Button>
                </Link>
              )}
              
              {user?.role === 'admin' && (
                <>
                  <Link href="/admin/users">
                    <Button variant="outline" className="w-full border-green-400 text-green-400 hover:bg-green-400 hover:text-gray-900 transition-all duration-300 group/users">
                      <span className="group-hover/users:translate-x-1 transition-transform">👥 Manage Users</span>
                    </Button>
                  </Link>
                  <Link href="/admin/properties">
                    <Button variant="outline" className="w-full border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-gray-900 transition-all duration-300 group/properties">
                      <span className="group-hover/properties:translate-x-1 transition-transform">🏠 All Properties</span>
                    </Button>
                  </Link>
                  <Link href="/admin/agents">
                    <Button variant="outline" className="w-full border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-gray-900 transition-all duration-300 group/agents">
                      <span className="group-hover/agents:translate-x-1 transition-transform">👨‍💼 Manage Agents</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/settings">
                    <Button variant="outline" className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-gray-900 transition-all duration-300 group/settings">
                      <span className="group-hover/settings:translate-x-1 transition-transform">⚙️ Company Settings</span>
                    </Button>
                  </Link>
                  <Link href="/admin/properties/bulk-delete">
                    <Button variant="outline" className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white transition-all duration-300 group/delete">
                      <span className="group-hover/delete:translate-x-1 transition-transform">🗑️ Bulk Delete</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Client Dashboard - Contact Info Card */}
          {(!user?.role || (user?.role !== 'admin' && user?.role !== 'agent')) && (
            <div className="group bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 hover:border-green-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-500/30 transition-colors">
                  <span className="text-green-400">🏢</span>
                </div>
                <h3 className="text-xl font-semibold text-white">Contact Our Agents</h3>
              </div>
              <div className="space-y-3">
                {settingsLoading ? (
                  <div className="p-3 bg-gray-700/50 rounded-lg">
                    <p className="text-gray-400">Loading contact info...</p>
                  </div>
                ) : companySettings.office_numbers && companySettings.office_numbers.length > 0 ? (
                  <div className="p-3 bg-gray-700/50 rounded-lg group-hover:bg-gray-700/70 transition-colors">
                    <p className="text-gray-300 text-sm mb-2">Contact Numbers:</p>
                    {companySettings.office_numbers.map((number, index) => (
                      <p key={index} className="text-white font-semibold mb-1">📞 {number}</p>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-700/50 rounded-lg group-hover:bg-gray-700/70 transition-colors">
                    <p className="text-gray-300 text-sm mb-2">Contact Numbers:</p>
                    <p className="text-amber-400 text-sm">Contact details not set</p>
                    <p className="text-gray-400 text-xs mt-1">Admin can set these in Company Settings</p>
                  </div>
                )}
                <div className="p-3 bg-gray-700/50 rounded-lg group-hover:bg-gray-700/70 transition-colors">
                  <p className="text-gray-300 text-sm mb-2">Total Properties Listed:</p>
                  <p className="text-amber-400 font-bold text-xl">
                    {loading ? (
                      <span className="text-gray-400">Loading...</span>
                    ) : (
                      `${stats.totalProperties}+ Luxury Properties`
                    )}
                  </p>
                </div>
                <div className="p-3 bg-gray-700/50 rounded-lg group-hover:bg-gray-700/70 transition-colors">
                  <p className="text-gray-300 text-sm">Ready to find your dream home? Contact our expert agents today!</p>
                </div>
              </div>
            </div>
          )}

          {/* Agent Dashboard - Performance Card */}
          {user?.role === 'agent' && (
            <div className="group bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 hover:border-green-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-500/30 transition-colors">
                  <span className="text-green-400">🎯</span>
                </div>
                <h3 className="text-xl font-semibold text-white">My Performance</h3>
              </div>
              <div className="space-y-3">
                {agentLoading ? (
                  <div className="text-center text-gray-400 py-4">Loading stats...</div>
                ) : agentStats ? (
                  <>
                    <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg group-hover:bg-gray-700/70 transition-colors">
                      <span className="text-gray-300">Properties Assigned</span>
                      <span className="text-amber-400 font-semibold text-lg">{agentStats.assignedProperties}</span>
                    </div>
                    <div className="p-3 bg-gray-700/50 rounded-lg group-hover:bg-gray-700/70 transition-colors">
                      <p className="text-gray-300 text-sm mb-1">Your Contact:</p>
                      <p className="text-white font-semibold">📞 {agentStats.phone}</p>
                      <p className="text-white text-sm">✉️ {agentStats.email}</p>
                    </div>
                    {settingsLoading ? (
                      <div className="p-3 bg-gray-700/50 rounded-lg">
                        <p className="text-gray-400">Loading office info...</p>
                      </div>
                    ) : companySettings.office_numbers && companySettings.office_numbers.length > 0 ? (
                      <div className="p-3 bg-gray-700/50 rounded-lg group-hover:bg-gray-700/70 transition-colors">
                        <p className="text-gray-300 text-sm mb-1">Office Contact:</p>
                        {companySettings.office_numbers.slice(0, 2).map((number, index) => (
                          <p key={index} className="text-white text-sm mb-1">📞 {number}</p>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-700/50 rounded-lg group-hover:bg-gray-700/70 transition-colors">
                        <p className="text-gray-300 text-sm mb-1">Office Contact:</p>
                        <p className="text-amber-400 text-sm">Contact details not set</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-gray-400 py-4">No agent profile found</div>
                )}
              </div>
            </div>
          )}

          {/* Admin Dashboard - Platform Stats */}
          {user?.role === 'admin' && (
            <div className="group bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 hover:border-green-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-500/30 transition-colors">
                  <span className="text-green-400">📊</span>
                </div>
                <h3 className="text-xl font-semibold text-white">Platform Stats</h3>
              </div>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center text-gray-400 py-4">Loading stats...</div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg group-hover:bg-gray-700/70 transition-colors">
                      <span className="text-gray-300">Total Users</span>
                      <span className="text-amber-400 font-semibold">{stats.totalUsers}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg group-hover:bg-gray-700/70 transition-colors">
                      <span className="text-gray-300">Total Properties</span>
                      <span className="text-green-400 font-semibold">{stats.totalProperties}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg group-hover:bg-gray-700/70 transition-colors">
                      <span className="text-gray-300">Active Properties</span>
                      <span className="text-blue-400 font-semibold">{stats.activeProperties}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg group-hover:bg-gray-700/70 transition-colors">
                      <span className="text-gray-300">Active Agents</span>
                      <span className="text-purple-400 font-semibold">{stats.totalAgents}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Listed Properties Table - For Admin and Agent */}
          {(user?.role === 'admin' || user?.role === 'agent') && (
            <div className="md:col-span-2 lg:col-span-3 group bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-500/30 transition-colors">
                  <span className="text-blue-400">📋</span>
                </div>
                <h3 className="text-xl font-semibold text-white">Recently Listed Properties</h3>
              </div>
              
              {propertiesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading properties...</p>
                </div>
              ) : listedProperties.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-700/50">
                        <th className="py-3 px-4 text-left text-gray-300 font-semibold">Title</th>
                        <th className="py-3 px-4 text-left text-gray-300 font-semibold">Type</th>
                        <th className="py-3 px-4 text-left text-gray-300 font-semibold">Location</th>
                        <th className="py-3 px-4 text-left text-gray-300 font-semibold">Price</th>
                        <th className="py-3 px-4 text-left text-gray-300 font-semibold">Status</th>
                        <th className="py-3 px-4 text-left text-gray-300 font-semibold">Listed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {listedProperties.map((property) => (
                        <tr 
                          key={property.id}
                          className="hover:bg-gray-700/30 transition-colors cursor-pointer"
                          onClick={() => window.location.href = `/properties/${property.id}`}
                        >
                          <td className="py-3 px-4 text-white font-medium">{property.title}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-gray-700 rounded text-sm text-gray-300">
                              {property.property_type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-300">{property.location}</td>
                          <td className="py-3 px-4 text-amber-400 font-semibold">
                            {formatCurrency(property.price)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-sm font-semibold ${
                              property.status === 'active' || property.status === 'available'
                                ? 'bg-green-500/20 text-green-400' 
                                : property.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-400 text-sm">
                            {new Date(property.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No properties listed yet.</p>
                  <Link href="/admin/properties/create">
                    <Button variant="outline" className="mt-4 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-gray-900">
                      + Create First Property
                    </Button>
                  </Link>
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                <Link href="/admin/properties">
                  <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-gray-900">
                    View All Properties →
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}