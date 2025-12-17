// components/global/loading-manager.tsx
'use client'

import { createContext, useContext, useState, useCallback } from 'react'

interface LoadingContextType {
  isLoading: boolean
  startLoading: (message?: string) => void
  stopLoading: () => void
  loadingMessage: string
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Loading...')

  const startLoading = useCallback((message = 'Loading...') => {
    setIsLoading(true)
    setLoadingMessage(message)
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
    setLoadingMessage('Loading...')
  }, [])

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading, loadingMessage }}>
      {children}
    </LoadingContext.Provider>
  )
}

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}