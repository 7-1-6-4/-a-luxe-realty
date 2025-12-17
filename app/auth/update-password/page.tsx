'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase-optimized'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const supabase = getSupabase()

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <UpdatePasswordContent />
    </Suspense>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Loading...</h1>
          <p className="text-gray-400">Please wait while we verify your session</p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
        </div>
      </div>
    </div>
  )
}

function UpdatePasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setIsAuthenticated(true)
      } else {
        // Check if there's a message from the reset flow
        const message = searchParams.get('message')
        if (message) {
          setMessage(decodeURIComponent(message))
        } else {
          // If no session and no message, redirect to forgot password
          router.push('/auth/forgot-password')
        }
      }
    }
    
    checkAuth()
  }, [router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      setError('Session expired. Please request a new reset link.')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      
      setSuccess(true)
      
      // Sign out and redirect to login
      setTimeout(async () => {
        await supabase.auth.signOut()
        router.push('/auth/login?message=Password updated successfully! Please sign in with your new password.')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isAuthenticated ? 'Set New Password' : 'Reset Password Link'}
          </h1>
          <p className="text-gray-400">
            {isAuthenticated 
              ? 'Create a new password for your account'
              : message || 'Please check your email for the reset link'
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center space-y-6">
            <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-3 rounded-lg">
              <p className="font-semibold">Password updated successfully!</p>
              <p className="text-sm mt-1">
                You will be redirected to login...
              </p>
            </div>
            <Button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-semibold"
            >
              Go to Login Now
            </Button>
          </div>
        ) : isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter new password (min. 6 characters)"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Confirm new password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-semibold transition-all duration-300"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/50 text-blue-400 p-3 rounded-lg">
              <p className="font-semibold">Check your email</p>
              <p className="text-sm mt-1">
                If you don't see the email, check your spam folder or request a new link.
              </p>
            </div>
            <Link href="/auth/forgot-password">
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-semibold">
                Request New Reset Link
              </Button>
            </Link>
          </div>
        )}

        <div className="mt-6 text-center space-y-4">
          <p className="text-gray-400">
            Remember your password?{' '}
            <Link href="/auth/login" className="text-amber-400 hover:text-amber-300 font-semibold">
              Back to Sign In
            </Link>
          </p>
          
          {isAuthenticated && (
            <div className="pt-4 border-t border-gray-700">
              <p className="text-gray-400 text-sm">
                After updating your password, you'll need to sign in again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}