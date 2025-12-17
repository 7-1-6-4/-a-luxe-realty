// components/OptimizedSearchBar.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown, MapPin, Building, DollarSign, Tag, X, Filter, Bed, Bath, Maximize2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'villa', label: 'Villa' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'house', label: 'House' },
  { value: 'condo', label: 'Condo' },
  { value: 'maisonette', label: 'Maisonette' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'beachfront', label: 'Beachfront' }
]

const POPULAR_LOCATIONS = [
  'Kikuyu', 'Kiambu', 'Kitusuru', 'Thika',
  'Karen', 'Runda Estate', 'Westlands', 'Lavington', 'Kilimani',
  'Runda', 'Upper Hill', 'Muthaiga', 'Kileleshwa', 'Langata',
  'Ruaraka', 'Ruaka', 'Ruiru', 'Ngong', 'Syokimau',
  'State House Road', 'Parklands', 'Hurlingham', 'Eastern Bypass',
  'Ngara'
]

const AMENITIES = [
  'Swimming Pool', 'Gym', 'Parking', 'Security', 'Garden', 'Balcony',
  'Elevator', 'Backup Generator', 'Water Backup', 'Playground', 'Club House'
]

export default function OptimizedSearchBar() {
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([])
  const [selectedListingType, setSelectedListingType] = useState('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showPropertyTypeDropdown, setShowPropertyTypeDropdown] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // Advanced filters
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [minSize, setMinSize] = useState('')
  const [maxSize, setMaxSize] = useState('')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  
  const locationInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const propertyTypeDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
      if (propertyTypeDropdownRef.current && !propertyTypeDropdownRef.current.contains(event.target as Node)) {
        setShowPropertyTypeDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const togglePropertyType = (type: string) => {
    setSelectedPropertyTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    )
  }

  const selectLocation = (location: string) => {
    setSelectedLocation(location)
    setIsDropdownOpen(false)
    if (locationInputRef.current) {
      locationInputRef.current.value = location
    }
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    
    if (selectedLocation) params.set('location', selectedLocation)
    if (selectedPropertyTypes.length > 0) params.set('property_types', selectedPropertyTypes.join(','))
    if (selectedListingType) params.set('listing_type', selectedListingType)
    if (priceMin) params.set('price_min', priceMin)
    if (priceMax) params.set('price_max', priceMax)
    if (bedrooms) params.set('bedrooms', bedrooms)
    if (bathrooms) params.set('bathrooms', bathrooms)
    if (minSize) params.set('min_size', minSize)
    if (maxSize) params.set('max_size', maxSize)
    if (selectedAmenities.length > 0) params.set('amenities', selectedAmenities.join(','))
    
    window.location.href = `/search?${params.toString()}`
  }

  const clearFilters = () => {
    setSelectedLocation('')
    setSelectedPropertyTypes([])
    setSelectedListingType('')
    setPriceMin('')
    setPriceMax('')
    setBedrooms('')
    setBathrooms('')
    setMinSize('')
    setMaxSize('')
    setSelectedAmenities([])
    if (locationInputRef.current) {
      locationInputRef.current.value = ''
    }
  }

  const activeFiltersCount = 
    selectedPropertyTypes.length + 
    (priceMin || priceMax ? 1 : 0) +
    (bedrooms ? 1 : 0) +
    (bathrooms ? 1 : 0) +
    (minSize || maxSize ? 1 : 0) +
    selectedAmenities.length

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/40">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Location - 3 columns */}
          <div className="md:col-span-3 relative" ref={dropdownRef}>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <label className="text-sm font-medium text-gray-300">Location</label>
            </div>
            <div className="relative">
              <input
                ref={locationInputRef}
                type="text"
                placeholder="Enter city or area"
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-3.5 bg-white/5 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              <ChevronDown className="absolute right-3 top-3.5 text-gray-400 w-5 h-5 pointer-events-none" />
              
              {isDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <p className="text-sm text-gray-400 px-3 py-2">Popular Locations</p>
                    {POPULAR_LOCATIONS.map((location) => (
                      <button
                        key={location}
                        onClick={() => selectLocation(location)}
                        className="w-full text-left px-3 py-2.5 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Property Type - 2 columns with multi-select */}
          <div className="md:col-span-2 relative" ref={propertyTypeDropdownRef}>
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-4 h-4 text-amber-400" />
              <label className="text-sm font-medium text-gray-300">Property Type</label>
            </div>
            <button
              onClick={() => setShowPropertyTypeDropdown(!showPropertyTypeDropdown)}
              className="w-full px-4 py-3.5 bg-white/5 border border-gray-600 rounded-xl text-left text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all flex items-center justify-between"
            >
              <span className="truncate text-sm">
                {selectedPropertyTypes.length === 0
                  ? 'All Types'
                  : selectedPropertyTypes.length === 1
                  ? PROPERTY_TYPES.find(t => t.value === selectedPropertyTypes[0])?.label
                  : `${selectedPropertyTypes.length} selected`}
              </span>
              <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </button>
            
            {showPropertyTypeDropdown && (
              <div className="absolute z-50 mt-1 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-2 max-h-60 overflow-y-auto">
                {PROPERTY_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPropertyTypes.includes(type.value)}
                      onChange={() => togglePropertyType(type.value)}
                      className="w-4 h-4 rounded border-gray-600 text-amber-500"
                    />
                    <span className="text-gray-300 text-sm">{type.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Listing Type - 2 columns */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-amber-400" />
              <label className="text-sm font-medium text-gray-300">Listing Type</label>
            </div>
            <select
              value={selectedListingType}
              onChange={(e) => setSelectedListingType(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/5 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none"
            >
              <option value="" className="bg-gray-800">All Listings</option>
              <option value="sale" className="bg-gray-800">For Sale</option>
              <option value="rent" className="bg-gray-800">For Rent</option>
            </select>
          </div>

          {/* Price Range - 3 columns */}
          <div className="md:col-span-3">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <label className="text-sm font-medium text-gray-300">Price (Ksh)</label>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-1/2 px-3 py-3.5 bg-white/5 border border-gray-600 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
              <input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-1/2 px-3 py-3.5 bg-white/5 border border-gray-600 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          {/* Search Button - 2 columns */}
          <div className="md:col-span-2 self-end">
            <Button
              onClick={handleSearch}
              className="w-full h-full min-h-[56px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search
            </Button>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg border border-gray-700 transition-colors text-sm"
          >
            <Filter className="h-4 w-4" />
            Advanced Filters
            {activeFiltersCount > 0 && (
              <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
          
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-amber-400 hover:text-amber-300 text-sm"
            >
              <X className="h-4 w-4" />
              Clear All
            </button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
          <div className="mt-4 p-4 bg-white/5 rounded-xl border border-gray-700/50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                  <Bed className="h-4 w-4" />
                  Bedrooms
                </label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="" className="bg-gray-800">Any</option>
                  <option value="1" className="bg-gray-800">1+</option>
                  <option value="2" className="bg-gray-800">2+</option>
                  <option value="3" className="bg-gray-800">3+</option>
                  <option value="4" className="bg-gray-800">4+</option>
                  <option value="5" className="bg-gray-800">5+</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                  <Bath className="h-4 w-4" />
                  Bathrooms
                </label>
                <select
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="" className="bg-gray-800">Any</option>
                  <option value="1" className="bg-gray-800">1+</option>
                  <option value="2" className="bg-gray-800">2+</option>
                  <option value="3" className="bg-gray-800">3+</option>
                  <option value="4" className="bg-gray-800">4+</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                  <Maximize2 className="h-4 w-4" />
                  Size (sq ft)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minSize}
                    onChange={(e) => setMinSize(e.target.value)}
                    className="w-1/2 px-3 py-2 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxSize}
                    onChange={(e) => setMaxSize(e.target.value)}
                    className="w-1/2 px-3 py-2 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                <Sparkles className="h-4 w-4" />
                Amenities
              </label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((amenity) => (
                  <button
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                      selectedAmenities.includes(amenity)
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-white/5 border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}