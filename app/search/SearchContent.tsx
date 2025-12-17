'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase-optimized';
import { Property } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Home, MapPin, Filter, Tag, DollarSign, ChevronLeft, X, Bed, Bath, Maximize, Building2, Sparkles } from 'lucide-react';

const supabase = getSupabase();

export default function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    property_types: [] as string[],
    listing_type: '',
    price_min: '',
    price_max: '',
    bedrooms: '',
    bathrooms: '',
    min_size: '',
    max_size: '',
    amenities: [] as string[]
  });

  useEffect(() => {
    const location = searchParams.get('location') || '';
    const property_types = searchParams.get('property_types')?.split(',').filter(Boolean) || [];
    const listing_type = searchParams.get('listing_type') || '';
    const price_min = searchParams.get('price_min') || '';
    const price_max = searchParams.get('price_max') || '';
    const bedrooms = searchParams.get('bedrooms') || '';
    const bathrooms = searchParams.get('bathrooms') || '';
    const min_size = searchParams.get('min_size') || '';
    const max_size = searchParams.get('max_size') || '';
    const amenities = searchParams.get('amenities')?.split(',').filter(Boolean) || [];
    setFilters({ location, property_types, listing_type, price_min, price_max, bedrooms, bathrooms, min_size, max_size, amenities });
  }, [searchParams]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        let query = supabase.from('properties').select('*');
        if (filters.location) {
          query = query.or(`city.ilike.%${filters.location}%,state.ilike.%${filters.location}%,address.ilike.%${filters.location}%,neighborhood.ilike.%${filters.location}%`);
        }
        if (filters.property_types.length > 0) {
          query = query.in('property_type', filters.property_types);
        }
        if (filters.listing_type) {
          query = query.eq('listing_type', filters.listing_type);
        }
        if (filters.price_min) {
          query = query.gte('price', parseInt(filters.price_min));
        }
        if (filters.price_max) {
          query = query.lte('price', parseInt(filters.price_max));
        }
        if (filters.bedrooms) {
          query = query.gte('bedrooms', parseInt(filters.bedrooms));
        }
        if (filters.bathrooms) {
          query = query.gte('bathrooms', parseInt(filters.bathrooms));
        }
        if (filters.min_size) {
          query = query.gte('square_feet', parseInt(filters.min_size));
        }
        if (filters.max_size) {
          query = query.lte('square_feet', parseInt(filters.max_size));
        }
        const { data, error } = await query;
        if (error) throw error;
        let filteredData = data || [];
        if (filters.amenities.length > 0 && filteredData.length > 0) {
          filteredData = filteredData.filter(property => {
            const propertyAmenities = property.amenities || [];
            return filters.amenities.every(amenity => propertyAmenities.includes(amenity));
          });
        }
        setProperties(filteredData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [filters]);

  const getFilterSummary = () => {
    const summary = [];
    if (filters.location) summary.push(`Location: ${filters.location}`);
    if (filters.property_types.length > 0) summary.push(`Types: ${filters.property_types.length}`);
    if (filters.listing_type) summary.push(`Listing: ${filters.listing_type === 'sale' ? 'For Sale' : 'For Rent'}`);
    if (filters.price_min || filters.price_max) {
      summary.push(`Price: ${filters.price_min ? `Ksh ${parseInt(filters.price_min).toLocaleString()}` : 'Any'} - ${filters.price_max ? `Ksh ${parseInt(filters.price_max).toLocaleString()}` : 'Any'}`);
    }
    if (filters.bedrooms) summary.push(`${filters.bedrooms}+ Beds`);
    if (filters.bathrooms) summary.push(`${filters.bathrooms}+ Baths`);
    if (filters.amenities.length > 0) summary.push(`${filters.amenities.length} Amenities`);
    return summary.length > 0 ? summary.join(' • ') : 'All Properties';
  };

  const getListingTypeInfo = (listingType: string) => {
    return listingType === 'sale' 
      ? { label: 'FOR SALE', color: 'bg-green-500', borderColor: 'border-green-500' }
      : { label: 'FOR RENT', color: 'bg-blue-500', borderColor: 'border-blue-500' };
  };

  const formatSquareFeet = (sqft: number | null) => {
    if (!sqft) return '0';
    if (sqft >= 1000) return sqft % 1000 === 0 ? `${sqft / 1000}K` : `${(sqft / 1000).toFixed(1)}K`;
    return sqft.toString();
  };

  const clearFilter = (filterName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(filterName);
    router.push(`/search?${params.toString()}`);
  };

  const clearAllFilters = () => router.push('/properties');

  const hasActiveFilters = !!(filters.location || filters.property_types.length || filters.listing_type || filters.price_min || filters.price_max || filters.bedrooms || filters.bathrooms || filters.min_size || filters.max_size || filters.amenities.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100/30 via-transparent to-orange-100/30" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-amber-200/20 to-orange-200/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-orange-200/15 to-amber-200/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link href="/properties"><Button variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white transition-all flex items-center gap-2"><ChevronLeft className="w-4 h-4" />Back</Button></Link>
                <Link href="/"><Button variant="outline" className="border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white transition-all flex items-center gap-2"><Home className="w-4 h-4" />Home</Button></Link>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Search Results</h1>
              <p className="text-xl text-gray-700">{getFilterSummary()} • Found <span className="font-bold text-amber-600">{properties.length}</span> properties</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-amber-200">
                <Filter className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-gray-700">{properties.length} matches</span>
              </div>
              <Button onClick={clearAllFilters} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg">New Search</Button>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-amber-200 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 rounded-lg"><Filter className="w-5 h-5 text-amber-600" /></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Active Filters</h3>
                <p className="text-sm text-gray-600">Click × to remove</p>
              </div>
            </div>
            {hasActiveFilters && <Button variant="outline" className="border-red-400 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2" onClick={clearAllFilters}><X className="w-4 h-4" />Clear All</Button>}
          </div>
          
          <div className="flex flex-wrap gap-3">
            {filters.location && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 rounded-xl border border-amber-200 hover:border-amber-400 transition-colors group">
                <MapPin className="w-4 h-4 text-amber-600" /><span className="text-gray-800 font-medium">{filters.location}</span>
                <button onClick={() => clearFilter('location')} className="ml-2 p-1 rounded-full hover:bg-red-100 hover:text-red-600"><X className="w-4 h-4" /></button>
              </div>
            )}
            {filters.property_types.length > 0 && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 rounded-xl border border-amber-200 hover:border-amber-400 transition-colors group">
                <Building2 className="w-4 h-4 text-amber-600" /><span className="text-gray-800 font-medium">{filters.property_types.length} Type{filters.property_types.length > 1 ? 's' : ''}</span>
                <button onClick={() => clearFilter('property_types')} className="ml-2 p-1 rounded-full hover:bg-red-100 hover:text-red-600"><X className="w-4 h-4" /></button>
              </div>
            )}
            {filters.listing_type && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 rounded-xl border border-amber-200 hover:border-amber-400 transition-colors group">
                <Tag className="w-4 h-4 text-amber-600" /><span className="text-gray-800 font-medium">{filters.listing_type === 'sale' ? 'For Sale' : 'For Rent'}</span>
                <button onClick={() => clearFilter('listing_type')} className="ml-2 p-1 rounded-full hover:bg-red-100 hover:text-red-600"><X className="w-4 h-4" /></button>
              </div>
            )}
            {(filters.price_min || filters.price_max) && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 rounded-xl border border-amber-200 hover:border-amber-400 transition-colors group">
                <DollarSign className="w-4 h-4 text-amber-600" />
                <span className="text-gray-800 font-medium">{filters.price_min && `Ksh ${parseInt(filters.price_min).toLocaleString()}`}{filters.price_min && filters.price_max && ' - '}{filters.price_max && `Ksh ${parseInt(filters.price_max).toLocaleString()}`}</span>
                <button onClick={() => { clearFilter('price_min'); clearFilter('price_max'); }} className="ml-2 p-1 rounded-full hover:bg-red-100 hover:text-red-600"><X className="w-4 h-4" /></button>
              </div>
            )}
            {filters.bedrooms && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 rounded-xl border border-amber-200 hover:border-amber-400 transition-colors group">
                <Bed className="w-4 h-4 text-amber-600" /><span className="text-gray-800 font-medium">{filters.bedrooms}+ Beds</span>
                <button onClick={() => clearFilter('bedrooms')} className="ml-2 p-1 rounded-full hover:bg-red-100 hover:text-red-600"><X className="w-4 h-4" /></button>
              </div>
            )}
            {filters.bathrooms && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 rounded-xl border border-amber-200 hover:border-amber-400 transition-colors group">
                <Bath className="w-4 h-4 text-amber-600" /><span className="text-gray-800 font-medium">{filters.bathrooms}+ Baths</span>
                <button onClick={() => clearFilter('bathrooms')} className="ml-2 p-1 rounded-full hover:bg-red-100 hover:text-red-600"><X className="w-4 h-4" /></button>
              </div>
            )}
            {(filters.min_size || filters.max_size) && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 rounded-xl border border-amber-200 hover:border-amber-400 transition-colors group">
                <Maximize className="w-4 h-4 text-amber-600" />
                <span className="text-gray-800 font-medium">{filters.min_size && `${parseInt(filters.min_size).toLocaleString()} sqft`}{filters.min_size && filters.max_size && ' - '}{filters.max_size && `${parseInt(filters.max_size).toLocaleString()} sqft`}</span>
                <button onClick={() => { clearFilter('min_size'); clearFilter('max_size'); }} className="ml-2 p-1 rounded-full hover:bg-red-100 hover:text-red-600"><X className="w-4 h-4" /></button>
              </div>
            )}
            {filters.amenities.length > 0 && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 rounded-xl border border-amber-200 hover:border-amber-400 transition-colors group">
                <Sparkles className="w-4 h-4 text-amber-600" /><span className="text-gray-800 font-medium">{filters.amenities.length} Amenities</span>
                <button onClick={() => clearFilter('amenities')} className="ml-2 p-1 rounded-full hover:bg-red-100 hover:text-red-600"><X className="w-4 h-4" /></button>
              </div>
            )}
            {!hasActiveFilters && <div className="text-center w-full py-4"><p className="text-gray-500 italic">No active filters. Showing all properties.</p></div>}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 bg-white/90 backdrop-blur-xl rounded-2xl border border-amber-200 shadow-xl">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-amber-200 border-t-amber-600"></div>
              <div className="absolute inset-0 flex items-center justify-center"><div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse"></div></div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2 mt-6">Finding Your Perfect Property</h3>
            <p className="text-gray-600 max-w-md mx-auto">Searching our premium collection...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16 bg-white/90 backdrop-blur-xl rounded-2xl border border-amber-200 shadow-xl">
            <div className="inline-flex p-6 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl mb-6"><Home className="w-16 h-16 text-amber-600" /></div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">No Properties Found</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">Try adjusting your filters or browse all properties.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={clearAllFilters} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 font-semibold shadow-lg">Browse All</Button>
              <Link href="/"><Button className="bg-transparent border border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white px-8 py-4">Return Home</Button></Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => {
                const listingTypeInfo = getListingTypeInfo(property.listing_type || 'sale');
                return (
                  <div key={property.id} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 border border-amber-100 hover:border-amber-300 hover:-translate-y-1">
                    <div className="relative h-64 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
                      {property.images && property.images.length > 0 ? (
                        <><Image src={property.images[0]} alt={property.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" /><div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" /></>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center"><Home className="w-12 h-12 text-amber-300" /></div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow ${property.status === 'available' ? 'bg-emerald-500 text-white' : property.status === 'sold' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>{property.status.toUpperCase()}</span>
                      </div>
                      <div className="absolute top-4 right-4 flex flex-col gap-1 items-end">
                        <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-amber-700 text-xs font-bold rounded-full border border-amber-200">{property.property_type.toUpperCase()}</span>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow ${listingTypeInfo.color} text-white border ${listingTypeInfo.borderColor}`}>{listingTypeInfo.label}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-gray-900 text-xl mb-2 line-clamp-1 group-hover:text-amber-700 transition-colors">{property.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" /><span className="line-clamp-1">{property.city}, {property.state || property.neighborhood}</span></p>
                      <div className="grid grid-cols-3 gap-3 mb-6 pb-4 border-b border-amber-100">
                        <div className="text-center p-2.5 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                          <Bed className="w-4 h-4 text-amber-600 mx-auto mb-1.5" />
                          <span className="text-white font-semibold text-sm bg-amber-500 rounded-full w-6 h-6 flex items-center justify-center mx-auto mb-1">{property.bedrooms || '0'}</span>
                          <span className="text-gray-600 text-xs">Beds</span>
                        </div>
                        <div className="text-center p-2.5 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                          <Bath className="w-4 h-4 text-amber-600 mx-auto mb-1.5" />
                          <span className="text-white font-semibold text-sm bg-amber-500 rounded-full w-6 h-6 flex items-center justify-center mx-auto mb-1">{property.bathrooms || '0'}</span>
                          <span className="text-gray-600 text-xs">Baths</span>
                        </div>
                        <div className="text-center p-2.5 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                          <Maximize className="w-4 h-4 text-amber-600 mx-auto mb-1.5" />
                          <span className="text-white font-semibold text-sm bg-amber-500 rounded-full w-auto min-w-[30px] h-6 flex items-center justify-center mx-auto mb-1 px-2">{formatSquareFeet(property.square_feet)}</span>
                          <span className="text-gray-600 text-xs">Sq Ft</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Price</p>
                          <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{formatPrice(property.price)}</p>
                        </div>
                        <Link href={`/properties/${property.id}`}><Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm px-5 py-2.5 shadow group-hover:scale-105 transition-transform">View Details</Button></Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-12 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{properties.length} Properties Found</h3>
                  <p className="text-gray-600">Showing all matching properties</p>
                </div>
                <div className="flex gap-3">
                  <Link href="/properties"><Button variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white">Browse All</Button></Link>
                  <Button onClick={clearAllFilters} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg">New Search</Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}