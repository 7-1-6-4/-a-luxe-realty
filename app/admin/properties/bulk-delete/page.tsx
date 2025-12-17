// app/admin/properties/bulk-delete/page.tsx
'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase-optimized'
import { useRouter } from 'next/navigation'
const supabase = getSupabase()

interface Property {
  id: string
  title: string
  price: number
  city: string
  status: string
  created_at: string
}

export default function BulkDeletePage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [confirmText, setConfirmText] = useState('')

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchProperties()
    }
  }, [user])

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, price, city, status, created_at')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching properties:', error)
        throw error
      }

      setProperties(data || [])
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to load properties.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(properties.map(p => p.id))
      setSelectedProperties(allIds)
    } else {
      setSelectedProperties(new Set())
    }
  }

  const handleSelectProperty = (propertyId: string, checked: boolean) => {
    const newSelected = new Set(selectedProperties)
    if (checked) {
      newSelected.add(propertyId)
    } else {
      newSelected.delete(propertyId)
    }
    setSelectedProperties(newSelected)
  }

  const handleBulkDelete = async () => {
    if (selectedProperties.size === 0) {
      alert('Please select properties to delete.')
      return
    }

    if (confirmText !== 'DELETE CONFIRM') {
      alert('Please type "DELETE CONFIRM" to confirm deletion.')
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedProperties.size} properties? This action cannot be undone!`)) {
      return
    }

    setDeleting(true)

    try {
      // First, get all property IDs to delete
      const propertyIds = Array.from(selectedProperties)
      
      // Delete properties from database
      const { error } = await supabase
        .from('properties')
        .delete()
        .in('id', propertyIds)

      if (error) {
        console.error('Error deleting properties:', error)
        throw error
      }

      // Note: You might want to also delete associated files from storage
      // This would require additional logic to delete from Supabase Storage

      alert(`Successfully deleted ${selectedProperties.size} properties!`)
      
      // Refresh the list
      fetchProperties()
      setSelectedProperties(new Set())
      setConfirmText('')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to delete properties. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">You don't have permission to access this page.</p>
          <Link href="/dashboard">
            <Button className="bg-amber-500 hover:bg-amber-600">Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-2"></div>
          Loading properties...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <nav className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link href="/admin/properties" className="text-white">
              <div className="text-xl font-bold tracking-wider">A-LUXE REALTY</div>
              <div className="text-xs tracking-widest text-gray-300">BULK DELETE PROPERTIES</div>
            </Link>
            <div className="flex gap-2">
              <Link href="/admin/properties">
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  ← Back to Properties
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button className="bg-amber-500 hover:bg-amber-600">
                  ← Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Bulk Delete Properties</h1>
            <p className="text-gray-400">⚠️ Warning: This action cannot be undone!</p>
          </div>

          {/* Search and Controls */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 mb-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
              <div className="flex-1 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search properties by title or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-white">
                  {selectedProperties.size} of {properties.length} selected
                </div>
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={selectedProperties.size === properties.length && properties.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-5 h-5 text-amber-500 bg-gray-700 border-gray-600 rounded focus:ring-amber-500 focus:ring-2"
                  />
                  Select All
                </label>
              </div>
            </div>

            {/* Confirmation Section */}
            {selectedProperties.size > 0 && (
              <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 mb-6">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">⚠️</div>
                  <h3 className="text-xl font-bold text-red-400 mb-2">Danger Zone</h3>
                  <p className="text-gray-300 mb-4">
                    You are about to delete {selectedProperties.size} properties. This action is irreversible!
                  </p>
                  
                  <div className="max-w-md mx-auto">
                    <p className="text-gray-400 text-sm mb-2">
                      Type <span className="font-bold text-white">DELETE CONFIRM</span> to confirm:
                    </p>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-red-600 rounded-lg text-white text-center text-lg font-mono focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                      placeholder="DELETE CONFIRM"
                    />
                    
                    <div className="flex gap-4 mt-4">
                      <Button
                        onClick={() => {
                          setSelectedProperties(new Set())
                          setConfirmText('')
                        }}
                        variant="outline"
                        className="flex-1 border-gray-600 text-gray-300"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleBulkDelete}
                        disabled={confirmText !== 'DELETE CONFIRM' || deleting}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      >
                        {deleting ? 'Deleting...' : `Delete ${selectedProperties.size} Properties`}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Properties List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {filteredProperties.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No properties found.</p>
                </div>
              ) : (
                filteredProperties.map((property) => (
                  <div
                    key={property.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      selectedProperties.has(property.id)
                        ? 'bg-red-900/20 border-red-600'
                        : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedProperties.has(property.id)}
                        onChange={(e) => handleSelectProperty(property.id, e.target.checked)}
                        className="w-5 h-5 text-amber-500 bg-gray-700 border-gray-600 rounded focus:ring-amber-500 focus:ring-2"
                      />
                      <div>
                        <h4 className="font-semibold text-white">{property.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                          <span>📍 {property.city}</span>
                          <span>💰 KSh {property.price.toLocaleString()}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            property.status === 'available' ? 'bg-green-500/20 text-green-400' :
                            property.status === 'sold' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {property.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">
                        {new Date(property.created_at).toLocaleDateString()}
                      </span>
                      <Link href={`/admin/properties/edit/${property.id}`}>
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800/50 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-3xl font-bold text-white mb-2">{properties.length}</div>
              <div className="text-gray-400">Total Properties</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-3xl font-bold text-amber-400 mb-2">{selectedProperties.size}</div>
              <div className="text-gray-400">Selected for Deletion</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {properties.filter(p => p.status === 'available').length}
              </div>
              <div className="text-gray-400">Available Properties</div>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="bg-amber-900/20 border border-amber-700 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <h4 className="font-bold text-amber-400 mb-2">Important Notes</h4>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>• Deleted properties cannot be recovered</li>
                  <li>• This will also delete associated images/videos from storage</li>
                  <li>• Consider archiving or changing status instead of deleting</li>
                  <li>• Always backup your database before bulk operations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}