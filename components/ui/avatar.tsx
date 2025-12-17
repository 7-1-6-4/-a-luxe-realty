// components/ui/avatar.tsx or components/Avatar.tsx
'use client'

import Image from 'next/image'
import { useState } from 'react'

interface AvatarProps {
  src?: string | null
  name?: string
  email?: string
  size?: number
  className?: string
  showIndicator?: boolean
}

export function Avatar({ 
  src, 
  name, 
  email, 
  size = 40,
  className = '',
  showIndicator = true
}: AvatarProps) {
  const [error, setError] = useState(false)
  
  // Generate fallback avatar URL
  const getFallbackAvatar = () => {
    const seed = name || email || 'user'
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=ffd700`
  }
  
  // Generate initials for fallback
  const getInitials = () => {
    if (name) {
      const names = name.split(' ')
      if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      }
      return name.charAt(0).toUpperCase()
    }
    if (email) {
      return email.charAt(0).toUpperCase()
    }
    return 'U'
  }
  
  const avatarUrl = src && !error ? src : getFallbackAvatar()
  const initials = getInitials()

  return (
    <div className={`relative ${className}`}>
      <div 
        className="rounded-full overflow-hidden border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-amber-600/20"
        style={{ width: size, height: size }}
      >
        {src && !error ? (
          <Image
            src={avatarUrl}
            alt={name || 'User avatar'}
            width={size}
            height={size}
            className="object-cover w-full h-full"
            onError={() => setError(true)}
            unoptimized={avatarUrl.includes('dicebear')}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
            <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>
              {initials}
            </span>
          </div>
        )}
      </div>
      
      {showIndicator && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
      )}
    </div>
  )
}