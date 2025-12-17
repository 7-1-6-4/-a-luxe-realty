// app/agents/properties/edit/[id]/page.tsx - WITH FILE UPLOAD, YOUTUBE SUPPORT & LISTING_TYPE
'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase-optimized'
import { useParams, useRouter } from 'next/navigation'
const supabase = getSupabase()
import { VideoPlayer } from '@/components/properties/video-player'
import Image from 'next/image'

// Define proper TypeScript interfaces
interface Property {
  id: string
  title: string
  description: string
  price: number
  property_type: string
  listing_type: string // ADDED: For sale/rent
  status: string
  bedrooms?: number
  bathrooms?: number
  square_feet?: number
  lot_size?: number
  year_built?: number
  address: string
  city: string
  state?: string
  zip_code?: string
  neighborhood?: string
  agent_id?: string
  images: string[]
  video_url?: string
  virtual_tour_url?: string
  thumbnail_image?: string
  created_at: string
  updated_at: string
}

interface PropertyFormData {
  title: string
  description: string
  price: string
  property_type: string
  listing_type: string // ADDED: For sale/rent
  status: string
  bedrooms: string
  bathrooms: string
  square_feet: string
  lot_size: string
  year_built: string
  address: string
  city: string
  state: string
  zip_code: string
  neighborhood: string
  // URL fields
  image_urls: string[]
  video_url: string
  virtual_tour_url: string
}

interface AgentData {
  id: string
  user_id: string
}

// Helper function to generate preview URLs
const generatePreviewUrl = (file: File): string => {
  return URL.createObjectURL(file)
}

export default function AgentEditPropertyPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isAuthorized, setIsAuthorized] = useState(false)
  
  // File states
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [virtualTourFile, setVirtualTourFile] = useState<File | null>(null)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [virtualTourPreview, setVirtualTourPreview] = useState<string | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState('')
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    price: '',
    property_type: 'house',
    listing_type: 'sale', // ADDED: Default to 'sale'
    status: 'available',
    bedrooms: '',
    bathrooms: '',
    square_feet: '',
    lot_size: '',
    year_built: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    neighborhood: '',
    image_urls: [],
    video_url: '',
    virtual_tour_url: ''
  })

  // Preview management useEffect
  useEffect(() => {
    // Generate image previews
    const newImagePreviews = imageFiles.map(file => generatePreviewUrl(file))
    setImagePreviews(newImagePreviews)
    
    // Generate video preview if exists
    if (videoFile) {
      setVideoPreview(generatePreviewUrl(videoFile))
    }
    
    // Generate virtual tour preview if exists
    if (virtualTourFile) {
      setVirtualTourPreview(generatePreviewUrl(virtualTourFile))
    }
    
    // Cleanup old previews
    return () => {
      newImagePreviews.forEach(url => URL.revokeObjectURL(url))
      if (videoPreview) URL.revokeObjectURL(videoPreview)
      if (virtualTourPreview) URL.revokeObjectURL(virtualTourPreview)
    }
  }, [imageFiles, videoFile, virtualTourFile])

  // Wrap fetchProperty in useCallback to avoid infinite re-renders
  const fetchProperty = useCallback(async () => {
    if (!user?.id || user.role !== 'agent' || !propertyId) return;
    
    try {
      console.log('🔍 Fetching property with ID:', propertyId)
      
      // Get agent ID
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (agentError) {
        console.error('❌ Agent error:', agentError)
        throw agentError
      }

      if (agentData) {
        const typedAgentData = agentData as AgentData;
        
        // Get property assigned to this agent
        const { data: property, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', propertyId)
          .eq('agent_id', typedAgentData.id)
          .single()

        if (error) {
          console.error('❌ Property fetch error:', error)
          if (error.code === 'PGRST116') {
            setIsAuthorized(false)
            return
          }
          throw error
        }

        if (property) {
          setIsAuthorized(true)
          const propertyData = property as Property
          
          setFormData({
            title: propertyData.title || '',
            description: propertyData.description || '',
            price: propertyData.price?.toString() || '',
            property_type: propertyData.property_type || 'house',
            listing_type: propertyData.listing_type || 'sale', // ADDED: Load listing_type
            status: propertyData.status || 'available',
            bedrooms: propertyData.bedrooms?.toString() || '',
            bathrooms: propertyData.bathrooms?.toString() || '',
            square_feet: propertyData.square_feet?.toString() || '',
            lot_size: propertyData.lot_size?.toString() || '',
            year_built: propertyData.year_built?.toString() || '',
            address: propertyData.address || '',
            city: propertyData.city || '',
            state: propertyData.state || '',
            zip_code: propertyData.zip_code || '',
            neighborhood: propertyData.neighborhood || '',
            image_urls: propertyData.images || [],
            video_url: propertyData.video_url || '',
            virtual_tour_url: propertyData.virtual_tour_url || ''
          })

          setExistingImages(propertyData.images || [])
        }
      }
    } catch (error) {
      console.error('💥 Error fetching property:', error)
      alert('Failed to load property details.')
    } finally {
      setLoading(false)
    }
  }, [user, propertyId])

  useEffect(() => {
    if (user?.role === 'agent') {
      fetchProperty()
    }
  }, [user, propertyId, fetchProperty])

  // File validation function
  const validateFile = (file: File, type: 'image' | 'video' | 'tour'): string | null => {
    const maxSizes = {
      image: 10 * 1024 * 1024, // 10MB
      video: 100 * 1024 * 1024, // 100MB
      tour: 50 * 1024 * 1024 // 50MB
    }
    
    if (file.size > maxSizes[type]) {
      return `File size too large. Maximum ${maxSizes[type] / (1024 * 1024)}MB allowed`
    }

    // Format validation
    if (type === 'image') {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validImageTypes.includes(file.type)) {
        return 'Invalid image format. Supported: JPG, PNG, WebP'
      }
    }

    if (type === 'video') {
      const validVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm']
      if (!validVideoTypes.includes(file.type)) {
        return 'Invalid video format. Supported: MP4, MOV, AVI, WebM'
      }
    }

    if (type === 'tour') {
      const validTourTypes = [
        'video/mp4', 'video/mov', 'video/avi', 'video/webm',
        'application/pdf', 
        'application/zip',
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp'
      ]
      if (!validTourTypes.includes(file.type)) {
        return 'Invalid virtual tour format. Supported: Videos, PDF, ZIP, Images'
      }
    }

    return null
  }

  // URL validation function - UPDATED TO ACCEPT YOUTUBE/VIMEO
  const validateUrl = (url: string, type: 'image' | 'video' | 'tour'): string | null => {
    if (!url.trim()) return null // Empty URLs are allowed (optional)
    
    try {
      // For virtual tours, allow YouTube/Vimeo URLs
      if (type === 'tour') {
        // Allow YouTube, Vimeo, Matterport, Kuula, and direct links
        if (url.includes('youtube.com') || url.includes('youtu.be') || 
            url.includes('vimeo.com') || url.includes('matterport.com') || 
            url.includes('kuula.co')) {
          return null
        }
      }
      
      // For videos, allow YouTube/Vimeo and direct video files
      if (type === 'video') {
        if (url.includes('youtube.com') || url.includes('youtu.be') || 
            url.includes('vimeo.com')) {
          return null
        }
        
        const videoExtensions = ['.mp4', '.mov', '.avi', '.webm']
        if (!videoExtensions.some(ext => url.toLowerCase().includes(ext))) {
          return 'URL should point to a video file (mp4, mov, avi, webm) or YouTube/Vimeo link'
        }
      }

      if (type === 'image') {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
        if (!imageExtensions.some(ext => url.toLowerCase().includes(ext))) {
          return 'URL should point to an image file (jpg, jpeg, png, webp, gif)'
        }
      }

      const urlObj = new URL(url)
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return 'URL must start with http:// or https://'
      }

      return null
    } catch {
      return 'Please enter a valid URL'
    }
  }

  // File handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const validationErrors: string[] = []

      files.forEach(file => {
        const error = validateFile(file, 'image')
        if (error) validationErrors.push(error)
      })

      if (validationErrors.length > 0) {
        alert(validationErrors.join('\n'))
        e.target.value = ''
        setImageFiles([])
      } else {
        setImageFiles(files)
        setErrors(prev => ({ ...prev, images: '' }))
      }
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const error = validateFile(file, 'video')
      
      if (error) {
        alert(error)
        e.target.value = ''
        setVideoFile(null)
      } else {
        setVideoFile(file)
        setErrors(prev => ({ ...prev, video: '' }))
      }
    }
  }

  const handleVirtualTourChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const error = validateFile(file, 'tour')
      
      if (error) {
        alert(error)
        e.target.value = ''
        setVirtualTourFile(null)
      } else {
        setVirtualTourFile(file)
        setErrors(prev => ({ ...prev, virtual_tour: '' }))
      }
    }
  }

  // Image URL handlers
  const handleAddImageUrl = (): void => {
    if (currentImageUrl.trim()) {
      const error = validateUrl(currentImageUrl, 'image')
      if (error) {
        alert(error)
        return
      }
      
      setFormData(prev => ({
        ...prev,
        image_urls: [...prev.image_urls, currentImageUrl.trim()]
      }))
      setCurrentImageUrl('')
      setErrors(prev => ({ ...prev, image_urls: '' }))
    }
  }

  const handleRemoveImageUrl = (index: number): void => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }))
  }

  const handleRemoveImage = (index: number): void => {
    const newImageFiles = [...imageFiles]
    const newImagePreviews = [...imagePreviews]
    
    URL.revokeObjectURL(newImagePreviews[index])
    
    newImageFiles.splice(index, 1)
    newImagePreviews.splice(index, 1)
    
    setImageFiles(newImageFiles)
    setImagePreviews(newImagePreviews)
  }

  // FIXED: Handle removing existing images properly
  const handleRemoveExistingImage = (index: number): void => {
    const imageToDelete = existingImages[index]
    
    // Mark image for deletion from storage (if needed later)
    setImagesToDelete(prev => [...prev, imageToDelete])
    
    // Remove from existing images display
    setExistingImages(prev => prev.filter((_, i) => i !== index))
    
    // Also remove from formData.image_urls to prevent duplicates
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter(url => url !== imageToDelete)
    }))
  }

  // Video URL handler
  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, video_url: value }))
    
    if (value.trim()) {
      const error = validateUrl(value, 'video')
      if (error) {
        setErrors(prev => ({ ...prev, video_url: error }))
      } else {
        setErrors(prev => ({ ...prev, video_url: '' }))
      }
    } else {
      setErrors(prev => ({ ...prev, video_url: '' }))
    }
  }

  // Virtual Tour URL handler
  const handleVirtualTourUrlChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, virtual_tour_url: value }))
    
    if (value.trim()) {
      const error = validateUrl(value, 'tour')
      if (error) {
        setErrors(prev => ({ ...prev, virtual_tour_url: error }))
      } else {
        setErrors(prev => ({ ...prev, virtual_tour_url: '' }))
      }
    } else {
      setErrors(prev => ({ ...prev, virtual_tour_url: '' }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    
    // At least one image source is required
    if (existingImages.length === 0 && imageFiles.length === 0 && formData.image_urls.length === 0) {
      newErrors.images = 'At least one image is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Upload files to Supabase Storage
  const uploadFile = async (file: File, bucket: string, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${propertyId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    
    console.log(`📤 Uploading to ${bucket}: ${fileName}`)
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file)

    if (uploadError) {
      console.error(`❌ Error uploading to ${bucket}:`, uploadError)
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    console.log(`✅ Upload successful: ${publicUrl}`)
    return publicUrl
  }

  // Upload images
  const uploadImages = async (): Promise<string[]> => {
    if (!imageFiles.length) return []

    const uploadedUrls: string[] = []
    const totalFiles = imageFiles.length
    
    for (let i = 0; i < totalFiles; i++) {
      const file = imageFiles[i]
      try {
        const url = await uploadFile(file, 'property-images', 'images')
        uploadedUrls.push(url)
        
        const progress = ((i + 1) / totalFiles) * 100
        setUploadProgress(progress)
      } catch (error) {
        console.error('❌ Failed to upload image:', error)
        throw new Error(`Failed to upload image: ${file.name}`)
      }
    }
    
    return uploadedUrls
  }

  // Upload video
  const uploadVideo = async (): Promise<string | null> => {
    if (!videoFile) return null

    try {
      console.log('🎥 Uploading video file...')
      const videoUrl = await uploadFile(videoFile, 'property-videos', 'videos')
      console.log('✅ Video uploaded:', videoUrl)
      return videoUrl
    } catch (error) {
      console.error('❌ Failed to upload video:', error)
      throw new Error('Failed to upload video')
    }
  }

  // Upload virtual tour
  const uploadVirtualTour = async (): Promise<string | null> => {
    if (!virtualTourFile) return null

    try {
      console.log('🔄 Uploading virtual tour file...')
      const virtualTourUrl = await uploadFile(virtualTourFile, 'virtual-tours', 'tours')
      console.log('✅ Virtual tour uploaded:', virtualTourUrl)
      return virtualTourUrl
    } catch (error) {
      console.error('❌ Failed to upload virtual tour:', error)
      throw new Error('Failed to upload virtual tour')
    }
  }

  // FIXED: handleSubmit function with duplicate image prevention
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      alert('Please fix the form errors before submitting')
      return
    }

    setSaving(true)
    setUploadProgress(0)

    try {
      console.log('📊 Current image counts:', {
        existingImages: existingImages.length,
        imageFiles: imageFiles.length,
        formDataImageUrls: formData.image_urls.length,
        imagesToDelete: imagesToDelete.length
      })

      // Upload all new files
      console.log('📤 Starting file uploads...')
      
      const [uploadedImageUrls, uploadedVideoUrl, uploadedVirtualTourUrl] = await Promise.all([
        uploadImages(),
        uploadVideo(),
        uploadVirtualTour()
      ])

      console.log('✅ Upload results:', {
        uploadedImageUrls: uploadedImageUrls.length,
        uploadedVideoUrl: !!uploadedVideoUrl,
        uploadedVirtualTourUrl: !!uploadedVirtualTourUrl
      })

      // FIXED: Combine images correctly - NO DUPLICATES
      // Create a Set to track all unique image URLs
      const uniqueImageUrls = new Set<string>()
      
      // Add existing images that weren't marked for deletion
      existingImages.forEach(url => uniqueImageUrls.add(url))
      
      // Add newly uploaded images
      uploadedImageUrls.forEach(url => uniqueImageUrls.add(url))
      
      // Add URL images, but skip any that are already in the set
      formData.image_urls.forEach(url => {
        if (!uniqueImageUrls.has(url)) {
          uniqueImageUrls.add(url)
        }
      })
      
      // Convert back to array
      const allImageUrls = Array.from(uniqueImageUrls)

      console.log('🖼️ Final image collection:', {
        totalUniqueImages: allImageUrls.length,
        imagesList: allImageUrls
      })

      // Determine final URLs - prioritize URL over uploaded file
      const finalVideoUrl = formData.video_url || uploadedVideoUrl || null
      const finalVirtualTourUrl = formData.virtual_tour_url || uploadedVirtualTourUrl || null
      const thumbnailImage = allImageUrls.length > 0 ? allImageUrls[0] : null

      console.log('✅ All processing completed')

      // Prepare update data
      const updateData: Record<string, unknown> = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        property_type: formData.property_type,
        listing_type: formData.listing_type,
        status: formData.status,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
        square_feet: formData.square_feet ? parseInt(formData.square_feet) : null,
        lot_size: formData.lot_size ? parseInt(formData.lot_size) : null,
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
        address: formData.address,
        city: formData.city,
        state: formData.state || null,
        zip_code: formData.zip_code || null,
        neighborhood: formData.neighborhood || null,
        updated_at: new Date().toISOString()
      }

      // Add media fields if they exist
      if (allImageUrls.length > 0) {
        updateData.images = allImageUrls
        updateData.thumbnail_image = thumbnailImage
      }
      
      if (finalVideoUrl) updateData.video_url = finalVideoUrl
      if (finalVirtualTourUrl) updateData.virtual_tour_url = finalVirtualTourUrl

      console.log('🔄 Updating property with', allImageUrls.length, 'unique images...')

      // Update property
      const { error: updateError } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', propertyId)

      if (updateError) {
        console.error('❌ Update error:', updateError)
        throw updateError
      }

      console.log('✅ Update successful')
      
      alert(`Property updated successfully! ${allImageUrls.length} images saved.`)
      router.push('/agents/my-properties')

    } catch (error: unknown) {
      console.error('💥 Error updating property:', error)
      
      let errorMessage = 'Failed to update property. Please try again.'
      
      if (error instanceof Error) {
        if (error.message?.includes('row-level security')) {
          errorMessage = 'Permission denied. You may only update properties assigned to you.'
        } else {
          errorMessage = error.message
        }
      }
      
      alert(errorMessage)
    } finally {
      setSaving(false)
      setUploadProgress(0)
    }
  }

  if (user?.role !== 'agent') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">Only agents can access this page.</p>
          <Link href="/dashboard">
            <Button className="bg-amber-500 hover:bg-amber-600">Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-2"></div>
          Loading property details...
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-white mb-2">Property Not Found</h1>
          <p className="text-gray-400 mb-6">This property doesn't exist or you don't have permission to edit it.</p>
          <Link href="/agents/my-properties">
            <Button className="bg-amber-500 hover:bg-amber-600">Back to My Properties</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Loading Overlay */}
      {saving && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-2xl flex flex-col items-center space-y-4 min-w-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            <span className="text-white text-lg">Updating property...</span>
            {uploadProgress > 0 && (
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
            <span className="text-gray-400 text-sm">
              {uploadProgress > 0 ? `Uploading files... ${Math.round(uploadProgress)}%` : 'Updating property details...'}
            </span>
          </div>
        </div>
      )}

      <nav className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link href="/agents/my-properties" className="text-white">
              <div className="text-xl font-bold tracking-wider">A-LUXE REALTY</div>
              <div className="text-xs tracking-widest text-gray-300">EDIT PROPERTY</div>
            </Link>
            <Link href="/agents/my-properties">
              <Button variant="outline" className="border-amber-400 text-amber-400">
                ← My Properties
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Edit Property</h1>
            <p className="text-gray-400">Update property details and media</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Property Details */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Property Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${
                      errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-amber-500 focus:ring-amber-500'
                    }`}
                    required
                  />
                  {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
                </div>

                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-white mb-2">
                    Price (KSh) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${
                      errors.price ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-amber-500 focus:ring-amber-500'
                    }`}
                    required
                  />
                  {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
                </div>

                {/* Property Type */}
                <div>
                  <label htmlFor="property_type" className="block text-sm font-medium text-white mb-2">
                    Property Type *
                  </label>
                  <select
                    id="property_type"
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    required
                  >
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="villa">Villa</option>
                    <option value="land">Land</option>
                    <option value="commercial">Commercial</option>
                    <option value="duplex">Duplex</option>
                    <option value="maisonette">Maisonette</option>
                    <option value="beachfront">Beachfront</option>
                    <option value="penthouse">Penthouse</option>
                  </select>
                </div>

                {/* NEW: Listing Type Field */}
                <div>
                  <label htmlFor="listing_type" className="block text-sm font-medium text-white mb-2">
                    Listing Type *
                  </label>
                  <select
                    id="listing_type"
                    name="listing_type"
                    value={formData.listing_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    required
                  >
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    "For Sale" or "For Rent" for rental properties
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-white mb-2">
                    Status *
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    required
                  >
                    <option value="offplan/ongoing">Offplan/Ongoing</option>
                    <option value="ready">Ready</option>
                    <option value="sold-out">Sold-out</option>
                    <option value="complete/ready">Complete/Ready</option>
                    <option value="offplan">Offplan</option>
                  </select>
                </div>

                {/* Bedrooms */}
                <div>
                  <label htmlFor="bedrooms" className="block text-sm font-medium text-white mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    id="bedrooms"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    min="0"
                  />
                </div>

                {/* Bathrooms */}
                <div>
                  <label htmlFor="bathrooms" className="block text-sm font-medium text-white mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    id="bathrooms"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    step="0.5"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    min="0"
                  />
                </div>

                {/* Square Feet */}
                <div>
                  <label htmlFor="square_feet" className="block text-sm font-medium text-white mb-2">
                    Square Feet
                  </label>
                  <input
                    type="number"
                    id="square_feet"
                    name="square_feet"
                    value={formData.square_feet}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    min="0"
                  />
                </div>

                {/* Lot Size */}
                <div>
                  <label htmlFor="lot_size" className="block text-sm font-medium text-white mb-2">
                    Lot Size (sq ft)
                  </label>
                  <input
                    type="number"
                    id="lot_size"
                    name="lot_size"
                    value={formData.lot_size}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    min="0"
                  />
                </div>

                {/* Year Built */}
                <div>
                  <label htmlFor="year_built" className="block text-sm font-medium text-white mb-2">
                    Year Built
                  </label>
                  <input
                    type="number"
                    id="year_built"
                    name="year_built"
                    value={formData.year_built}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-white mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${
                      errors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-amber-500 focus:ring-amber-500'
                    }`}
                    required
                  />
                  {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
                </div>

                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-white mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${
                      errors.city ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-amber-500 focus:ring-amber-500'
                    }`}
                    required
                  />
                  {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                </div>

                {/* Neighborhood */}
                <div>
                  <label htmlFor="neighborhood" className="block text-sm font-medium text-white mb-2">
                    Neighborhood
                  </label>
                  <input
                    type="text"
                    id="neighborhood"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                </div>

                {/* State */}
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-white mb-2">
                    State/County
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                </div>

                {/* ZIP Code */}
                <div>
                  <label htmlFor="zip_code" className="block text-sm font-medium text-white mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="zip_code"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${
                      errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-amber-500 focus:ring-amber-500'
                    }`}
                    required
                  />
                  {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
                </div>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Property Images</h3>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Existing Images ({existingImages.length}):</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {existingImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <div className="relative h-40 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600 hover:border-red-500 transition-colors">
                          <Image
                            src={imageUrl}
                            alt={`Existing image ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            
                          />
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                              <span>⭐</span> Thumbnail
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(index)}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 truncate text-center">
                          Existing Image {index + 1}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File Upload Section */}
              <div className="mb-6">
                <label htmlFor="images" className="block text-sm font-medium text-white mb-2">
                  Upload New Images
                </label>
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-white hover:file:bg-amber-600 ${
                    errors.images ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                <p className="text-sm text-gray-400 mt-2">
                  Upload multiple images (max 10MB each). Supported formats: JPG, PNG, WebP
                </p>
                {imageFiles.length > 0 && (
                  <p className="text-amber-400 text-sm mt-2">
                    {imageFiles.length} new image(s) selected for upload
                  </p>
                )}
              </div>

              {/* New Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">New Image Previews ({imagePreviews.length}):</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imagePreviews.map((previewUrl, index) => (
                      <div key={index} className="relative group">
                        <div className="relative h-40 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600 hover:border-amber-500 transition-colors">
                          <Image
                            src={previewUrl}
                            alt={`Preview ${index + 1}`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 truncate text-center">
                          {imageFiles[index].name}
                        </p>
                        <p className="text-xs text-gray-500 text-center">
                          {Math.round(imageFiles[index].size / 1024)} KB
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* URL Input Section */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-2">
                  Add Image URLs
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={currentImageUrl}
                    onChange={(e) => setCurrentImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                  <Button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4"
                  >
                    Add URL
                  </Button>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Add image URLs one by one. Supported: JPG, PNG, WebP, GIF
                </p>
              </div>

              {/* Display Added Image URLs */}
              {formData.image_urls.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-white font-medium mb-2">Added Image URLs:</h4>
                  <div className="space-y-2">
                    {formData.image_urls.map((url, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3">
                        <span className="text-sm text-gray-300 truncate flex-1 mr-2">{url}</span>
                        <Button
                          type="button"
                          onClick={() => handleRemoveImageUrl(index)}
                          className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errors.images && (
                <p className="text-red-400 text-sm mt-2">{errors.images}</p>
              )}
            </div>

            {/* Video Upload Section - WITH YOUTUBE SUPPORT */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Property Video</h3>
              
              {/* Existing Video */}
{formData.video_url && (
  <div className="mb-6">
    <h4 className="text-white font-medium mb-3">Existing Video:</h4>
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
      <VideoPlayer 
        url={formData.video_url} 
        title={`${formData.title} - Video Tour`}
        className="h-64"
        controls={true}
      />
      <div className="p-3 bg-gray-800">
        <p className="text-sm text-gray-300 truncate">
          {formData.video_url}
        </p>
      </div>
    </div>
  </div>
)}

              {/* File Upload Section */}
              <div className="mb-6">
                <label htmlFor="video" className="block text-sm font-medium text-white mb-2">
                  Upload New Video (Optional)
                </label>
                <input
                  type="file"
                  id="video"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-white hover:file:bg-amber-600"
                />
                <p className="text-sm text-gray-400 mt-2">
                  Upload a video tour (max 100MB). Supported formats: MP4, MOV, AVI, WebM
                </p>
                {videoFile && (
                  <p className="text-amber-400 text-sm mt-2">
                    New video selected for upload: {videoFile.name}
                  </p>
                )}
              </div>

              {/* Video Preview */}
              {videoPreview && (
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">New Video Preview:</h4>
                  <div className="relative bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full max-h-64 object-contain"
                    />
                    <div className="p-3 bg-gray-800">
                      <p className="text-sm text-gray-300">
                        {videoFile?.name} ({Math.round((videoFile?.size || 0) / 1024)} KB)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* URL Input Section - ACCEPTS YOUTUBE/VIMEO */}
              <div>
                <label htmlFor="video_url" className="block text-sm font-medium text-white mb-2">
                  Or Enter Video URL (Optional)
                </label>
                <input
                  type="url"
                  id="video_url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleVideoUrlChange}
                  placeholder="https://youtube.com/watch?v=... or https://example.com/video.mp4"
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${
                    errors.video_url ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-amber-500 focus:ring-amber-500'
                  }`}
                />
                {errors.video_url && (
                  <p className="text-red-400 text-sm mt-1">{errors.video_url}</p>
                )}
                <p className="text-sm text-gray-400 mt-2">
                  Enter a direct video URL (MP4, MOV, AVI, WebM) or YouTube/Vimeo link
                </p>
              </div>
            </div>

            {/* Virtual Tour Upload Section - WITH 3D TOUR SUPPORT */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Virtual Tour</h3>
              
              {/* Existing Virtual Tour */}
              {formData.virtual_tour_url && (
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Existing Virtual Tour:</h4>
                  <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                    {formData.virtual_tour_url.includes('youtube.com') || formData.virtual_tour_url.includes('youtu.be') ? (
                      <div className="p-4 text-center">
                        <div className="text-4xl mb-2">🎥</div>
                        <p className="text-gray-300">YouTube Virtual Tour</p>
                        <a href={formData.virtual_tour_url} target="_blank" rel="noopener noreferrer" 
                          className="text-amber-400 hover:text-amber-300 text-sm inline-block mt-1">
                          {formData.virtual_tour_url}
                        </a>
                      </div>
                    ) : formData.virtual_tour_url.includes('vimeo.com') ? (
                      <div className="p-4 text-center">
                        <div className="text-4xl mb-2">🎬</div>
                        <p className="text-gray-300">Vimeo Virtual Tour</p>
                        <a href={formData.virtual_tour_url} target="_blank" rel="noopener noreferrer" 
                          className="text-amber-400 hover:text-amber-300 text-sm inline-block mt-1">
                          {formData.virtual_tour_url}
                        </a>
                      </div>
                    ) : formData.virtual_tour_url.includes('matterport.com') || formData.virtual_tour_url.includes('kuula.co') ? (
                      <div className="p-4 text-center">
                        <div className="text-4xl mb-2">🏠</div>
                        <p className="text-gray-300">3D Virtual Tour</p>
                        <a href={formData.virtual_tour_url} target="_blank" rel="noopener noreferrer" 
                          className="text-amber-400 hover:text-amber-300 text-sm inline-block mt-1">
                          {formData.virtual_tour_url}
                        </a>
                      </div>
                    ) : (
                      <div className="p-4 text-center">
                        <div className="text-4xl mb-2">🔗</div>
                        <p className="text-gray-300">External Tour Link</p>
                        <a href={formData.virtual_tour_url} target="_blank" rel="noopener noreferrer" 
                          className="text-amber-400 hover:text-amber-300 text-sm inline-block mt-1">
                          {formData.virtual_tour_url}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* File Upload Section */}
              <div className="mb-6">
                <label htmlFor="virtual_tour" className="block text-sm font-medium text-white mb-2">
                  Upload New Virtual Tour (Optional)
                </label>
                <input
                  type="file"
                  id="virtual_tour"
                  accept=".pdf,.mp4,.mov,.avi,.webm,.jpg,.jpeg,.png,.webp,.zip"
                  onChange={handleVirtualTourChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-white hover:file:bg-amber-600"
                />
                <p className="text-sm text-gray-400 mt-2">
                  Upload virtual tour files (max 50MB). Supported: Videos, PDF, Images, ZIP (3D tours)
                </p>
                {virtualTourFile && (
                  <p className="text-amber-400 text-sm mt-2">
                    New virtual tour selected for upload: {virtualTourFile.name}
                  </p>
                )}
              </div>

              {/* Virtual Tour Preview */}
              {virtualTourPreview && (
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">New Virtual Tour Preview:</h4>
                  <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                    {virtualTourFile?.type.startsWith('image/') ? (
                      <Image
                        src={virtualTourPreview}
                        alt="Virtual tour preview"
                        fill
                        className="w-full max-h-64 object-contain"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : virtualTourFile?.type.startsWith('video/') ? (
                      <video
                        src={virtualTourPreview}
                        controls
                        className="w-full max-h-64 object-contain"
                      />
                    ) : virtualTourFile?.type === 'application/pdf' ? (
                      <div className="p-8 text-center">
                        <div className="text-6xl mb-4">📄</div>
                        <p className="text-gray-300">PDF File: {virtualTourFile?.name}</p>
                        <p className="text-gray-400 text-sm">
                          {Math.round((virtualTourFile?.size || 0) / 1024)} KB
                        </p>
                      </div>
                    ) : virtualTourFile?.type === 'application/zip' ? (
                      <div className="p-8 text-center">
                        <div className="text-6xl mb-4">📦</div>
                        <p className="text-gray-300">ZIP Archive: {virtualTourFile?.name}</p>
                        <p className="text-gray-400 text-sm">
                          {Math.round((virtualTourFile?.size || 0) / 1024)} KB
                        </p>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <div className="text-6xl mb-4">📁</div>
                        <p className="text-gray-300">File: {virtualTourFile?.name}</p>
                        <p className="text-gray-400 text-sm">
                          Type: {virtualTourFile?.type}
                        </p>
                      </div>
                    )}
                    <div className="p-3 bg-gray-800">
                      <p className="text-sm text-gray-300">
                        {virtualTourFile?.name} ({Math.round((virtualTourFile?.size || 0) / 1024)} KB)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* URL Input Section - ACCEPTS ALL TOUR FORMATS */}
              <div>
                <label htmlFor="virtual_tour_url" className="block text-sm font-medium text-white mb-2">
                  Or Enter Virtual Tour URL (Optional)
                </label>
                <input
                  type="url"
                  id="virtual_tour_url"
                  name="virtual_tour_url"
                  value={formData.virtual_tour_url}
                  onChange={handleVirtualTourUrlChange}
                  placeholder="https://youtube.com/watch?v=... or https://matterport.com/show/?m=..."
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${
                    errors.virtual_tour_url ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-amber-500 focus:ring-amber-500'
                  }`}
                />
                {errors.virtual_tour_url && (
                  <p className="text-red-400 text-sm mt-1">{errors.virtual_tour_url}</p>
                )}
                <p className="text-sm text-gray-400 mt-2">
                  Enter a virtual tour URL (YouTube, Vimeo, Matterport, Kuula, or direct link)
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/agents/my-properties')}
                className="flex-1 border-gray-600 text-pink-500 hover:bg-gray-700 hover:text-white"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3"
              >
                {saving ? 'Updating Property...' : 'Update Property'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}