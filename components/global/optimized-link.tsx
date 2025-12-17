// components/global/optimized-link.tsx
'use client'

import Link from 'next/link'
import { useLoading } from './loading-manager'

interface OptimizedLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  prefetch?: boolean
  onClick?: () => void
}

export function OptimizedLink({ 
  href, 
  children, 
  className, 
  prefetch = true,
  onClick 
}: OptimizedLinkProps) {
  const { startLoading } = useLoading()
  
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick()
    startLoading('Navigating...')
  }

  return (
    <Link 
      href={href} 
      className={className}
      prefetch={prefetch}
      onClick={handleClick}
    >
      {children}
    </Link>
  )
}