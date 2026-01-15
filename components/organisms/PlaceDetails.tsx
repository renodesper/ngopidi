'use client'

import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import { PlaceFacilityBadge } from '@/components/molecules/PlaceFacilityBadge'
import { PlaceStatCard } from '@/components/molecules/PlaceStatCard'
import {
    AlertCircle,
    Car,
    CheckCircle2,
    Clock,
    Coffee,
    Laptop,
    MessageSquare,
    Moon,
    Navigation,
    Phone,
    Thermometer,
    Users,
    Wifi,
    Wind,
    X,
    Zap,
} from 'lucide-react'

interface PlaceDetailsProps {
    place: any // Typing as any for now to match flexible usage, ideally should share Place interface
    onClose: () => void
}

export default function PlaceDetails({ place, onClose }: PlaceDetailsProps) {
    if (!place) return null

    const toTitleCase = (str: string) => {
        if (!str) return str
        return str
            .toLowerCase()
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-4xl max-h-[90vh] glass-card overflow-hidden flex flex-col">
                {/* Header Section */}
                <div className="p-6 sm:p-8 border-b border-border/50 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                {place.status === 'VERIFIED_ADMIN' ? (
                                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none rounded-full px-3">
                                        VERIFIED
                                    </Badge>
                                ) : place.status === 'VERIFIED_USER' ? (
                                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white border-none rounded-full px-3">
                                        VERIFIED
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="rounded-full px-3">
                                        {place.status}
                                    </Badge>
                                )}
                                {place.price_level > 0 && (
                                    <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-100 border-emerald-200 dark:border-emerald-800 rounded-full px-3 font-semibold tracking-wide">
                                        {'$'.repeat(Math.min(place.price_level, 5))}
                                    </Badge>
                                )}
                                {place.work_friendly_score && (
                                    <Badge className="bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 border-amber-200 dark:border-amber-800 rounded-full px-3">
                                        Score: {Number(place.work_friendly_score).toFixed(1)}/5
                                    </Badge>
                                )}
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{place.name}</h2>
                            <p className="text-muted-foreground flex items-center gap-1">
                                <Navigation className="w-4 h-4" />
                                {place.address}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="rounded-full hover:bg-muted/50"
                        >
                            <X className="w-6 h-6" />
                        </Button>
                    </div>
                </div>

                {/* Content Section - Scrollable */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-6 sm:p-8 space-y-8">
                    {/* Top Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <PlaceStatCard
                            icon={Wifi}
                            label="WiFi Speed"
                            value={`${place.wifi_speed || 0} Mbps`}
                            subValue={place.wifi_stability ? `Stability: ${toTitleCase(place.wifi_stability)}` : null}
                        />
                        <PlaceStatCard
                            icon={Zap}
                            label="Power Outlets"
                            value={place.power_outlets_available ? 'Available' : 'Limited'}
                            subValue={
                                place.power_outlet_density
                                    ? `Density: ${toTitleCase(place.power_outlet_density)}`
                                    : null
                            }
                        />
                        <PlaceStatCard
                            icon={Users}
                            label="Crowd Level"
                            value={toTitleCase(place.crowd_level) || 'Normal'}
                            subValue="Real-time estimate"
                        />
                        <PlaceStatCard
                            icon={Clock}
                            label="Opening Hours"
                            value={place.opening_hours || 'Check Maps'}
                            subValue={place.opening_hours ? 'Open Now' : null}
                            onClick={
                                !place.opening_hours
                                    ? () =>
                                          window.open(
                                              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}`,
                                              '_blank'
                                          )
                                    : undefined
                            }
                        />
                    </div>

                    {/* Detailed Info Grid */}
                    <div className="grid sm:grid-cols-3 gap-8">
                        {/* Column 1: Workspace suitability */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 border-b border-border/50 pb-2">
                                Workspace Suitability
                            </h3>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Laptop className="w-4 h-4 text-primary" />
                                        Laptop Friendly
                                    </div>
                                    {place.laptop_friendly ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm">
                                        <MessageSquare className="w-4 h-4 text-primary" />
                                        Meeting Friendly
                                    </div>
                                    {place.meeting_friendly ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="w-4 h-4 text-primary" />
                                        Call Friendly
                                    </div>
                                    {place.call_friendly ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Environment */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 border-b border-border/50 pb-2">
                                Environment
                            </h3>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Noise Level</span>
                                    <span className="font-medium">{toTitleCase(place.noise_level) || 'Moderate'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Music Volume</span>
                                    <span className="font-medium">{toTitleCase(place.music_volume) || 'Low'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Stay Policy</span>
                                    <span className="font-medium">{toTitleCase(place.stay_policy) || 'No Limit'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Column 3: Facilities */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 border-b border-border/50 pb-2">
                                Facilities
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <PlaceFacilityBadge icon={Wind} label="A/C" available={place.air_conditioning} />
                                <PlaceFacilityBadge
                                    icon={Coffee}
                                    label="Restroom"
                                    available={place.restroom_available}
                                />
                                <PlaceFacilityBadge icon={Car} label="Parking" available={place.parking_available} />
                                <PlaceFacilityBadge
                                    icon={Thermometer}
                                    label="Outdoor Area"
                                    available={place.smoking_area !== 'none'}
                                />
                                <PlaceFacilityBadge
                                    icon={Moon}
                                    label="Prayer Room"
                                    available={place.prayer_room_available}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description or Additional Info */}
                    {place.description && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 border-b border-border/50 pb-2">
                                About this spot
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">{place.description}</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 sm:p-8 bg-muted/30 border-t border-border/50 flex flex-col sm:flex-row gap-4">
                    <Button className="flex-1 h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20" asChild>
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Navigation className="w-5 h-5 mr-2" />
                            Get Directions
                        </a>
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 h-14 rounded-2xl text-lg font-bold glass shadow-lg border-none"
                        onClick={onClose}
                    >
                        Back to Map
                    </Button>
                </div>
            </div>
        </div>
    )
}
