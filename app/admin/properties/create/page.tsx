// app/admin/properties/create/page.tsx - UPDATED
'use client'

import { PropertyForm } from '@/components/properties/property-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function CreatePropertyPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // Redirect non-agents/admins
  if (!user || (user.role !== 'agent' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            {!user 
              ? 'You need to be logged in to access this page.' 
              : 'Only agents and administrators can create properties.'
            }
          </p>
          <Link href="/">
            <Button className="bg-amber-500 hover:bg-amber-600">
              Return Home
            </Button>
          </Link>
        </div>
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
                {user.role === 'admin' ? 'ADMIN PANEL' : 'AGENT DASHBOARD'}
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              <span className="text-gray-300">
                Welcome, {user.full_name} ({user.role})
              </span>
              <Link href="/properties">
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  View Properties
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-gray-900">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Property Form */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Create New Property</h1>
            <p className="text-gray-400">
              {user.role === 'agent' 
                ? 'Add a new property to your portfolio' 
                : 'Add a new property to the platform'
              }
            </p>
            
            {/* Agent Assignment Info */}
            {user.role === 'agent' && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-4 max-w-md mx-auto">
                <p className="text-amber-400 text-sm">
                  🎯 This property will be automatically assigned to you
                </p>
              </div>
            )}
          </div>
          
          <PropertyForm currentUser={user} />
        </div>
      </div>
    </div>
  )
}