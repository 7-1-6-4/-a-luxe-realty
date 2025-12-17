'use client'

import { useState } from 'react'

interface VideoPlayerProps {
  url: string
  title?: string
  className?: string
  autoplay?: boolean
  controls?: boolean
}

export function VideoPlayer({ 
  url, 
  title = 'Video', 
  className = '', 
  autoplay = false,
  controls = true
}: VideoPlayerProps) {
  const [error, setError] = useState(false)

  // Extract YouTube video ID
  const getYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
      /youtube\.com\/embed\/([^"&?\/\s]{11})/,
      /youtube\.com\/v\/([^"&?\/\s]{11})/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    return null
  }

  // Extract Vimeo video ID
  const getVimeoId = (url: string): string | null => {
    const patterns = [
      /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/,
      /vimeo\.com\/video\/([0-9]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    return null
  }

  // Check URL type
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be')
  const isVimeo = url.includes('vimeo.com')
  const isDirectVideo = /\.(mp4|mov|avi|webm)$/i.test(url)

  if (error) {
    return (
      <div className={`bg-gray-800 rounded-lg flex flex-col items-center justify-center p-8 ${className}`}>
        <div className="text-4xl mb-2">❌</div>
        <p className="text-gray-300">Cannot play video</p>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-amber-400 hover:text-amber-300 text-sm mt-2"
        >
          Open link
        </a>
      </div>
    )
  }

  // YouTube Player
  if (isYouTube) {
    const videoId = getYouTubeId(url)
    if (!videoId) {
      return (
        <div className={`bg-gray-800 rounded-lg flex flex-col items-center justify-center p-8 ${className}`}>
          <div className="text-4xl mb-2">🎥</div>
          <p className="text-gray-300">YouTube Video</p>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 text-sm mt-2 truncate max-w-full px-4"
          >
            {url}
          </a>
        </div>
      )
    }

    const autoplayParam = autoplay ? '&autoplay=1' : ''
    const controlsParam = controls ? '' : '&controls=0'
    
    return (
      <div className={`relative ${className}`}>
        <div className="pb-[56.25%] relative h-0"> {/* 16:9 aspect ratio */}
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1${autoplayParam}${controlsParam}`}
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title={title}
            onError={() => setError(true)}
          />
        </div>
      </div>
    )
  }

  // Vimeo Player
  if (isVimeo) {
    const videoId = getVimeoId(url)
    if (!videoId) {
      return (
        <div className={`bg-gray-800 rounded-lg flex flex-col items-center justify-center p-8 ${className}`}>
          <div className="text-4xl mb-2">🎬</div>
          <p className="text-gray-300">Vimeo Video</p>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 text-sm mt-2 truncate max-w-full px-4"
          >
            {url}
          </a>
        </div>
      )
    }

    const autoplayParam = autoplay ? '&autoplay=1' : ''
    
    return (
      <div className={`relative ${className}`}>
        <div className="pb-[56.25%] relative h-0">
          <iframe
            src={`https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0${autoplayParam}`}
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={title}
            onError={() => setError(true)}
          />
        </div>
      </div>
    )
  }

  // Direct video file
  if (isDirectVideo) {
    return (
      <div className={className}>
        <video
          src={url}
          controls={controls}
          autoPlay={autoplay}
          className="w-full h-full rounded-lg"
          title={title}
          onError={() => setError(true)}
        >
          <track kind="captions" />
        </video>
      </div>
    )
  }

  // For other platforms or invalid URLs
  return (
    <div className={`bg-gray-800 rounded-lg flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="text-4xl mb-2">🔗</div>
      <p className="text-gray-300">External Video Link</p>
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-amber-400 hover:text-amber-300 text-sm mt-2 truncate max-w-full px-4"
      >
        {url}
      </a>
    </div>
  )
}