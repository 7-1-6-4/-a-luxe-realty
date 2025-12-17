// app/admin/properties/page.tsx
'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase-optimized'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
const supabase = getSupabase()

interface Property {
  id: string
  title: string
  description: string
  price: number
  property_type: string
  status: string
  bedrooms?: number
  bathrooms?: number
  square_feet?: number
  address: string
  city: string
  state?: string
  zip_code?: string
  neighborhood?: string
  images: string[]
  created_at: string
  updated_at: string
  agent_id?: string
  agents?: {
    id: string
    user_id: string
    users: {
      id: string
      full_name: string
      email: string
      phone: string
    }
  }
}

export default function AdminPropertiesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchProperties()
    }
  }, [user])

  const fetchProperties = async () => {
    try {
      console.log('🔄 Fetching properties...')
      
      // FIXED: Use proper relationship syntax for agents -> users
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          agents (
            id,
            user_id,
            users (
              id,
              full_name,
              email,
              phone
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Detailed property fetch error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      console.log('✅ Properties fetched successfully:', data?.length || 0)
      console.log('📊 Sample property data:', data?.[0])
      setProperties(data || [])
    } catch (error) {
      console.error('💥 Error fetching properties:', error)
      alert('Failed to load properties. Please check your permissions or try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditProperty = (propertyId: string) => {
    router.push(`/admin/properties/edit/${propertyId}`)
  }

  const handleViewProperty = (propertyId: string) => {
    router.push(`/properties/${propertyId}`)
  }

  // Helper function to get agent info safely
  const getAgentInfo = (property: Property) => {
    if (!property.agents || !property.agents.users) {
      return { name: 'Not assigned', phone: 'N/A', email: 'N/A' }
    }
    return {
      name: property.agents.users.full_name || 'Not assigned',
      phone: property.agents.users.phone || 'N/A',
      email: property.agents.users.email || 'N/A'
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">You don't have permission to access this page.</p>
          <Link href="/dashboard">
            <Button className="bg-amber-500 hover:bg-amber-600">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <nav className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link href="/dashboard" className="text-white">
              <div className="text-xl font-bold tracking-wider">A-LUXE REALTY</div>
              <div className="text-xs tracking-widest text-gray-300">ALL PROPERTIES</div>
            </Link>
            <div className="flex gap-4">
              <Link href="/admin/properties/create">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                  ➕ Add Property
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="border-amber-400 text-amber-400">
                  ← Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">All Properties</h1>
          <p className="text-gray-400">Manage all property listings</p>
        </div>

        {loading ? (
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-2"></div>
            Loading properties...
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center text-white bg-gray-800/50 rounded-xl p-8 border border-gray-700">
            <div className="text-6xl mb-4">🏡</div>
            <h2 className="text-2xl font-bold mb-2">No Properties Found</h2>
            <p className="text-gray-400 mb-6">Get started by creating your first property listing.</p>
            <Link href="/admin/properties/create">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                Create Your First Property
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => {
              const agentInfo = getAgentInfo(property)
              return (
                <div key={property.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-amber-500/50 transition-all duration-300">
                  {/* Property Image */}
                  <div className="relative h-48 bg-gray-700 rounded-lg mb-4 overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <Image
                        src={property.images[0]}
                        alt={property.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${
                      property.status === 'available' ? 'bg-green-500 text-white' :
                      property.status === 'sold' ? 'bg-red-500 text-white' :
                      property.status === 'pending' ? 'bg-yellow-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {property.status.toUpperCase()}
                    </div>
                  </div>

                  <h3 className="text-white font-semibold text-lg mb-2 line-clamp-1">{property.title}</h3>
                  <p className="text-amber-400 font-bold text-xl mb-2">KSh {property.price?.toLocaleString()}</p>
                  <p className="text-gray-400 mb-2">{property.city}, {property.state}</p>
                  
                  {/* Agent Information */}
                  <div className="mb-3 p-3 bg-gray-700/50 rounded-lg">
                    <p className="text-gray-300 text-sm font-semibold mb-1">Assigned Agent:</p>
                    <p className="text-white text-sm">{agentInfo.name}</p>
                    <p className="text-gray-400 text-xs">📞 {agentInfo.phone}</p>
                    <p className="text-gray-400 text-xs">✉️ {agentInfo.email}</p>
                  </div>

                  <p className="text-gray-500 text-sm mb-3">
                    Type: <span className="capitalize">{property.property_type}</span>
                  </p>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleViewProperty(property.id)}
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                    >
                      👁️ View
                    </Button>
                    <Button 
                      onClick={() => handleEditProperty(property.id)}
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-white"
                    >
                      ✏️ Edit
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}