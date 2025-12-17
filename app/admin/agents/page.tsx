// app/admin/agents/page.tsx - FIXED VERSION
'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase-optimized'
const supabase = getSupabase()

// Define proper TypeScript interfaces for the NEW structure
interface User {
  id: string
  full_name: string
  email: string
  phone: string | null
  created_at: string
}

interface Agent {
  id: string
  user_id: string
  license_number: string
  is_active: boolean
  created_at: string
  users: User[] | null
}

export default function AdminAgentsPage() {
  const { user } = useAuth()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAgents()
    }
  }, [user])

  const fetchAgents = async () => {
    try {
      // Let's try a different approach - fetch users and agents separately
      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false })

      if (agentsError) throw agentsError

      if (agentsData && agentsData.length > 0) {
        // Get all user IDs from agents
        const userIds = agentsData.map(agent => agent.user_id).filter(Boolean)
        
        // Fetch the corresponding users
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .in('id', userIds)

        if (usersError) throw usersError

        // Combine agents with their user data
        const agentsWithUsers = agentsData.map(agent => {
          const user = usersData?.find(u => u.id === agent.user_id)
          return {
            ...agent,
            users: user ? [user] : null
          }
        })

        console.log('Combined data:', agentsWithUsers)
        setAgents(agentsWithUsers)
      } else {
        setAgents([])
      }
      
    } catch (error: unknown) {
      console.error('Error fetching agents:', error)
      setAgents([])
    } finally {
      setLoading(false)
    }
  }

  const toggleAgentStatus = async (agentId: string, currentStatus: boolean, agentName: string) => {
    setUpdatingId(agentId)
    try {
      console.log('Toggling agent:', agentId, agentName, 'Current status:', currentStatus)
      
      const { error } = await supabase
        .from('agents')
        .update({ is_active: !currentStatus })
        .eq('id', agentId)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Successfully updated agent:', agentId)
      
      // Update local state immediately for better UX
      setAgents(prevAgents => 
        prevAgents.map(agent => 
          agent.id === agentId 
            ? { ...agent, is_active: !currentStatus }
            : agent
        )
      )
      
      alert(`Agent ${agentName} ${!currentStatus ? 'activated' : 'deactivated'} successfully!`)
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error updating agent:', errorMessage)
      alert('Error updating agent: ' + errorMessage)
      
      // Revert local state on error
      setAgents(prevAgents => 
        prevAgents.map(agent => 
          agent.id === agentId 
            ? { ...agent, is_active: currentStatus }
            : agent
        )
      )
    } finally {
      setUpdatingId(null)
    }
  }

  // Safe helper function to get user data
  const getUser = (agent: Agent) => {
    // Debug the agent object
    console.log('Agent in getUser:', agent)
    
    if (!agent.users || !Array.isArray(agent.users) || agent.users.length === 0) {
      console.log('No user data found for agent:', agent.id)
      // Return a fallback user object
      return {
        id: agent.user_id || 'unknown',
        full_name: 'Unknown User',
        email: 'No email available',
        phone: null,
        created_at: agent.created_at
      }
    }
    
    const user = agent.users[0]
    console.log('Found user:', user)
    return user
  }

  // Safe function to get agent name for alerts
  const getAgentName = (agent: Agent): string => {
    const user = getUser(agent)
    return user.full_name
  }

  if (user?.role !== 'admin') {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Access Denied</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <nav className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link href="/dashboard" className="text-white">
              <div className="text-xl font-bold tracking-wider">A-LUXE REALTY</div>
              <div className="text-xs tracking-widest text-gray-300">MANAGE AGENTS</div>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="border-amber-400 text-amber-400">
                ← Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Manage Agents</h1>
          <p className="text-gray-400">View and manage all real estate agents</p>
        </div>

        {loading ? (
          <div className="text-center text-white">Loading agents...</div>
        ) : (
          <div className="space-y-4">
            {agents.length === 0 ? (
              <div className="text-center text-white">No agents found</div>
            ) : (
              agents.map((agent) => {
                console.log('Rendering agent:', agent) // Debug each agent
                const user = getUser(agent)
                console.log('User to render:', user) // Debug the user
                
                return (
                  <div key={agent.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold">{user.full_name}</h3>
                        <p className="text-gray-400">{user.email}</p>
                        <p className="text-gray-500 text-sm">
                          Phone: {user.phone || 'Not provided'}
                        </p>
                        <p className="text-gray-500 text-sm">
                          License: {agent.license_number || 'Not provided'}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Status: <span className={agent.is_active ? 'text-green-400' : 'text-red-400'}>
                            {agent.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                        <p className="text-gray-500 text-xs">User ID: {user.id}</p>
                        <p className="text-gray-500 text-xs">Agent ID: {agent.id}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => toggleAgentStatus(agent.id, agent.is_active, getAgentName(agent))}
                          variant={agent.is_active ? 'outline' : 'default'}
                          className={agent.is_active ? 'border-red-400 text-red-400' : 'bg-green-500'}
                          disabled={updatingId === agent.id}
                        >
                          {updatingId === agent.id ? 'Updating...' : agent.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}