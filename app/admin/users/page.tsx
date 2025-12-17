// app/admin/users/page.tsx - FIXED VERSION
'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase-optimized'
const supabase = getSupabase()

interface User {
  id: string
  full_name: string
  email: string
  phone?: string
  role: string
  created_at: string
}

// Define the RPC return type
interface RoleUpdateResult {
  success: boolean
  error?: string
  message?: string
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchUsers()
    }
  }, [currentUser])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error: unknown) {
      console.error('Error fetching users:', error)
      alert('Error fetching users: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string, userName: string) => {
    // Prevent self-role change in UI as well
    if (userId === currentUser?.id && newRole !== 'admin') {
      alert('❌ You cannot remove your own admin privileges')
      return
    }

    setUpdatingId(userId)
    
    try {
      console.log('🔄 Updating role for user:', userId, 'to:', newRole)
      
      // FIXED: Proper RPC call with TypeScript
      const { data, error } = await supabase.rpc<RoleUpdateResult>('update_user_role', {
        target_user_id: userId,
        new_role: newRole
      })

      if (error) {
        console.error('❌ Database function error:', error)
        throw new Error('Failed to update user role: ' + error.message)
      }

      // Check if data exists and has error property
      if (data && 'error' in data && data.error) {
        throw new Error(data.error)
      }

      console.log('✅ Database function successful:', data)
      
      // Update UI and show success
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      )
      
      alert(`✅ ${userName} is now ${newRole}`)
      
    } catch (error: unknown) {
      console.error('❌ Update error:', error)
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
      
      await fetchUsers() // Refresh data to ensure UI matches database
    } finally {
      setUpdatingId(null)
    }
  }

  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>Admin access required</p>
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
              <div className="text-xs tracking-widest text-gray-300">USER MANAGEMENT</div>
            </Link>
            <div className="flex gap-4 items-center">
              <Button 
                onClick={fetchUsers}
                variant="outline" 
                className="border-green-400 text-green-400"
              >
                Refresh Users
              </Button>
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
          <h1 className="text-4xl font-bold text-white mb-4">User Management</h1>
          <p className="text-gray-400">Manage all platform users and roles</p>
          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg max-w-md mx-auto">
            <p className="text-sm text-amber-400">Using Secure Database Function</p>
            <p className="text-xs text-gray-400 mt-1">
              Role changes are handled securely via database function
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-white">Loading users...</div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">{user.full_name}</h3>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                    <p className="text-gray-400 text-sm">
                      Phone: {user.phone || 'Not provided'}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Role: <span className={`capitalize ${
                        user.role === 'admin' ? 'text-amber-400' : 
                        user.role === 'agent' ? 'text-green-400' : 
                        'text-blue-400'
                      }`}>
                        {user.role}
                      </span>
                    </p>
                    <p className="text-gray-500 text-sm">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateUserRole(user.id, 'admin', user.full_name)}
                      disabled={user.role === 'admin' || updatingId === user.id}
                      variant={user.role === 'admin' ? 'default' : 'outline'}
                      className={`text-xs ${
                        user.role === 'admin' 
                          ? 'bg-amber-500 hover:bg-amber-600' 
                          : 'border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-gray-900'
                      }`}
                    >
                      {updatingId === user.id ? 'Updating...' : 'Make Admin'}
                    </Button>
                    <Button
                      onClick={() => updateUserRole(user.id, 'agent', user.full_name)}
                      disabled={user.role === 'agent' || updatingId === user.id}
                      variant={user.role === 'agent' ? 'default' : 'outline'}
                      className={`text-xs ${
                        user.role === 'agent' 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'border-green-400 text-green-400 hover:bg-green-400 hover:text-gray-900'
                      }`}
                    >
                      {updatingId === user.id ? 'Updating...' : 'Make Agent'}
                    </Button>
                    <Button
                      onClick={() => updateUserRole(user.id, 'client', user.full_name)}
                      disabled={user.role === 'client' || updatingId === user.id}
                      variant={user.role === 'client' ? 'default' : 'outline'}
                      className={`text-xs ${
                        user.role === 'client' 
                          ? 'bg-blue-500 hover:bg-blue-600' 
                          : 'border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-gray-900'
                      }`}
                    >
                      {updatingId === user.id ? 'Updating...' : 'Make Client'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}