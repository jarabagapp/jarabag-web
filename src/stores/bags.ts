import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { JaraBag, BagCategory, GeoCoords } from '@/types'

// Haversine formula to calculate distance between two coordinates in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function normalizeBag(bag: any): JaraBag {
  return {
    ...bag,
    id: bag.id || bag._id,
    vendorId: bag.vendorId || bag.vendor?.id || bag.vendor?._id,
    vendor: bag.vendor
      ? {
          ...bag.vendor,
          id: bag.vendor.id || bag.vendor._id,
        }
      : undefined,
  }
}

export const useBagsStore = defineStore('bags', () => {
  const selectedCategory = ref<BagCategory | null>(null)
  const searchQuery = ref('')
  const radiusKm = ref(3)

  // Default starting location centered in Lagos, Yaba (near seeded vendor locations)
  const userLocation = ref<GeoCoords>({ lat: 6.5094, lng: 3.3758 })

  function getDiscount(bag: JaraBag): number {
    return Math.round((1 - bag.discountedPrice / bag.originalPrice) * 100)
  }

  function getDistanceKm(targetLat: number, targetLng: number): number {
    return calculateDistance(userLocation.value.lat, userLocation.value.lng, targetLat, targetLng)
  }

  function getTravelTimeMinutes(targetLat: number, targetLng: number): number {
    const distKm = getDistanceKm(targetLat, targetLng)
    // Assuming an average inner-city travel speed of 25 km/h
    return Math.max(1, Math.round((distKm / 25) * 60))
  }

  function setCategory(cat: BagCategory | null) {
    selectedCategory.value = cat
  }

  function setSearch(query: string) {
    searchQuery.value = query
  }

  // --- Initialize App starting location with User's real, live location ---
  if (typeof window !== 'undefined' && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        console.log('[Store Geolocator] Successfully set startup location to actual user coordinates:', userLocation.value)
      },
      (error) => {
        console.warn('[Store Geolocator] Initial geolocation fetch failed, using Lagos (Yaba) fallback:', error)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  return {
    selectedCategory,
    searchQuery,
    radiusKm,
    userLocation,
    getDiscount,
    getDistanceKm,
    getTravelTimeMinutes,
    setCategory,
    setSearch,
  }
})
