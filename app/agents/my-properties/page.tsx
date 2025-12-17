// app/agent/my-properties/page.tsx - FIXED VERSION
'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
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
  images: string[]
  created_at: string
}

export default function AgentPropertiesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAgentProperties = useCallback(async () => {
    if (!user?.id) return;

    try {
      // First get the agent ID for the current user
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (agentError) throw agentError

      if (agentData) {
        // Get properties assigned to this agent only
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*')
          .eq('agent_id', agentData.id)
          .order('created_at', { ascending: false })

        if (propertiesError) throw propertiesError

        // Type assertion to ensure TypeScript recognizes the property data
        setProperties((propertiesData as Property[]) || [])
      }
    } catch (error) {
      console.error('Error fetching agent properties:', error)
      alert('Failed to load your properties.')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.role === 'agent') {
      fetchAgentProperties()
    }
  }, [user, fetchAgentProperties])

  const handleEditProperty = (propertyId: string) => {
    router.push(`/agents/properties/edit/${propertyId}`)
  }

  const handleViewProperty = (propertyId: string) => {
    router.push(`/properties/${propertyId}`)
  }

  if (user?.role !== 'agent') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">Only agents can access this page.</p>
          <Link href="/dashboard">
            <Button className="bg-amber-500 hover:bg-amber-600">Return to Dashboard</Button>
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
              <div className="text-xs tracking-widest text-gray-300">MY PROPERTIES</div>
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
          <h1 className="text-4xl font-bold text-white mb-4">My Properties</h1>
          <p className="text-gray-400">Manage properties assigned to you</p>
        </div>

        {loading ? (
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-2"></div>
            Loading your properties...
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center text-white bg-gray-800/50 rounded-xl p-8 border border-gray-700">
            <div className="text-6xl mb-4">🏡</div>
            <h2 className="text-2xl font-bold mb-2">No Properties Assigned</h2>
            <p className="text-gray-400 mb-6">You don't have any properties assigned to you yet.</p>
            <Link href="/admin/properties/create">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                Create Your First Property
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}