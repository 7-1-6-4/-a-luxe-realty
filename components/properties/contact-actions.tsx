// components/properties/contact-actions.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

interface ContactActionsProps {
  property: {
    id: string
    title: string
    agent_id?: string
  }
  agent?: {
    phone?: string
    email?: string
    full_name?: string
  }
}

export function ContactActions({ property, agent }: ContactActionsProps) {
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [message, setMessage] = useState('')
  
  const { user, isAuthenticated } = useAuth()

  const handleCallAgent = () => {
    if (agent?.phone) {
      window.open(`tel:${agent.phone}`, '_self')
    } else {
      alert('Agent phone number not available')
    }
  }

  const handleEmailAgent = () => {
    if (agent?.email) {
      const subject = `Enquiry about ${property.title}`
      const body = `Hello${agent?.full_name ? ` ${agent.full_name}` : ''},\n\nI am interested in the property: ${property.title}.\n\nPlease provide me with more information.\n\nBest regards,\n${user?.full_name || 'Potential Client'}`
      window.open(`mailto:${agent.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self')
    } else {
      alert('Agent email not available')
    }
  }

  const handleScheduleTour = () => {
    if (!isAuthenticated) {
      alert('Please sign in to schedule a tour')
      return
    }
    setShowScheduleForm(true)
  }

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Here you would typically send this data to your backend
    console.log('Tour scheduled:', {
      propertyId: property.id,
      date: selectedDate,
      time: selectedTime,
      message: message,
      userId: user?.id
    })
    
    alert('Tour scheduled successfully! The agent will contact you to confirm.')
    setShowScheduleForm(false)
    setSelectedDate('')
    setSelectedTime('')
    setMessage('')
  }

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="space-y-3">
        <Button 
          onClick={handleCallAgent}
          className="w-full bg-green-600 hover:bg-green-700 text-white transition-all duration-300"
        >
          📞 Call Agent
        </Button>
        
        <Button 
          onClick={handleEmailAgent}
          variant="outline" 
          className="w-full border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300"
        >
          ✉️ Email Enquiry
        </Button>
        
        <Button 
          onClick={handleScheduleTour}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white transition-all duration-300"
        >
          🗓️ Schedule a Tour
        </Button>
      </div>

      {/* Schedule Tour Form Modal */}
      {showScheduleForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Schedule a Property Tour</h3>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preferred Time
                </label>
                <select 
                  required
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Select a time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  rows={3}
                  placeholder="Any specific requirements or questions..."
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowScheduleForm(false)}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Schedule Tour
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}