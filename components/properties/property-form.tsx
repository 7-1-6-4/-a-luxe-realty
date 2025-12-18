// components/properties/property-form.tsx - WITH FEATURED FIELD ADDED
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { getSupabase } from '@/lib/supabase-optimized'
const supabase = getSupabase()
import { useRouter } from 'next/navigation'
import { debounce } from '@/lib/performance-utils'
import Image from 'next/image'

interface PropertyFormProps {
  currentUser: {
    id: string
    role: string
    full_name: string
  }
}

interface Agent {
  id: string
  user_id: string
  users: {
    full_name: string
    email: string
    phone: string | null
  }[]
}

interface AgentInfo {
  full_name: string
  email: string
  phone: string | null
}

interface PropertyFormData {
  title: string
  description: string
  price: string
  property_type: string
  listing_type: string
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
  agent_id: string
  image_urls: string[]
  video_url: string
  virtual_tour_url: string
  featured: boolean // NEW: Added featured field
}

interface PropertyUpdateData {
  images?: string[]
  video_url?: string | null
  virtual_tour_url?: string | null
  thumbnail_image?: string | null
}

interface DraftData {
  formData: PropertyFormData
  imageFiles: number
  videoFile: string | null
  virtualTourFile: string | null
  savedAt: string
}

// Helper function to generate preview URLs
const generatePreviewUrl = (file: File): string => {
  return URL.createObjectURL(file)
}

// Agent Contact Card Component
function AgentContactCard({ agentId, propertyTitle }: { agentId: string; propertyTitle: string }) {
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAgentInfo = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Fetching agent info for ID:', agentId)

      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('user_id')
        .eq('id', agentId)
        .single()

      if (agentError) {
        console.error('❌ Error fetching agent:', agentError)
        setError('Agent not found')
        return
      }

      if (!agentData) {
        setError('Agent not found')
        return
      }

      console.log('✅ Found agent with user_id:', agentData.user_id)

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('full_name, email, phone')
        .eq('id', agentData.user_id)
        .single()

      if (userError) {
        console.error('❌ Error fetching user:', userError)
        setError('Agent user information not available')
        return
      }

      if (userData) {
        console.log('✅ Found user data:', userData)
        setAgentInfo(userData)
      } else {
        setError('Agent user information not found')
      }

    } catch (error) {
      console.error('💥 Unexpected error:', error)
      setError('Failed to load agent information')
    } finally {
      setLoading(false)
    }
  }, [agentId])

  useEffect(() => {
    if (agentId) {
      fetchAgentInfo()
    }
  }, [agentId, fetchAgentInfo])

  const handleCall = () => {
    if (agentInfo?.phone) {
      window.open(`tel:${agentInfo.phone}`, '_self')
    }
  }

  const handleEmail = () => {
    if (agentInfo?.email) {
      const subject = `Inquiry about: ${propertyTitle}`
      const body = `Hello ${agentInfo.full_name},\n\nI am interested in the property: ${propertyTitle}.\n\nPlease contact me with more information.`
      window.open(`mailto:${agentInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self')
    }
  }

  const handleWhatsApp = () => {
    if (agentInfo?.phone) {
      const message = `Hello! I'm interested in the property: ${propertyTitle}. Please send me more information.`
      window.open(`https://wa.me/${agentInfo.phone.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-amber-500/30">
        <div className="text-gray-400">Loading agent information...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-red-500/30">
        <div className="text-red-400">
          <p className="font-semibold">Agent Not Found</p>
          <p className="text-sm mt-1">Please check the Agent ID</p>
          <p className="text-xs text-gray-400 mt-2">ID: {agentId}</p>
        </div>
      </div>
    )
  }

  if (!agentInfo) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-amber-500/30">
        <div className="text-gray-400">Agent information not available</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-amber-500/30">
      <h3 className="text-xl font-semibold text-amber-400 mb-4">Contact Agent</h3>
      
      <div className="mb-4">
        <h4 className="text-white font-semibold text-lg">{agentInfo.full_name}</h4>
        <p className="text-gray-400 text-sm">Licensed Real Estate Agent</p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleCall}
          disabled={!agentInfo.phone}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 transition-all duration-300"
        >
          📞 Call Agent
          {agentInfo.phone && (
            <span className="ml-2 text-sm opacity-90">{agentInfo.phone}</span>
          )}
        </Button>

        <Button
          onClick={handleWhatsApp}
          disabled={!agentInfo.phone}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 transition-all duration-300"
        >
          💬 WhatsApp
        </Button>

        <Button
          onClick={handleEmail}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 transition-all duration-300"
        >
          ✉️ Email Agent
        </Button>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Agent will contact you within 24 hours
      </div>
    </div>
  )
}

// Auto-save functionality
const useAutoSave = (
  formData: PropertyFormData, 
  imageFiles: File[], 
  videoFile: File | null, 
  virtualTourFile: File | null
) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const loadDraft = useCallback((): DraftData | null => {
    try {
      const draft = localStorage.getItem('property-draft')
      if (draft) {
        const parsed = JSON.parse(draft) as DraftData
        console.log('📥 Loaded draft:', parsed)
        return parsed
      }
    } catch (error) {
      console.error('Failed to load draft:', error)
    }
    return null
  }, [])

  const clearDraft = useCallback((): void => {
    localStorage.removeItem('property-draft')
    setLastSaved(null)
  }, [])

  const debouncedAutoSave = useCallback(
    debounce((data: unknown) => {
      const formData = data as PropertyFormData
      
      if (!formData.title && !formData.description && imageFiles.length === 0) {
        return
      }

      setIsSaving(true)
      
      try {
        const draftData: DraftData = {
          formData: formData,
          imageFiles: imageFiles.length,
          videoFile: videoFile ? videoFile.name : null,
          virtualTourFile: virtualTourFile ? virtualTourFile.name : null,
          savedAt: new Date().toISOString()
        }
        
        localStorage.setItem('property-draft', JSON.stringify(draftData))
        setLastSaved(new Date())
        
        console.log('💾 Auto-saved draft')
      } catch (error) {
        console.error('Auto-save failed:', error)
      } finally {
        setIsSaving(false)
      }
    }, 2000),
    [imageFiles.length, videoFile, virtualTourFile]
  )

  useEffect(() => {
    debouncedAutoSave(formData)
  }, [formData, debouncedAutoSave])

  return { lastSaved, isSaving, loadDraft, clearDraft }
}

export function PropertyForm({ currentUser }: PropertyFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [virtualTourFile, setVirtualTourFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentImageUrl, setCurrentImageUrl] = useState('')
  
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [virtualTourPreview, setVirtualTourPreview] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    price: '',
    property_type: 'house',
    listing_type: 'sale',
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
    agent_id: '',
    image_urls: [],
    video_url: '',
    virtual_tour_url: '',
    featured: false // NEW: Added default value
  })

  const { lastSaved, isSaving, loadDraft, clearDraft } = useAutoSave(formData, imageFiles, videoFile, virtualTourFile)

  useEffect(() => {
    const draft = loadDraft()
    if (draft && draft.formData) {
      if (confirm('We found an unsaved property draft. Would you like to restore it?')) {
        setFormData(draft.formData)
        if (draft.imageFiles > 0 || draft.videoFile || draft.virtualTourFile) {
          alert(`Note: Your draft had ${draft.imageFiles} images and media files that need to be re-uploaded.`)
        }
      }
    }
  }, [loadDraft])

  useEffect(() => {
    const newImagePreviews = imageFiles.map(file => generatePreviewUrl(file))
    setImagePreviews(newImagePreviews)
    
    if (videoFile) {
      setVideoPreview(generatePreviewUrl(videoFile))
    }
    
    if (virtualTourFile) {
      setVirtualTourPreview(generatePreviewUrl(virtualTourFile))
    }
    
    return () => {
      newImagePreviews.forEach(url => URL.revokeObjectURL(url))
      if (videoPreview) URL.revokeObjectURL(videoPreview)
      if (virtualTourPreview) URL.revokeObjectURL(virtualTourPreview)
    }
  }, [imageFiles, videoFile, virtualTourFile])

  useEffect(() => {
    if (currentUser?.role === 'agent') {
      setFormData(prev => ({ ...prev, agent_id: 'self' }))
    }
  }, [currentUser?.role])

  const validateFile = (file: File, type: 'image' | 'video' | 'tour'): string | null => {
    const maxSizes = {
      image: 10 * 1024 * 1024,
      video: 100 * 1024 * 1024,
      tour: 50 * 1024 * 1024
    }
    
    if (file.size > maxSizes[type]) {
      return `File size too large. Maximum ${maxSizes[type] / (1024 * 1024)}MB allowed`
    }

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

  const validateUrl = (url: string, type: 'image' | 'video' | 'tour'): string | null => {
    if (!url.trim()) return null
    
    try {
      const urlObj = new URL(url)
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return 'URL must start with http:// or https://'
      }

      if (type === 'image') {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
        if (!imageExtensions.some(ext => url.toLowerCase().includes(ext))) {
          return 'URL should point to an image file (jpg, jpeg, png, webp, gif)'
        }
      }

      if (type === 'video') {
        const videoExtensions = ['.mp4', '.mov', '.avi', '.webm']
        if (!videoExtensions.some(ext => url.toLowerCase().includes(ext))) {
          return 'URL should point to a video file (mp4, mov, avi, webm)'
        }
      }

      return null
    } catch {
      return 'Please enter a valid URL'
    }
  }

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

  // NEW: Featured toggle handler
  const handleFeaturedToggle = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const isChecked = e.target.checked
    setFormData(prev => ({ ...prev, featured: isChecked }))
    
    if (isChecked) {
      // Optional: Show a confirmation or note about featured properties
      console.log('⭐ Property marked as featured')
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    
    if (imageFiles.length === 0 && formData.image_urls.length === 0) {
      newErrors.images = 'At least one image is required (upload or URL)'
    }
    
    if (currentUser?.role === 'admin' && !formData.agent_id) {
      newErrors.agent_id = 'Please enter an agent ID'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadFile = async (file: File, bucket: string, folder: string, propertyId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${propertyId}/${Math.random().toString(36).substring(2)}.${fileExt}`
    
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

  const uploadImages = async (propertyId: string): Promise<string[]> => {
    if (!imageFiles.length) return []

    const uploadedUrls: string[] = []
    const totalFiles = imageFiles.length
    
    for (let i = 0; i < totalFiles; i++) {
      const file = imageFiles[i]
      try {
        const url = await uploadFile(file, 'property-images', 'images', propertyId)
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

  const uploadVideo = async (propertyId: string): Promise<string | null> => {
    if (!videoFile) return null

    try {
      console.log('🎥 Uploading video file...')
      const videoUrl = await uploadFile(videoFile, 'property-videos', 'videos', propertyId)
      console.log('✅ Video uploaded:', videoUrl)
      return videoUrl
    } catch (error) {
      console.error('❌ Failed to upload video:', error)
      throw new Error('Failed to upload video')
    }
  }

  const uploadVirtualTour = async (propertyId: string): Promise<string | null> => {
    if (!virtualTourFile) return null

    try {
      console.log('🔄 Uploading virtual tour file...')
      const virtualTourUrl = await uploadFile(virtualTourFile, 'virtual-tours', 'tours', propertyId)
      console.log('✅ Virtual tour uploaded:', virtualTourUrl)
      return virtualTourUrl
    } catch (error) {
      console.error('❌ Failed to upload virtual tour:', error)
      throw new Error('Failed to upload virtual tour')
    }
  }

  const resetForm = (): void => {
    setFormData({
      title: '',
      description: '',
      price: '',
      property_type: 'house',
      listing_type: 'sale',
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
      agent_id: currentUser?.role === 'agent' ? 'self' : '',
      image_urls: [],
      video_url: '',
      virtual_tour_url: '',
      featured: false // NEW: Reset featured to false
    })
    setImageFiles([])
    setImagePreviews([])
    setVideoFile(null)
    setVideoPreview(null)
    setVirtualTourFile(null)
    setVirtualTourPreview(null)
    setCurrentImageUrl('')
    setUploadProgress(0)
    setErrors({})
    clearDraft()
  }

   const handleSubmit = async (e: React.FormEvent): Promise<void> => {
  e.preventDefault()
  
  if (!validateForm()) {
    alert('Please fix the form errors before submitting')
    return
  }

  setLoading(true)
  setUploadProgress(0)

  try {
    let finalAgentId = formData.agent_id

    if (currentUser?.role === 'agent' && formData.agent_id === 'self') {
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .select('id')
        .eq('user_id', currentUser.id)
        .single()
      
      if (agentError) {
        console.error('❌ Agent lookup error:', agentError)
        throw new Error(`Agent profile not found: ${agentError.message}`)
      }

      if (agent) {
        finalAgentId = agent.id
        console.log('✅ Found agent ID:', finalAgentId)
      } else {
        throw new Error('No agent profile found for current user')
      }
    }

    const priceValue = parseFloat(formData.price)

const propertyInsertData = {
  title: formData.title,
  description: formData.description,
  price: priceValue, // ✅ CORRECT - sending number
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
  country: 'Kenya',
  agent_id: finalAgentId || null,
  images: [],
  video_url: null,
  virtual_tour_url: null,
  thumbnail_image: null,
  features: {},
  views_count: 0,
  inquiries_count: 0,
  featured: formData.featured,

  stories: null,
  garage_spaces: null,
  floor_plan_url: null,
  virtual_tour_type: null,
  virtual_tour_provider: null,
  virtual_tour_metadata: {},
  virtual_staging_url: null,
  last_price_change: null,
  previous_price: null,
  days_on_market: null,
  hoa_fee: null,
  property_tax: null,
  utilities_included: [],
  latitude: null,
  longitude: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  listing_date: new Date().toISOString()
}

    console.log('🔄 Attempting to create property with data:', JSON.stringify(propertyInsertData, null, 2))

    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert([propertyInsertData])
      .select()
      .single()

    if (propertyError) {
      console.error('❌ Property creation error details:', {
        message: propertyError.message,
        details: propertyError.details,
        hint: propertyError.hint,
        code: propertyError.code
      })
      throw propertyError
    }

    console.log('✅ Property created:', property.id)

    console.log('📤 Starting media uploads...')
    
    const [uploadedImageUrls, uploadedVideoUrl, uploadedVirtualTourUrl] = await Promise.all([
      uploadImages(property.id),
      uploadVideo(property.id),
      uploadVirtualTour(property.id)
    ])

    const allImageUrls = [...uploadedImageUrls, ...formData.image_urls]
    const finalVideoUrl = formData.video_url || uploadedVideoUrl
    const finalVirtualTourUrl = formData.virtual_tour_url || uploadedVirtualTourUrl

    console.log('✅ All uploads completed:', {
      images: allImageUrls.length,
      video: !!finalVideoUrl,
      virtualTour: !!finalVirtualTourUrl
    })

    const updateData: Record<string, unknown> = {}
    if (allImageUrls.length > 0) {
      updateData.images = allImageUrls
      updateData.thumbnail_image = allImageUrls[0]
    }
    if (finalVideoUrl) updateData.video_url = finalVideoUrl
    if (finalVirtualTourUrl) updateData.virtual_tour_url = finalVirtualTourUrl

    if (Object.keys(updateData).length > 0) {
      console.log('🔄 Updating property with media URLs...')
      const { error: updateError } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', property.id)

      if (updateError) {
        console.error('❌ Property update error:', updateError)
        throw updateError
      }
      console.log('✅ Property updated with media URLs')
    }

    resetForm()
    router.push(`/properties/${property.id}`)
    
  } catch (error) {
    console.error('💥 Error creating property:', error)
    alert('Error creating property: ' + (error instanceof Error ? error.message : 'Unknown error'))
  } finally {
    setLoading(false)
    setUploadProgress(0)
  }
}

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <>
      {/* Auto-save Indicator */}
      <div className="fixed top-4 right-4 z-40">
        {isSaving && (
          <div className="bg-gray-800/90 backdrop-blur-lg rounded-lg px-3 py-2 border border-amber-500/50 flex items-center space-x-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-500"></div>
            <span className="text-white text-sm">Auto-saving...</span>
          </div>
        )}
        {lastSaved && !isSaving && (
          <div className="bg-gray-800/90 backdrop-blur-lg rounded-lg px-3 py-2 border border-green-500/50">
            <span className="text-green-400 text-sm">
              Draft saved {lastSaved.toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-2xl flex flex-col items-center space-y-4 min-w-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            <span className="text-white text-lg">Creating property...</span>
            {uploadProgress > 0 && (
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
            <span className="text-gray-400 text-sm">
              {uploadProgress > 0 ? `Uploading files... ${Math.round(uploadProgress)}%` : 'Setting up property...'}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Content */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Property Details - WITH FEATURED FIELD ADDED */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Property Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
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
                    placeholder="Luxury Villa in Karen"
                    required
                  />
                  {errors.title && (
                    <p className="text-red-400 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

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
                    placeholder="25000000"
                    required
                  />
                  {errors.price && (
                    <p className="text-red-400 text-sm mt-1">{errors.price}</p>
                  )}
                </div>

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
                    <option value="commercial">Commercial</option>
                    <option value="duplex">Duplex</option>
                    <option value="maisonette">Maisonette</option>
                    <option value="beachfront">Beachfront</option>
                    <option value="penthouse">Penthouse</option>
                  </select>
                </div>

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
                    Default is "For Sale" - change to "For Rent" for rental properties
                  </p>
                </div>

                {/* NEW: FEATURED FIELD ADDED HERE */}
                <div className="flex items-center space-x-3 bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center h-5">
                    <input
                      id="featured"
                      name="featured"
                      type="checkbox"
                      checked={formData.featured}
                      onChange={handleFeaturedToggle}
                      className="w-4 h-4 text-amber-500 bg-gray-800 border-gray-600 rounded focus:ring-amber-500 focus:ring-2"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="featured" className="text-white font-medium">
                      Mark as Featured Property
                    </label>
                    <p className="text-xs text-gray-400 mt-1">
                      Featured properties appear prominently on the homepage and search results.
                    </p>
                  </div>
                  {formData.featured && (
                    <div className="text-amber-500">
                      <span className="text-lg">⭐</span>
                    </div>
                  )}
                </div>

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
                    <option value="offplan">Offplan</option>
                    <option value="ready">Ready</option>
                    <option value="complete/ready">Complete/Ready</option>
                    <option value="sold-out">Sold-out</option>
                  </select>
                </div>

                {/* Property Details */}
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
                    placeholder="4"
                    min="0"
                  />
                </div>

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
                    placeholder="2.5"
                    min="0"
                  />
                </div>

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
                    placeholder="2500"
                    min="0"
                  />
                </div>

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
                    placeholder="5000"
                    min="0"
                  />
                </div>

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
                    placeholder="2020"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>

                {/* Location Information */}
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
                    placeholder="123 Main Street"
                    required
                  />
                  {errors.address && (
                    <p className="text-red-400 text-sm mt-1">{errors.address}</p>
                  )}
                </div>

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
                    placeholder="Nairobi"
                    required
                  />
                  {errors.city && (
                    <p className="text-red-400 text-sm mt-1">{errors.city}</p>
                  )}
                </div>

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
                    placeholder="Karen"
                  />
                </div>

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
                    placeholder="Nairobi County"
                  />
                </div>

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
                    placeholder="00502"
                  />
                </div>

                {/* Agent Selection for Admins */}
                {currentUser?.role === 'admin' && (
                  <div className="md:col-span-2">
                    <label htmlFor="agent_id" className="block text-sm font-medium text-white mb-2">
                      Agent ID *
                    </label>
                    <input
                      type="text"
                      id="agent_id"
                      name="agent_id"
                      value={formData.agent_id}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${
                        errors.agent_id ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-amber-500 focus:ring-amber-500'
                      }`}
                      placeholder="Enter Agent UUID"
                      required
                    />
                    {errors.agent_id && (
                      <p className="text-red-400 text-sm mt-1">{errors.agent_id}</p>
                    )}
                    <p className="text-gray-400 text-sm mt-1">
                      Enter the Agent ID (UUID).
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4">
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
                  placeholder="Describe the property features, amenities, and unique selling points..."
                  required
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1">{errors.description}</p>
                )}
              </div>
            </div>

            {/* Rest of the form remains exactly the same */}
            {/* Image Upload Section */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Property Images</h3>
              
              <div className="mb-6">
                <label htmlFor="images" className="block text-sm font-medium text-white mb-2">
                  Upload Images *
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
                    {imageFiles.length} image(s) selected for upload
                  </p>
                )}
              </div>

              {imagePreviews.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Image Previews ({imagePreviews.length} selected):</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imagePreviews.map((previewUrl, index) => (
                      <div key={index} className="relative group">
                        <div className="relative h-40 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600 hover:border-amber-500 transition-colors">
                          <Image
                            src={previewUrl}
                            alt={`Preview ${index + 1}`}
                            fill
                             sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover"
                            unoptimized // Since these are blob URLs
                          />
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                              <span>⭐</span> Thumbnail
                            </div>
                          )}
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
                  <p className="text-sm text-amber-400 mt-3">
                    ⭐ First image will be used as the thumbnail on property cards
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-2">
                  Or Add Image URLs
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

            {/* Video Upload Section */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Property Video</h3>
              
              <div className="mb-6">
                <label htmlFor="video" className="block text-sm font-medium text-white mb-2">
                  Upload Video Tour (Optional)
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
                    Video selected for upload: {videoFile.name}
                  </p>
                )}
              </div>

              {videoPreview && (
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Video Preview:</h4>
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
                  placeholder="https://example.com/video.mp4"
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${
                    errors.video_url ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-amber-500 focus:ring-amber-500'
                  }`}
                />
                {errors.video_url && (
                  <p className="text-red-400 text-sm mt-1">{errors.video_url}</p>
                )}
                <p className="text-sm text-gray-400 mt-2">
                  Enter a direct video URL. Supported: MP4, MOV, AVI, WebM
                </p>
              </div>
            </div>

            {/* Virtual Tour Upload Section */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Virtual Tour</h3>
              
              <div className="mb-6">
                <label htmlFor="virtual_tour" className="block text-sm font-medium text-white mb-2">
                  Upload Virtual Tour (Optional)
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
                    Virtual tour selected for upload: {virtualTourFile.name}
                  </p>
                )}
              </div>

              {virtualTourPreview && (
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Virtual Tour Preview:</h4>
                  <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                    {virtualTourFile?.type.startsWith('image/') ? (
                      <img
                        src={virtualTourPreview}
                        alt="Virtual tour preview"
                        className="w-full max-h-64 object-contain"
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
                  placeholder="https://example.com/tour.html or https://example.com/3d-tour.zip"
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${
                    errors.virtual_tour_url ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-amber-500 focus:ring-amber-500'
                  }`}
                />
                {errors.virtual_tour_url && (
                  <p className="text-red-400 text-sm mt-1">{errors.virtual_tour_url}</p>
                )}
                <p className="text-sm text-gray-400 mt-2">
                  Enter a virtual tour URL (Matterport, YouTube, Vimeo, or direct link)
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (confirm('Are you sure you want to cancel? Your draft will be lost.')) {
                    clearDraft()
                    router.back()
                  }
                }}
                className="flex-1 border-gray-600 text-pink-500 hover:bg-gray-700 hover:text-white transition-all duration-300"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Property...' : 'Create Property'}
              </Button>
            </div>
          </form>
        </div>

        {/* Agent Contact Card Sidebar */}
        <div className="lg:col-span-1">
          {currentUser?.role === 'admin' && formData.agent_id && formData.title && (
            <div className="sticky top-8">
              <AgentContactCard 
                agentId={formData.agent_id}
                propertyTitle={formData.title}
              />
              <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                <h4 className="text-amber-400 font-semibold mb-2">Preview</h4>
                <p className="text-sm text-gray-300">
                  This contact card will appear on the property page for clients to contact the assigned agent.
                </p>
              </div>
            </div>
          )}
          
          {currentUser?.role === 'agent' && (
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-amber-500/30">
              <h3 className="text-xl font-semibold text-amber-400 mb-4">Agent Note</h3>
              <p className="text-gray-300">
                This property will be automatically assigned to you. Clients will contact you directly through your profile contact information.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}