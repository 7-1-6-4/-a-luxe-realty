// app/auth/verify-email/page.tsx
'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const resendVerification = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: 'user@example.com' // This would typically come from context
      })
      
      if (error) {
        console.error('Resend error:', error)
        throw error
      }
      setMessage('Verification email sent! Please check your inbox.')
    } catch (error) {
      // Now properly using the error variable
      console.error('Verification email error:', error)
      setMessage('Error sending verification email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 shadow-2xl text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="text-3xl font-bold text-white mb-2">Check Your Email</h1>
          <p className="text-gray-400">
            We've sent a verification link to your email address.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-gray-300 text-sm">
            Click the link in the email to verify your account and start exploring luxury properties.
          </p>

          {message && (
            <div className={`p-3 rounded-lg ${
              message.includes('Error') 
                ? 'bg-red-500/10 border border-red-500/50 text-red-400'
                : 'bg-green-500/10 border border-green-500/50 text-green-400'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={resendVerification}
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              {loading ? 'Sending...' : 'Resend Verification Email'}
            </Button>
            
            <Link href="/auth/login" className="block">
              <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>Didn't receive the email? Check your spam folder or try a different email address.</p>
        </div>
      </div>
    </div>
  )
}