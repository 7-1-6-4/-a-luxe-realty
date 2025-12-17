// components/properties/media-gallery.tsx - FIXED VERSION
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { VideoPlayer } from '@/components/properties/video-player'

interface MediaGalleryProps {
  images: string[]
  videos?: Array<{
    url: string
    title?: string
    thumbnail?: string
  }>
  virtualTourUrl?: string
  title: string
}

export function MediaGallery({ 
  images, 
  videos = [], 
  virtualTourUrl, 
  title 
}: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mediaType, setMediaType] = useState<'images' | 'videos'>('images') // Track which media type is active

  // Don't mix images and videos - keep them separate
  const hasImages = images.length > 0
  const hasVideos = videos.length > 0

  // Get current media based on selected type
  const currentMedia = mediaType === 'images' ? images : videos
  const currentItem = mediaType === 'images' 
    ? images[selectedIndex] 
    : videos[selectedIndex]

  return (
    <div className="space-y-4">
      {/* Media Type Tabs */}
      {(hasImages && hasVideos) && (
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => {
              setMediaType('images')
              setSelectedIndex(0)
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              mediaType === 'images'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📸 Images ({images.length})
          </button>
          <button
            onClick={() => {
              setMediaType('videos')
              setSelectedIndex(0)
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              mediaType === 'videos'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🎥 Videos ({videos.length})
          </button>
        </div>
      )}

      {/* Main Media Display */}
      <div className={`relative bg-gray-800 rounded-2xl overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'h-96 md:h-[500px]'
      }`}>
        {/* Close fullscreen button */}
        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Previous/Next buttons - Only show if there are multiple items */}
        {currentMedia.length > 1 && (
          <>
            <button
              onClick={() => setSelectedIndex((selectedIndex - 1 + currentMedia.length) % currentMedia.length)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setSelectedIndex((selectedIndex + 1) % currentMedia.length)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Fullscreen button - Only for images */}
        {!isFullscreen && mediaType === 'images' && currentItem && (
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        )}

        {/* Media Counter */}
        {currentMedia.length > 1 && (
          <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {selectedIndex + 1} / {currentMedia.length}
          </div>
        )}

        {/* Display Image or Video */}
        {mediaType === 'images' ? (
          hasImages ? (
            <Image
              src={images[selectedIndex]}
              alt={`${title} - Image ${selectedIndex + 1}`}
              fill
              className="object-cover cursor-zoom-in"
              onClick={() => setIsFullscreen(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
              <div className="text-center text-white">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-semibold mb-2">No Images Available</h3>
                <p className="text-gray-300">This property doesn't have any photos yet.</p>
              </div>
            </div>
          )
        ) : (
          hasVideos ? (
            videos[selectedIndex]?.url ? (
               <VideoPlayer
                 url={videos[selectedIndex].url}
                   title={videos[selectedIndex].title || `${title} - Video ${selectedIndex + 1}`}
                   className="h-full"
                     controls={true}
                      />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                <div className="text-center text-white">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-semibold">Video Not Available</p>
                  <p className="text-sm text-gray-300">This video cannot be displayed</p>
                </div>
              </div>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
              <div className="text-center text-white">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-semibold mb-2">No Videos Available</h3>
                <p className="text-gray-300">This property doesn't have any videos yet.</p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Thumbnail Strip - Show based on active media type */}
      {mediaType === 'images' && images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                selectedIndex === index 
                  ? 'border-amber-500 scale-105' 
                  : 'border-gray-600 hover:border-amber-400'
              }`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}

      {/* Video Thumbnail Strip */}
      {mediaType === 'videos' && videos.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-4">
          {videos.map((video, index) => (
            <button
              key={`video-${index}`}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 bg-gray-800 flex items-center justify-center ${
                selectedIndex === index 
                  ? 'border-amber-500 scale-105' 
                  : 'border-gray-600 hover:border-amber-400'
              }`}
            >
              <div className="text-center">
                <svg className="w-6 h-6 text-white mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span className="text-xs text-white">
                  {video.title || `Video ${index + 1}`}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Virtual Tour Section */}
      {virtualTourUrl && (
        <div className="bg-gray-800 rounded-2xl p-6">
          <h3 className="text-2xl font-bold text-white mb-4">Virtual Tour</h3>
          <div className="rounded-xl overflow-hidden border border-gray-600">
            <iframe
              src={virtualTourUrl}
              className="w-full h-96"
              allowFullScreen
              loading="lazy"
              title={`Virtual tour of ${title}`}
            />
          </div>
        </div>
      )}
    </div>
  )
}