'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase-optimized'
const supabase = getSupabase()
import { Button } from '@/components/ui/button'
import { MediaGallery } from '@/components/properties/media-gallery'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, Video, Eye, MessageCircle, Check } from 'lucide-react'

// Define proper TypeScript interfaces
interface Agent {
  id: string
  full_name: string
  email: string
  phone: string | null
  whatsapp?: string | null
  bio?: string
  specialties?: string[]
  years_experience?: number
  rating?: number
}

interface CompleteProperty {
  id: string
  title: string
  description: string
  price: number
  property_type: string
  status: string
  bedrooms?: number
  bathrooms?: number
  square_feet?: number
  lot_size?: number
  year_built?: number
  address: string
  city: string
  state?: string
  zip_code?: string
  neighborhood?: string
  country?: string
  agent_id?: string
  created_by: string
  created_at: string
  updated_at: string
  images?: string[]
  video_url?: string
  virtual_tour_url?: string
  thumbnail_image?: string
  property_videos?: string[]
}

// Available days for scheduling
const AVAILABLE_DAYS = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' }
]

// Available time slots
const AVAILABLE_TIMES = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM'
]

export default function PropertyDetailPage() {
  const params = useParams()
  const propertyId = params.id as string
  
  const [property, setProperty] = useState<CompleteProperty | null>(null)
  const [loading, setLoading] = useState(true)
  const [similarProperties, setSimilarProperties] = useState<CompleteProperty[]>([])
  const [agent, setAgent] = useState<Agent | null>(null)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  
  // Schedule viewing state
  const [selectedDay, setSelectedDay] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [isScheduling, setIsScheduling] = useState(false)

  useEffect(() => {
    async function loadPropertyData() {
      try {
        // Load the specific property
        const { data: propertyData, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', propertyId)
          .single()

        if (error) {
          console.error('Error loading property:', error)
          return
        }

        if (propertyData) {
          setProperty(propertyData as CompleteProperty)

          // Load agent information if property has an agent
          if (propertyData.agent_id) {
            console.log('DEBUG: Fetching agent for property with agent_id:', propertyData.agent_id)
            
            try {
              // First try: Query agents table and join with users
              const { data: agentData, error: agentError } = await supabase
                .from('agents')
                .select(`
                  id,
                  user_id,
                  whatsapp,
                  bio,
                  specialties,
                  years_experience,
                  rating,
                  users!inner (
                    id,
                    full_name,
                    email,
                    phone
                  )
                `)
                .eq('id', propertyData.agent_id)
                .single()

              if (agentError) {
                console.log('DEBUG: Agent join query failed (this is normal if agent_id points to users table)')
                
                // Second try: Maybe agent_id directly references users table
                const { data: userData, error: userError } = await supabase
                  .from('users')
                  .select('id, full_name, email, phone, whatsapp, role')
                  .eq('id', propertyData.agent_id)
                  .eq('role', 'agent')
                  .single()

                if (userError) {
                  // This is not an error - just means no user found with that ID as agent
                  console.log('DEBUG: No user found as agent with that ID')
                } else if (userData) {
                  console.log('DEBUG: Found user as agent directly:', userData)
                  // If agent_id directly points to users table
                  setAgent({
                    id: userData.id,
                    full_name: userData.full_name,
                    email: userData.email,
                    phone: userData.phone,
                    whatsapp: userData.whatsapp || null,
                  })
                }
              } else if (agentData) {
                console.log('DEBUG: Found agent via join query:', agentData)
                
                // Extract user info from the joined data
                const userData = agentData.users
                if (userData) {
                  setAgent({
                    id: userData.id,
                    full_name: userData.full_name,
                    email: userData.email,
                    phone: userData.phone,
                    whatsapp: agentData.whatsapp || null,
                    bio: agentData.bio,
                    specialties: agentData.specialties,
                    years_experience: agentData.years_experience,
                    rating: agentData.rating
                  })
                }
              }
            } catch (error) {
              console.log('DEBUG: Error in agent fetching (non-critical):', error)
            }
          } else {
            console.log('DEBUG: No agent_id found for this property')
          }

          // Load similar properties (same city, different property)
          const { data: similarData } = await supabase
            .from('properties')
            .select('*')
            .eq('city', propertyData.city)
            .neq('id', propertyId)
            .limit(3)

          setSimilarProperties((similarData as CompleteProperty[]) || [])
        }
      } catch (error) {
        console.error('Unexpected error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPropertyData()

    // Check current user
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser({
            id: user.id,
            email: user.email
          })
        }
      } catch (error) {
        console.error('Error checking user:', error)
      }
    }
    
    checkUser()
  }, [propertyId])

  // Handler functions for agent contact - ALWAYS ACTIVE NOW
  const handleCallAgent = () => {
    if (agent?.phone) {
      window.open(`tel:${agent.phone}`)
    } else {
      // If no phone, show helpful message
      if (agent) {
        alert(`Agent Contact Information:\n\nName: ${agent.full_name}\nEmail: ${agent.email || 'Not available'}\nPhone: ${agent.phone || 'Not available'}\nWhatsApp: ${agent.whatsapp || 'Not available'}\n\nPlease use email or WhatsApp.`)
      } else {
        alert('This property is not currently assigned to a specific agent. Please contact our main office for assistance.')
      }
    }
  }

  const handleEmailAgent = () => {
    if (agent?.email) {
      const subject = `Inquiry about ${property?.title}`
      const body = `Hello ${agent.full_name},\n\nI'm interested in the property "${property?.title}" and would like to schedule a viewing or get more information.\n\nBest regards,\n[Your Name]`
      window.open(`mailto:${agent.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
    } else {
      // If no email, show helpful message
      if (agent) {
        alert(`Agent Contact Information:\n\nName: ${agent.full_name}\nPhone: ${agent.phone || 'Not available'}\nEmail: ${agent.email || 'Not available'}\nWhatsApp: ${agent.whatsapp || 'Not available'}\n\nPlease call or use WhatsApp.`)
      } else {
        alert('This property is not currently assigned to a specific agent. Please contact our main office for assistance.')
      }
    }
  }

  // WhatsApp handler
  const handleWhatsAppAgent = () => {
    if (agent?.whatsapp) {
      const message = `Hello ${agent.full_name}, I'm interested in the property "${property?.title}" and would like more information.`
      const whatsappNumber = agent.whatsapp.replace(/[^0-9]/g, '')
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank')
    } else if (agent?.phone) {
      // Fallback to regular phone number
      const message = `Hello ${agent.full_name}, I'm interested in the property "${property?.title}" and would like more information.`
      const phoneNumber = agent.phone.replace(/[^0-9]/g, '')
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
    } else {
      // If no WhatsApp or phone, show helpful message
      if (agent) {
        alert(`Agent Contact Information:\n\nName: ${agent.full_name}\nPhone: ${agent.phone || 'Not available'}\nWhatsApp: ${agent.whatsapp || 'Not available'}\nEmail: ${agent.email || 'Not available'}\n\nPlease use email instead.`)
      } else {
        alert('This property is not currently assigned to a specific agent. Please contact our main office for assistance.')
      }
    }
  }

  // Schedule Physical Viewing handler
  const handleSchedulePhysicalViewing = () => {
    if (!selectedDay || !selectedTime) {
      alert('Please select both a day and time for your viewing appointment.')
      return
    }

    if (agent?.email) {
      const subject = `Physical Viewing Request - ${property?.title}`
      const body = `Dear ${agent.full_name},\n\nI would like to schedule a physical viewing for the property:\n\nProperty: ${property?.title}\nAddress: ${property?.address}, ${property?.city}\nPrice: ${property ? formatPrice(property.price) : 'N/A'}\n\nPreferred Schedule:\n📅 Day: ${selectedDay}\n⏰ Time: ${selectedTime}\n\nPlease confirm if this time slot is available or suggest an alternative.\n\nBest regards,\n[Your Name]\n[Your Phone Number]`
      window.open(`mailto:${agent.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
      setIsScheduling(false)
      setSelectedDay('')
      setSelectedTime('')
    } else {
      alert('No agent assigned to this property. Please contact our main office for scheduling.')
    }
  }

  // Schedule Virtual Viewing handler
  const handleScheduleVirtualViewing = () => {
    if (!selectedDay || !selectedTime) {
      alert('Please select both a day and time for your virtual viewing appointment.')
      return
    }

    if (agent?.email) {
      const subject = `Virtual Tour Request - ${property?.title}`
      const body = `Dear ${agent.full_name},\n\nI would like to schedule a virtual viewing/tour for the property:\n\nProperty: ${property?.title}\nAddress: ${property?.address}, ${property?.city}\nPrice: ${property ? formatPrice(property.price) : 'N/A'}\n\nPreferred Schedule:\n📅 Day: ${selectedDay}\n⏰ Time: ${selectedTime}\n\nI prefer to have a virtual tour via video call.\n\nBest regards,\n[Your Name]\n[Your Phone Number]`
      window.open(`mailto:${agent.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
      setIsScheduling(false)
      setSelectedDay('')
      setSelectedTime('')
    } else {
      alert('No agent assigned to this property. Please contact our main office for scheduling.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-400 text-lg">Loading luxury property...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏡</div>
          <h1 className="text-2xl font-bold text-white mb-2">Property Not Found</h1>
          <p className="text-gray-400 mb-6">The property you're looking for doesn't exist or has been removed.</p>
          <Link href="/properties">
            <Button className="bg-amber-500 hover:bg-amber-600">
              Browse All Properties
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="text-white">
              <div className="text-xl font-bold tracking-wider">A-LUXE REALTY</div>
              <div className="text-xs tracking-widest text-gray-300">INVEST SMART. LIVE LUXE.</div>
            </Link>
            
            <div className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-300 hover:text-amber-400 transition-colors">Home</Link>
              <Link href="/properties" className="text-amber-400 font-semibold">Properties</Link>
              <Link href="/agents" className="text-gray-300 hover:text-amber-400 transition-colors">Agents</Link>
              <Link href="/about" className="text-gray-300 hover:text-amber-400 transition-colors">About</Link>
              <Link href="/contact" className="text-gray-300 hover:text-amber-400 transition-colors">Contact</Link>
            </div>
            
            <Button variant="outline" className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-gray-900">
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Property Header */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <span>›</span>
            <Link href="/properties" className="hover:text-amber-400 transition-colors">Properties</Link>
            <span>›</span>
            <span className="text-amber-400">{property.title}</span>
          </div>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{property.title}</h1>
              <div className="flex items-center space-x-6 text-gray-300">
                <span className="flex items-center">
                  📍 {property.city}, {property.state}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  property.status === 'available' ? 'bg-green-500 text-white' :
                  property.status === 'sold' ? 'bg-red-500 text-white' :
                  'bg-yellow-500 text-white'
                }`}>
                  {property.status.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-3xl md:text-4xl font-bold text-amber-400 mb-2">
                {formatPrice(property.price)}
              </p>
              <p className="text-gray-400">Asking Price</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2">
            {/* Enhanced Media Gallery */}
            <MediaGallery
              images={property.images || []}
              videos={(() => {
                if (property.video_url) {
                  return [{ url: property.video_url, title: `${property.title} - Video Tour` }];
                }
                
                if (property.property_videos && property.property_videos.length > 0) {
                  return property.property_videos.map(videoUrl => ({
                    url: videoUrl,
                    title: `${property.title} - Video Tour`
                  }));
                }
                
                return [];
              })()}
              virtualTourUrl={property.virtual_tour_url}
              title={property.title}
            />

            {/* Property Details with Emojis */}
            <div className="bg-gray-800 rounded-2xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-white mb-6">Property Details</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🛏️</div>
                  <div className="text-2xl font-bold text-amber-400 mb-1">{property.bedrooms || 'N/A'}</div>
                  <div className="text-gray-400 text-sm">Bedrooms</div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🚿</div>
                  <div className="text-2xl font-bold text-amber-400 mb-1">{property.bathrooms || 'N/A'}</div>
                  <div className="text-gray-400 text-sm">Bathrooms</div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📐</div>
                  <div className="text-2xl font-bold text-amber-400 mb-1">{property.square_feet?.toLocaleString() || 'N/A'}</div>
                  <div className="text-gray-400 text-sm">Square Feet</div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏠</div>
                  <div className="text-2xl font-bold text-amber-400 mb-1 capitalize">{property.property_type}</div>
                  <div className="text-gray-400 text-sm">Type</div>
                </div>
              </div>

              {property.description && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Description</h3>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">{property.description}</p>
                </div>
              )}
            </div>

            {/* Location Section - ADDED BACK */}
            <div className="bg-gray-800 rounded-2xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span>📍</span>
                Location & Address
              </h2>
              
              <div className="space-y-4">
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-amber-400 mb-2">Full Address</h3>
                  <div className="space-y-1 text-gray-300">
                    <p className="text-lg">{property.address}</p>
                    <p>{property.city}, {property.state} {property.zip_code}</p>
                    {property.neighborhood && (
                      <p className="text-amber-300 mt-2">
                        <span className="font-medium">Neighborhood:</span> {property.neighborhood}
                      </p>
                    )}
                    {property.country && (
                      <p>
                        <span className="font-medium">Country:</span> {property.country}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.lot_size && (
                    <div className="bg-gray-900/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-amber-400">🌳</span>
                        <h4 className="font-semibold text-white">Lot Size</h4>
                      </div>
                      <p className="text-2xl font-bold text-amber-400">{property.lot_size.toLocaleString()} sq ft</p>
                    </div>
                  )}
                  
                  {property.year_built && (
                    <div className="bg-gray-900/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-amber-400">🏛️</span>
                        <h4 className="font-semibold text-white">Year Built</h4>
                      </div>
                      <p className="text-2xl font-bold text-amber-400">{property.year_built}</p>
                    </div>
                  )}
                </div>

                {/* Google Maps Placeholder */}
                <div className="bg-gradient-to-br from-gray-900 to-amber-900/20 rounded-xl p-6 border border-amber-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">G</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">View on Google Maps</h4>
                      <p className="text-gray-400 text-sm">See this location in context</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => {
                      const address = encodeURIComponent(`${property.address}, ${property.city}, ${property.state} ${property.zip_code}`)
                      window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank')
                    }}
                    variant="outline"
                    className="w-full border-amber-500 text-black hover:bg-amber-500 hover:text-white"
                  >
                    Open Google Maps
                  </Button>
                </div>
              </div>
            </div>

            {/* Agent Information Section - Shows agent details */}
            {agent && (
              <div className="bg-gradient-to-r from-gray-800 to-amber-900/20 rounded-2xl p-6 mb-6 border border-amber-500/30">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>👨‍💼</span>
                  Assigned Agent
                </h2>
                
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-amber-500/30">
                    {agent.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{agent.full_name}</h3>
                        <p className="text-amber-400 text-sm mb-2">🏆 Certified Real Estate Agent</p>
                      </div>
                      {agent.rating && (
                        <div className="bg-gray-900/80 px-3 py-1 rounded-full">
                          <span className="text-amber-400 font-bold">{agent.rating.toFixed(1)}</span>
                          <span className="text-gray-400 ml-1">★</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Agent Contact Details - DISPLAYED HERE */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-green-400">📧</span>
                          <span className="text-gray-400 text-sm">Email</span>
                        </div>
                        <p className="text-white font-medium truncate">{agent.email || 'Not provided'}</p>
                      </div>
                      
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-blue-400">📞</span>
                          <span className="text-gray-400 text-sm">Phone</span>
                        </div>
                        <p className="text-white font-medium">{agent.phone || 'Not provided'}</p>
                      </div>

                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-green-500">💬</span>
                          <span className="text-gray-400 text-sm">WhatsApp</span>
                        </div>
                        <p className="text-white font-medium">{agent.whatsapp || agent.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    {agent.bio && (
                      <div className="mb-4">
                        <h4 className="text-amber-300 font-semibold mb-2">About</h4>
                        <p className="text-gray-300">{agent.bio}</p>
                      </div>
                    )}
                    
                    {agent.specialties && agent.specialties.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-amber-300 font-semibold mb-2">Specialties</h4>
                        <div className="flex flex-wrap gap-2">
                          {agent.specialties.map((specialty, index) => (
                            <span key={index} className="bg-amber-900/40 text-amber-300 px-3 py-1 rounded-full text-sm">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Contact & Actions */}
          <div className="space-y-6">
            {/* Contact Card - BUTTONS NOW ALWAYS ACTIVE */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {agent?.full_name ? agent.full_name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {agent?.full_name || 'A-Luxe Agent'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {agent ? 'Assigned Agent' : 'Contact Our Team'}
                  </p>
                </div>
              </div>

              <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                {agent 
                  ? `Contact ${agent.full_name} for an exclusive private viewing of this luxury property.`
                  : 'Contact our team for an exclusive private viewing experience.'
                }
              </p>
              
              <div className="space-y-3">
                {/* Call Button - ALWAYS CLICKABLE */}
                <Button 
                  onClick={handleCallAgent}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-lg">📞</span>
                    <span>
                      {agent?.phone 
                        ? `Call ${agent.full_name?.split(' ')[0] || 'Agent'}`
                        : agent
                          ? `Contact ${agent.full_name?.split(' ')[0] || 'Agent'}`
                          : 'Call Our Office'
                      }
                    </span>
                  </span>
                </Button>
                
                {/* WhatsApp Button - ALWAYS CLICKABLE */}
                <Button 
                  onClick={handleWhatsAppAgent}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
                >
                  <span className="flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>
                      {agent?.whatsapp || agent?.phone
                        ? `WhatsApp ${agent.full_name?.split(' ')[0] || 'Agent'}`
                        : agent
                          ? `Contact ${agent.full_name?.split(' ')[0] || 'Agent'}`
                          : 'WhatsApp Our Office'
                      }
                    </span>
                  </span>
                </Button>
                
                {/* Email Button - ALWAYS CLICKABLE */}
                <Button 
                  onClick={handleEmailAgent}
                  variant="outline" 
                  className="w-full border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-lg">✉️</span>
                    <span>
                      {agent?.email 
                        ? `Email ${agent.full_name?.split(' ')[0] || 'Agent'}`
                        : agent
                          ? `Contact ${agent.full_name?.split(' ')[0] || 'Agent'}`
                          : 'Email Our Office'
                      }
                    </span>
                  </span>
                </Button>
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-4 border-t border-gray-700 space-y-2">
                <div className="flex items-center text-sm text-gray-400">
                  <span className="text-amber-400 mr-2">⚡</span>
                  <span>Response within 24 hours guaranteed</span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <span className="text-amber-400 mr-2">🛡️</span>
                  <span>Confidential & discreet service</span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <span className="text-amber-400 mr-2">🔒</span>
                  <span>Secure communication</span>
                </div>
              </div>
            </div>

            {/* Schedule Viewing Card - UPDATED */}
            <div className="bg-gradient-to-br from-amber-900/20 to-amber-700/10 rounded-2xl p-6 border border-amber-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Schedule Viewing</h3>
                  <p className="text-gray-300 text-sm">Book your preferred viewing method</p>
                </div>
              </div>

              {!isScheduling ? (
                <div className="space-y-3">
                  <Button 
                    onClick={() => setIsScheduling(true)}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      Schedule Appointment
                    </span>
                  </Button>
                  
                  {property.virtual_tour_url && (
                    <Button 
                      onClick={() => {
                        if (property.virtual_tour_url) {
                          window.open(property.virtual_tour_url, '_blank')
                        }
                      }}
                      variant="outline"
                      className="w-full border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white py-3"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Video className="w-4 h-4" />
                        Take Virtual Tour Now
                      </span>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Day Selection */}
                  <div>
                    <label className="block text-gray-300 text-sm mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Select Day
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {AVAILABLE_DAYS.map((day) => (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => setSelectedDay(day.label)}
                          className={`py-2 px-1 rounded-lg text-sm font-medium transition-all ${
                            selectedDay === day.label
                              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {day.label.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="block text-gray-300 text-sm mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Select Time
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {AVAILABLE_TIMES.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 px-1 rounded-lg text-sm font-medium transition-all ${
                            selectedTime === time
                              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedDay && selectedTime && (
                    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                      <div className="flex items-center gap-2 mb-1">
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">Appointment Selected</span>
                      </div>
                      <p className="text-white text-sm">
                        📅 {selectedDay} at ⏰ {selectedTime}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <Button 
                      onClick={handleSchedulePhysicalViewing}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3"
                      disabled={!selectedDay || !selectedTime}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        Schedule Physical Viewing
                      </span>
                    </Button>
                    
                    <Button 
                      onClick={handleScheduleVirtualViewing}
                      variant="outline"
                      className="w-full border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white py-3"
                      disabled={!selectedDay || !selectedTime}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Video className="w-4 h-4" />
                        Schedule Virtual Viewing
                      </span>
                    </Button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setIsScheduling(false)
                        setSelectedDay('')
                        setSelectedTime('')
                      }}
                      className="w-full text-gray-400 hover:text-white text-sm py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Facts */}
            <div className="bg-gray-800 rounded-2xl p-6 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">📊 Property Facts</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-300">Property Type</span>
                  <span className="text-amber-400 capitalize font-medium">{property.property_type}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-300">Status</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    property.status === 'available' ? 'bg-green-500/20 text-green-400' :
                    property.status === 'sold' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {property.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-300">Location</span>
                  <span className="text-amber-400 text-right">{property.city}, {property.state}</span>
                </div>
                {property.year_built && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-300">Year Built</span>
                    <span className="text-amber-400">{property.year_built}</span>
                  </div>
                )}
                {property.lot_size && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">Lot Size</span>
                    <span className="text-amber-400">{property.lot_size.toLocaleString()} sq ft</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">🏡 Similar Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarProperties.map((similarProperty) => (
                <Link key={similarProperty.id} href={`/properties/${similarProperty.id}`}>
                  <div className="bg-gray-800 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-700 hover:border-amber-500/30 cursor-pointer group">
                    <div className="relative h-48 bg-gray-700 overflow-hidden">
                      {similarProperty.images && similarProperty.images.length > 0 ? (
                        <Image
                          src={similarProperty.images[0]}
                          alt={similarProperty.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
                          <span className="text-gray-400">🏠 No Image</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-amber-400 text-sm font-semibold">{formatPrice(similarProperty.price)}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white mb-2 line-clamp-1 group-hover:text-amber-400 transition-colors">{similarProperty.title}</h3>
                      <p className="text-gray-400 text-sm mb-3 flex items-center gap-1">
                        <span>📍</span>
                        <span>{similarProperty.city}, {similarProperty.state}</span>
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 text-xs">
                          <span className="bg-gray-700 px-2 py-1 rounded text-gray-300 flex items-center gap-1">
                            🛏️ {similarProperty.bedrooms || 'N/A'}
                          </span>
                          <span className="bg-gray-700 px-2 py-1 rounded text-gray-300 flex items-center gap-1">
                            🚿 {similarProperty.bathrooms || 'N/A'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 capitalize">{similarProperty.property_type}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}