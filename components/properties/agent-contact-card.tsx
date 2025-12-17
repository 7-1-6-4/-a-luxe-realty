// components/properties/agent-contact-card.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { getSupabase } from '@/lib/supabase-optimized'
const supabase = getSupabase()

interface AgentContactCardProps {
  agentId: string
  propertyTitle: string
}

interface AgentContactInfo {
  id: string
  full_name: string
  email: string
  phone: string | null
  license_number: string
}

// Define the expected response type from Supabase
interface AgentData {
  license_number: string
  users: {
    id: string
    full_name: string
    email: string
    phone: string | null
  }[]
}

export function AgentContactCard({ agentId, propertyTitle }: AgentContactCardProps) {
  const [agentInfo, setAgentInfo] = useState<AgentContactInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAgentInfo()
  }, [agentId])

  const fetchAgentInfo = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Fetching agent info for ID:', agentId)

      // Get agent and user info with proper typing
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select(`
          license_number,
          users!inner (
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('id', agentId)
        .single()

      if (agentError) {
        console.error('❌ Error fetching agent:', agentError)
        setError('Agent not found')
        return
      }

      // Type assertion for the response data
      const typedAgentData = agentData as unknown as AgentData

      if (typedAgentData && typedAgentData.users && typedAgentData.users.length > 0) {
        console.log('✅ Found agent data:', typedAgentData)
        setAgentInfo({
          id: typedAgentData.users[0].id,
          full_name: typedAgentData.users[0].full_name,
          email: typedAgentData.users[0].email,
          phone: typedAgentData.users[0].phone,
          license_number: typedAgentData.license_number
        })
      } else {
        setError('Agent user information not found')
      }
    } catch (error) {
      console.error('💥 Unexpected error:', error)
      setError('Failed to load agent information')
    } finally {
      setLoading(false)
    }
  }

  const handleCall = () => {
    if (agentInfo?.phone) {
      window.open(`tel:${agentInfo.phone}`, '_self')
    }
  }

  const handleEmail = () => {
    if (agentInfo?.email) {
      const subject = `Inquiry about: ${propertyTitle}`
      const body = `Hello ${agentInfo.full_name},\n\nI am interested in the property: ${propertyTitle}.\n\nPlease contact me with more information.`
      window.open(`mailto:${agentInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self')
    }
  }

  const handleWhatsApp = () => {
    if (agentInfo?.phone) {
      const message = `Hello! I'm interested in the property: ${propertyTitle}. Please send me more information.`
      window.open(`https://wa.me/${agentInfo.phone.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-amber-500/30">
        <div className="text-gray-400">Loading agent information...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-red-500/30">
        <div className="text-red-400">
          <p className="font-semibold">Agent Not Found</p>
          <p className="text-sm mt-1">Please check the Agent ID</p>
          <p className="text-xs text-gray-400 mt-2">ID: {agentId}</p>
        </div>
      </div>
    )
  }

  if (!agentInfo) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-amber-500/30">
        <div className="text-gray-400">Agent information not available</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-amber-500/30">
      <h3 className="text-xl font-semibold text-amber-400 mb-4">Contact Agent</h3>
      
      <div className="mb-4">
        <h4 className="text-white font-semibold text-lg">{agentInfo.full_name}</h4>
        <p className="text-gray-400 text-sm">Licensed Real Estate Agent</p>
        {agentInfo.license_number && (
          <p className="text-gray-500 text-xs">License: {agentInfo.license_number}</p>
        )}
      </div>

      <div className="space-y-3">
        {/* Call Button */}
        <Button
          onClick={handleCall}
          disabled={!agentInfo.phone}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 transition-all duration-300"
        >
          📞 Call Agent
          {agentInfo.phone && (
            <span className="ml-2 text-sm opacity-90">{agentInfo.phone}</span>
          )}
        </Button>

        {/* WhatsApp Button */}
        <Button
          onClick={handleWhatsApp}
          disabled={!agentInfo.phone}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 transition-all duration-300"
        >
          💬 WhatsApp
        </Button>

        {/* Email Button */}
        <Button
          onClick={handleEmail}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 transition-all duration-300"
        >
          ✉️ Email Agent
        </Button>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Agent will contact you within 24 hours
      </div>
    </div>
  )
}