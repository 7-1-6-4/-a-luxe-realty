// components/ui/property-video.tsx
'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface PropertyVideoProps {
  src: string
  thumbnail?: string
  title: string
  className?: string
}

export function PropertyVideo({ src, thumbnail, title, className = '' }: PropertyVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePlay = () => {
    setIsLoading(true)
    setIsPlaying(true)
    if (videoRef.current) {
      videoRef.current.play()
    }
  }

  const handleVideoLoad = () => {
    setIsLoading(false)
  }

  return (
    <div className={`relative rounded-xl overflow-hidden bg-black ${className}`}>
      {!isPlaying ? (
        // Show thumbnail with play button
        <div className="relative cursor-pointer w-full h-full" onClick={handlePlay}>
          {thumbnail && (
            <Image
              src={thumbnail}
              alt={`Play ${title}`}
              fill
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-white/90 hover:bg-white rounded-full p-4 transition-all duration-300 transform hover:scale-105 mb-3">
                <svg className="w-8 h-8 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <p className="text-white font-semibold">Click to play video</p>
            </div>
          </div>
        </div>
      ) : (
        // Show video player
        <div className="relative w-full h-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
          )}
          <video
            ref={videoRef}
            controls
            autoPlay
            className="w-full h-full"
            onEnded={() => setIsPlaying(false)}
            onCanPlay={handleVideoLoad}
            onLoadedData={handleVideoLoad}
          >
            <source src={src} type="video/mp4" />
            <source src={src} type="video/mov" />
            <source src={src} type="video/avi" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  )
}