'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { divIcon } from 'leaflet'
import { useEffect, useState, useRef } from 'react'
import { getPlaces } from '@/app/actions/places'
import { Badge } from "@/components/ui/badge"
import { Navigation, Search, X, Loader2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import PlaceDetails from './PlaceDetails'

const createCustomIcon = (isSelected: boolean) => divIcon({
  html: `<div class="group relative flex items-center justify-center">
    <!-- Shadow -->
    <div class="absolute -bottom-1 w-3 h-1.5 bg-black/20 rounded-[100%] blur-[2px] transition-all duration-300 ${isSelected ? 'scale-150 opacity-40' : 'opacity-20'}"></div>
    
    <!-- Pin Container -->
    <div class="relative w-9 h-11 flex items-center justify-center transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isSelected ? '-translate-y-3 scale-110' : 'hover:-translate-y-1'}">
      <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" class="drop-shadow-xl transition-all duration-300">
        <path d="M18 44C18 44 36 29.1171 36 18C36 8.05887 27.9411 0 18 0C8.05887 0 0 8.05887 0 18C0 29.1171 18 44 18 44Z" 
              fill="url(#pinGradient)" 
              class="${isSelected ? 'stroke-white stroke-[2px]' : ''}"/>
        <defs>
          <linearGradient id="pinGradient" x1="18" y1="0" x2="18" y2="44" gradientUnits="userSpaceOnUse">
            <stop stop-color="#78350F"/>
            <stop offset="1" stop-color="#451A03"/>
          </linearGradient>
        </defs>
        <circle cx="18" cy="18" r="6" fill="white" fill-opacity="0.9" />
      </svg>
    </div>
  </div>`,
  className: 'custom-div-icon',
  iconSize: [36, 48],
  iconAnchor: [18, 44],
})

const userIcon = divIcon({
  html: `<div class="relative flex items-center justify-center">
    <div class="absolute w-12 h-12 bg-amber-200/20 rounded-full animate-ping"></div>
    <div class="relative w-7 h-7 flex items-center justify-center shadow-2xl">
      <div class="absolute w-full h-full bg-amber-700 rounded-full border-[3px] border-white shadow-lg"></div>
      <div class="w-2.5 h-2.5 bg-white rounded-full z-10 animate-pulse shadow-sm"></div>
    </div>
  </div>`,
  className: 'user-div-icon',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
})

function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

function MapEvents({ onMapChange }: { onMapChange: (center: [number, number], radius: number) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter()
      const bounds = map.getBounds()
      const ne = bounds.getNorthEast()

      // Calculate radius in kilometers (distance from center to corner)
      const radiusKm = (center.distanceTo(ne) / 1000)
      onMapChange([center.lat, center.lng], radiusKm)
    }
  })
  return null
}

export default function Map() {
  const [places, setPlaces] = useState<any[]>([])
  const [userLocation, setUserLocation] = useState<[number, number]>([-6.2088, 106.8456])
  const [currentView, setCurrentView] = useState<{ center: [number, number], radius: number } | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude]
          setUserLocation(coords)
          // Initialize view with user location and a default 5km radius
          setCurrentView({ center: coords, radius: 5 })
        },
        (error) => {
          console.error("Error getting location:", error)
          const defaultCoords: [number, number] = [-6.2088, 106.8456]
          setUserLocation(defaultCoords)
          setCurrentView({ center: defaultCoords, radius: 5 })
        }
      )
    } else {
      const defaultCoords: [number, number] = [-6.2088, 106.8456]
      setUserLocation(defaultCoords)
      setCurrentView({ center: defaultCoords, radius: 5 })
    }
  }, [])

  useEffect(() => {
    if (!currentView) return

    const timer = setTimeout(() => {
      const { center, radius } = currentView
      getPlaces(center[0], center[1], radius).then((res) => {
        console.log(`Fetched places within ${radius.toFixed(2)}km:`, res)
        if (res.success && res.data) {
          setPlaces(res.data)
        }
      })
    }, 300) // Simple debouncing

    return () => clearTimeout(timer)
  }, [currentView])

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLoc: [number, number] = [position.coords.latitude, position.coords.longitude]
          setUserLocation(newLoc)
        }
      )
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 2) {
        handleSearch(searchQuery)
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSearch = async (query: string) => {
    setIsSearching(true)
    setShowResults(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      )
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectLocation = (lat: string, lon: string) => {
    setUserLocation([parseFloat(lat), parseFloat(lon)])
    setShowResults(false)
    setSearchQuery('')
  }

  return (
    <>
      {/* Search Bar */}
      <div ref={searchRef} className="absolute top-28 left-1/2 -translate-x-1/2 z-[1001] w-full max-w-md px-4">
        <div className="relative group">
          <div className="relative flex items-center glass rounded-2xl shadow-2xl border-none overflow-hidden transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/20">
            <div className="pl-4 text-muted-foreground">
              {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            </div>
            <Input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none bg-transparent focus-visible:ring-0 h-14 text-base placeholder:text-muted-foreground/60 w-full"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSearchQuery('')
                  setSearchResults([])
                  setShowResults(false)
                }}
                className="mr-2 hover:bg-transparent"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {showResults && searchResults.length > 0 && (
            <div className="absolute mt-2 w-full glass rounded-3xl shadow-2xl border-none overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-300">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectLocation(result.lat, result.lon)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-primary/5 transition-colors text-left group/item"
                >
                  <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground group-hover/item:text-primary transition-colors" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{result.display_name.split(',')[0]}</p>
                    <p className="text-xs text-muted-foreground truncate">{result.display_name.split(',').slice(1).join(',').trim()}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <MapContainer
        center={userLocation}
        zoom={17}
        scrollWheelZoom={true}
        className="h-screen w-full transition-opacity duration-500"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="bottomleft" />
        <MapController center={userLocation} />
        <MapEvents onMapChange={(center, radius) => setCurrentView({ center, radius })} />

        <Marker position={userLocation} icon={userIcon} />

        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.latitude, place.longitude]}
            icon={createCustomIcon(selectedPlace?.id === place.id)}
            eventHandlers={{
              click: () => {
                setSelectedPlace(place)
              },
            }}
          />
        ))}
      </MapContainer>

      <div className="absolute bottom-[92px] right-6 z-[400]">
        <Button
          variant="outline"
          size="icon"
          onClick={handleLocate}
          className="rounded-full h-14 w-14 glass shadow-lg hover:scale-110 transition-transform border-none flex items-center justify-center p-0"
        >
          <Navigation className="h-6 w-6 fill-primary/20" />
        </Button>
      </div>

      <PlaceDetails
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
      />
    </>
  )
}
