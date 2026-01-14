'use client'

import { MapContainer, TileLayer, Marker, useMap, useMapEvents, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Loader2, X } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Fix for default marker icons in Leaflet with Next.js
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng)
        },
    })
    return null
}

function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap()
    useEffect(() => {
        map.setView(center, map.getZoom())
    }, [center, map])
    return null
}

interface LocationPickerProps {
    initialLat?: number
    initialLng?: number
    onLocationSelect: (lat: number, lng: number) => void
}

export default function LocationPicker({
    initialLat = -6.2088,
    initialLng = 106.8456,
    onLocationSelect
}: LocationPickerProps) {
    const [position, setPosition] = useState<[number, number]>([initialLat, initialLng])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)

    // Update internal position if initial props change (e.g. when editing different places)
    useEffect(() => {
        // If we're using the default Jakarta coordinates, try to get user's actual location
        const isDefault = initialLat === -6.2088 && initialLng === 106.8456

        if (isDefault && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude
                    const lng = pos.coords.longitude
                    setPosition([lat, lng])
                    onLocationSelect(lat, lng)
                },
                (err) => {
                    console.error("Error getting location:", err)
                    setPosition([initialLat, initialLng])
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            )
        } else {
            setPosition([initialLat, initialLng])
        }
    }, [initialLat, initialLng])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSearch = async (query: string) => {
        if (query.length < 3) return
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

    const handleSelectResult = (result: any) => {
        const lat = parseFloat(result.lat)
        const lng = parseFloat(result.lon)
        setPosition([lat, lng])
        onLocationSelect(lat, lng)
        setShowResults(false)
        setSearchQuery('')
    }

    const handleMapClick = (lat: number, lng: number) => {
        setPosition([lat, lng])
        onLocationSelect(lat, lng)
    }

    return (
        <div className="space-y-4">
            <div ref={searchRef} className="relative">
                <div className="relative flex items-center bg-background border rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden">
                    <div className="pl-3 text-muted-foreground">
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </div>
                    <Input
                        type="text"
                        placeholder="Search for an address..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            if (e.target.value.length >= 3) {
                                // Debounce search
                                const timeoutId = setTimeout(() => handleSearch(e.target.value), 500)
                                return () => clearTimeout(timeoutId)
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                handleSearch(searchQuery)
                            }
                        }}
                        className="border-none bg-transparent focus-visible:ring-0 h-10 text-sm"
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
                            className="mr-1 h-8 w-8 hover:bg-transparent"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {showResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-[1002] max-h-60 overflow-y-auto">
                        {searchResults.map((result, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectResult(result)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-start gap-2 border-b last:border-0"
                            >
                                <MapPin className="h-4 w-4 mt-1 shrink-0 text-muted-foreground" />
                                <span className="truncate">{result.display_name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="h-64 w-full rounded-xl border overflow-hidden relative z-0">
                <MapContainer
                    center={position}
                    zoom={15}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ZoomControl position="bottomright" />
                    <ChangeView center={position} />
                    <MapEvents onLocationSelect={handleMapClick} />
                    <Marker position={position} icon={defaultIcon} />
                </MapContainer>
                <div className="absolute bottom-2 left-2 z-[10] bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-muted-foreground border">
                    Click map to set location
                </div>
            </div>
        </div>
    )
}
