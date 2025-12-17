'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase-optimized'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = getSupabase()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })

      if (error) throw error
      
      setSuccess(true)
    } catch (err: any) {
      // Don't reveal if email exists or not (security best practice)
      setError('If an account exists with this email, you will receive a reset link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 shadow-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
        <p className="text-gray-400">
          Enter your email to receive a password reset link.
        </p>
      </div>

      {error && (
        <div className="bg-blue-500/10 border border-blue-500/50 text-blue-400 p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-3 rounded-lg mb-6">
          <p className="font-semibold">Check your email!</p>
          <p className="text-sm mt-1">
            If an account exists with this email, you'll receive a password reset link.
            The link will expire in 24 hours.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Enter your email address"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>

      <div className="mt-6 text-center space-y-4">
        <p className="text-gray-400">
          Remember your password?{' '}
          <Link href="/auth/login" className="text-amber-400 hover:text-amber-300 font-semibold">
            Back to Sign In
          </Link>
        </p>
        
        <div className="pt-4 border-t border-gray-700">
          <p className="text-gray-400 text-sm">
            The reset link will be valid for 24 hours. Need help?{' '}
            <a href="mailto:support@aluxerealty.com" className="text-amber-400 hover:text-amber-300">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}