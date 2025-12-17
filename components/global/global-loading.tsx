// components/global/global-loading.tsx
'use client'

import { useLoading } from './loading-manager'

export function GlobalLoading() {
  const { isLoading, loadingMessage } = useLoading()

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-2xl p-6 flex flex-col items-center space-y-4 min-w-[200px] border border-amber-500/30">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        <span className="text-white text-sm">{loadingMessage}</span>
      </div>
    </div>
  )
}