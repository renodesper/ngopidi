'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Wifi,
    Zap,
    Music,
    Users,
    Clock,
    Navigation,
    X,
    Laptop,
    MessageSquare,
    Phone,
    Thermometer,
    Car,
    Wind,
    Coffee,
    CheckCircle2,
    AlertCircle,
    Moon
} from "lucide-react"

interface PlaceDetailsProps {
    place: any
    onClose: () => void
}

export default function PlaceDetails({ place, onClose }: PlaceDetailsProps) {
    if (!place) return null

    const StatCard = ({ icon: Icon, label, value, subValue }: any) => (
        <div className="glass-card p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
            </div>
            <div className="flex flex-col">
                <span className="text-lg font-bold">{value}</span>
                {subValue && <span className="text-[10px] text-muted-foreground">{subValue}</span>}
            </div>
        </div>
    )

    const FacilityBadge = ({ icon: Icon, label, available }: any) => (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${available ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-muted/50 border-border/50 text-muted-foreground opacity-50'}`}>
            <Icon className="w-4 h-4" />
            <span className="text-xs font-medium">{label}</span>
        </div>
    )

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-4xl max-h-[90vh] glass-card overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
                {/* Header Section */}
                <div className="p-6 sm:p-8 border-b border-border/50 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                {place.status === "VERIFIED_ADMIN" ? (
                                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none rounded-full px-3">
                                        VERIFIED
                                    </Badge>
                                ) : place.status === "VERIFIED_USER" ? (
                                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white border-none rounded-full px-3">
                                        VERIFIED
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="rounded-full px-3">
                                        {place.status}
                                    </Badge>
                                )}
                                {place.price_level > 0 && (
                                    <Badge variant="outline" className="rounded-full">
                                        {"$".repeat(place.price_level)}
                                    </Badge>
                                )}
                                {place.work_friendly_score && (
                                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none rounded-full">
                                        Score: {place.work_friendly_score}/5
                                    </Badge>
                                )}
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{place.name}</h2>
                            <p className="text-muted-foreground flex items-center gap-1">
                                <Navigation className="w-4 h-4" />
                                {place.address}
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted/50">
                            <X className="w-6 h-6" />
                        </Button>
                    </div>
                </div>

                {/* Content Section - Scrollable */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-6 sm:p-8 space-y-8">

                    {/* Top Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <StatCard
                            icon={Wifi}
                            label="WiFi Speed"
                            value={`${place.wifi_speed || 0} Mbps`}
                            subValue={place.wifi_stability ? `Stability: ${place.wifi_stability}` : null}
                        />
                        <StatCard
                            icon={Zap}
                            label="Power Outlets"
                            value={place.power_outlets_available ? "Available" : "Limited"}
                            subValue={place.power_outlet_density ? `Density: ${place.power_outlet_density}` : null}
                        />
                        <StatCard
                            icon={Users}
                            label="Crowd Level"
                            value={place.crowd_level || "Normal"}
                            subValue="Real-time estimate"
                        />
                        <StatCard
                            icon={Clock}
                            label="Opening Hours"
                            value={place.opening_hours || "Check Maps"}
                            subValue="Open Now"
                        />
                    </div>

                    {/* Detailed Info Grid */}
                    <div className="grid sm:grid-cols-3 gap-8">
                        {/* Column 1: Workspace suitability */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 border-b border-border/50 pb-2">Workspace Suitability</h3>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Laptop className="w-4 h-4 text-primary" />
                                        Laptop Friendly
                                    </div>
                                    {place.laptop_friendly ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-muted-foreground" />}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm">
                                        <MessageSquare className="w-4 h-4 text-primary" />
                                        Meeting Friendly
                                    </div>
                                    {place.meeting_friendly ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-muted-foreground" />}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="w-4 h-4 text-primary" />
                                        Call Friendly
                                    </div>
                                    {place.call_friendly ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-muted-foreground" />}
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Environment */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 border-b border-border/50 pb-2">Environment</h3>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Noise Level</span>
                                    <span className="font-medium">{place.noise_level || "Moderate"}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Music Volume</span>
                                    <span className="font-medium">{place.music_volume || "Low"}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Stay Policy</span>
                                    <span className="font-medium capitalize">{place.stay_policy?.replace('_', ' ') || "No Limit"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Column 3: Facilities */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 border-b border-border/50 pb-2">Facilities</h3>
                            <div className="flex flex-wrap gap-2">
                                <FacilityBadge icon={Wind} label="A/C" available={place.air_conditioning} />
                                <FacilityBadge icon={Coffee} label="Restroom" available={place.restroom_available} />
                                <FacilityBadge icon={Car} label="Parking" available={place.parking_available} />
                                <FacilityBadge icon={Thermometer} label="Outdoor Area" available={place.smoking_area !== 'none'} />
                                <FacilityBadge icon={Moon} label="Prayer Room" available={place.prayer_room_available} />
                            </div>
                        </div>
                    </div>

                    {/* Description or Additional Info */}
                    {place.description && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 border-b border-border/50 pb-2">About this spot</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {place.description}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 sm:p-8 bg-muted/30 border-t border-border/50 flex flex-col sm:flex-row gap-4">
                    <Button
                        className="flex-1 h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20"
                        asChild
                    >
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
