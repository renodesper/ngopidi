'use client'

import { Briefcase, Clock, DollarSign, Info, MapPin, Plug, Sparkles, Wifi } from 'lucide-react'
import { Dispatch, SetStateAction } from 'react'

// UI Components
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'
import { Switch } from '@/components/atoms/switch'
import { Textarea } from '@/components/atoms/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/molecules/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/molecules/tabs'

// Custom Components
import dynamic from 'next/dynamic'

// Dynamically import LocationPicker to avoid SSR issues with Leaflet
const LocationPicker = dynamic(() => import('@/components/organisms/LocationPicker'), {
    ssr: false,
    loading: () => (
        <div className="h-64 w-full rounded-xl border bg-muted/20 animate-pulse flex items-center justify-center text-muted-foreground">
            Loading Map...
        </div>
    ),
})

import { DEFAULT_LOCATION } from '@/lib/constants'
import { PlaceStatus } from '@prisma/client'

// Types
export interface PlaceFormData {
    name: string
    address: string
    description: string
    status: PlaceStatus
    latitude: string
    longitude: string
    price_level: string
    average_drink_price: string
    minimum_spend: string
    wifi_available: boolean
    wifi_speed: string
    wifi_stability: string
    wifi_policy: string
    power_outlets_available: boolean
    power_outlet_density: string
    table_size: string
    seating_types: string[]
    noise_level: string
    music_volume: string
    crowd_level: string
    laptop_friendly: boolean
    stay_policy: string
    meeting_friendly: boolean
    call_friendly: boolean
    work_friendly_score: string
    air_conditioning: boolean
    temperature_comfort: string
    restroom_available: boolean
    smoking_area: string
    parking_available: boolean
    opening_hours: string
    busy_hours: string
    common_visitors: string[]
}

export const defaultFormData: PlaceFormData = {
    name: '',
    address: '',
    description: '',
    latitude: '',
    longitude: '',
    status: 'PENDING',
    price_level: '',
    average_drink_price: '',
    minimum_spend: '',
    wifi_available: false,
    wifi_speed: '',
    wifi_stability: '',
    wifi_policy: '',
    power_outlets_available: false,
    power_outlet_density: '',
    table_size: '',
    seating_types: [],
    noise_level: '',
    music_volume: '',
    crowd_level: '',
    laptop_friendly: false,
    stay_policy: '',
    meeting_friendly: false,
    call_friendly: false,
    work_friendly_score: '',
    air_conditioning: false,
    temperature_comfort: '',
    restroom_available: false,
    smoking_area: '',
    parking_available: false,
    opening_hours: '',
    busy_hours: '',
    common_visitors: [],
}

interface PlaceFormProps {
    formData: PlaceFormData
    setFormData: Dispatch<SetStateAction<PlaceFormData>>
    activeTab: string
    setActiveTab: (tab: string) => void
}

// Internal small components
const FormField = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
    <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground/80">{label}</Label>
        {children}
        {hint && <p className="text-xs text-muted-foreground/60">{hint}</p>}
    </div>
)

const FeatureToggle = ({
    icon: Icon,
    label,
    checked,
    onChange,
}: {
    icon: React.ElementType
    label: string
    checked: boolean
    onChange: (v: boolean) => void
}) => (
    <div
        className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
            checked ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-muted/20'
        }`}
    >
        <div className="flex items-center gap-3">
            <div
                className={`p-2 rounded-lg ${checked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
            >
                <Icon className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">{label}</span>
        </div>
        <Switch checked={checked} onCheckedChange={onChange} />
    </div>
)

const TimeRangePicker = ({
    label,
    value,
    onChange,
}: {
    label: string
    value: string
    onChange: (v: string) => void
}) => {
    const [start, end] = value.split(' - ').concat(['', ''])

    const updateTime = (newStart: string, newEnd: string) => {
        if (!newStart && !newEnd) onChange('')
        else onChange(`${newStart || '00:00'} - ${newEnd || '00:00'}`)
    }

    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground/80">{label}</Label>
            <div className="flex items-center gap-2">
                <Input
                    type="time"
                    value={start}
                    onChange={(e) => updateTime(e.target.value, end)}
                    className="h-10 flex-1"
                />
                <span className="text-muted-foreground text-xs font-medium">to</span>
                <Input
                    type="time"
                    value={end}
                    onChange={(e) => updateTime(start, e.target.value)}
                    className="h-10 flex-1"
                />
            </div>
        </div>
    )
}

export function PlaceForm({ formData, setFormData, activeTab, setActiveTab }: PlaceFormProps) {
    const toggleSeatingType = (type: string) => {
        setFormData((prev) => ({
            ...prev,
            seating_types: prev.seating_types.includes(type)
                ? prev.seating_types.filter((t: string) => t !== type)
                : [...prev.seating_types, type],
        }))
    }

    const toggleCommonVisitor = (visitor: string) => {
        setFormData((prev) => ({
            ...prev,
            common_visitors: prev.common_visitors.includes(visitor)
                ? prev.common_visitors.filter((v: string) => v !== visitor)
                : [...prev.common_visitors, visitor],
        }))
    }

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-muted/30 p-1 rounded-xl">
                    <TabsTrigger
                        value="basic"
                        className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs"
                    >
                        <Info className="h-3.5 w-3.5 mr-1.5" />
                        Info
                    </TabsTrigger>
                    <TabsTrigger
                        value="location"
                        className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs"
                    >
                        <MapPin className="h-3.5 w-3.5 mr-1.5" />
                        Location
                    </TabsTrigger>
                    <TabsTrigger
                        value="workspace"
                        className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs"
                    >
                        <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                        Workspace
                    </TabsTrigger>
                    <TabsTrigger
                        value="vibe"
                        className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs"
                    >
                        <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                        Vibe
                    </TabsTrigger>
                </TabsList>

                {/* Basic Info Tab */}
                <TabsContent value="basic" className="mt-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                            <Info className="h-4 w-4" />
                            General Information
                        </div>
                        <div className="grid gap-4 pl-1">
                            <FormField label="Place Name">
                                <Input
                                    placeholder="Enter cafe or workspace name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="h-11"
                                />
                            </FormField>

                            <FormField label="Address">
                                <Input
                                    placeholder="Full address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="h-11"
                                />
                            </FormField>

                            <FormField label="Description" hint="Brief description of the place">
                                <Textarea
                                    placeholder="A cozy cafe with great coffee..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="resize-none"
                                    rows={3}
                                />
                            </FormField>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                            <DollarSign className="h-4 w-4" />
                            Pricing
                        </div>
                        <div className="grid grid-cols-3 gap-3 pl-1">
                            <FormField label="Price Level" hint="1-5">
                                <Input
                                    type="number"
                                    min="1"
                                    max="5"
                                    placeholder="3"
                                    value={formData.price_level}
                                    onChange={(e) => setFormData({ ...formData, price_level: e.target.value })}
                                    className="h-10"
                                />
                            </FormField>
                            <FormField label="Avg Drink" hint="IDR">
                                <Input
                                    type="number"
                                    placeholder="35000"
                                    value={formData.average_drink_price}
                                    onChange={(e) => setFormData({ ...formData, average_drink_price: e.target.value })}
                                    className="h-10"
                                />
                            </FormField>
                            <FormField label="Min Spend" hint="IDR">
                                <Input
                                    type="number"
                                    placeholder="25000"
                                    value={formData.minimum_spend}
                                    onChange={(e) => setFormData({ ...formData, minimum_spend: e.target.value })}
                                    className="h-10"
                                />
                            </FormField>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                            <Clock className="h-4 w-4" />
                            Operation Hours
                        </div>
                        <div className="grid grid-cols-2 gap-4 pl-1">
                            <TimeRangePicker
                                label="Opening Hours"
                                value={formData.opening_hours || ''}
                                onChange={(v) => setFormData({ ...formData, opening_hours: v })}
                            />
                            <TimeRangePicker
                                label="Busy Hours"
                                value={formData.busy_hours || ''}
                                onChange={(v) => setFormData({ ...formData, busy_hours: v })}
                            />
                        </div>
                    </div>
                </TabsContent>

                {/* Location Tab */}
                <TabsContent value="location" className="mt-6 space-y-5">
                    <div className="p-4 rounded-xl bg-muted/30 space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            Location Picker
                        </div>
                        <LocationPicker
                            initialLat={parseFloat(formData.latitude) || DEFAULT_LOCATION[0]}
                            initialLng={parseFloat(formData.longitude) || DEFAULT_LOCATION[1]}
                            onLocationSelect={(lat, lng) =>
                                setFormData((prev) => ({ ...prev, latitude: String(lat), longitude: String(lng) }))
                            }
                        />
                    </div>

                    <div className="p-4 rounded-xl bg-muted/30 space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            Location Coordinates
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Latitude">
                                <Input
                                    type="number"
                                    step="any"
                                    placeholder={String(DEFAULT_LOCATION[0])}
                                    value={formData.latitude}
                                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                    className="h-10"
                                />
                            </FormField>
                            <FormField label="Longitude">
                                <Input
                                    type="number"
                                    step="any"
                                    placeholder={String(DEFAULT_LOCATION[1])}
                                    value={formData.longitude}
                                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                    className="h-10"
                                />
                            </FormField>
                        </div>
                    </div>
                </TabsContent>

                {/* Workspace Tab */}
                <TabsContent value="workspace" className="mt-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                            <Wifi className="h-4 w-4" />
                            Connectivity
                        </div>
                        <div className="grid gap-4 pl-1">
                            <FeatureToggle
                                icon={Wifi}
                                label="WiFi Available"
                                checked={formData.wifi_available}
                                onChange={(v) =>
                                    setFormData({
                                        ...formData,
                                        wifi_available: v,
                                        wifi_speed: '',
                                        wifi_stability: '',
                                        wifi_policy: '',
                                    })
                                }
                            />

                            {formData.wifi_available && (
                                <div className="pl-4 ml-2 border-l-2 border-primary/20 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                    <div className="grid grid-cols-3 gap-3">
                                        <FormField label="Speed (Mbps)">
                                            <Input
                                                type="number"
                                                placeholder="50"
                                                value={formData.wifi_speed}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, wifi_speed: e.target.value })
                                                }
                                                className="h-10"
                                            />
                                        </FormField>
                                        <FormField label="Stability">
                                            <Select
                                                value={formData.wifi_stability}
                                                onValueChange={(v) => setFormData({ ...formData, wifi_stability: v })}
                                            >
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="poor">Poor</SelectItem>
                                                    <SelectItem value="average">Average</SelectItem>
                                                    <SelectItem value="good">Good</SelectItem>
                                                    <SelectItem value="excellent">Excellent</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormField>
                                        <FormField label="Policy">
                                            <Select
                                                value={formData.wifi_policy}
                                                onValueChange={(v) => setFormData({ ...formData, wifi_policy: v })}
                                            >
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="free">Free</SelectItem>
                                                    <SelectItem value="purchase_required">Purchase Required</SelectItem>
                                                    <SelectItem value="time_limited">Time Limited</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormField>
                                    </div>
                                </div>
                            )}

                            <FeatureToggle
                                icon={Plug}
                                label="Power Outlets"
                                checked={formData.power_outlets_available}
                                onChange={(v) =>
                                    setFormData({ ...formData, power_outlets_available: v, power_outlet_density: '' })
                                }
                            />

                            {formData.power_outlets_available && (
                                <div className="pl-4 ml-2 border-l-2 border-primary/20 animate-in slide-in-from-top-2 duration-200">
                                    <FormField label="Outlet Density">
                                        <Select
                                            value={formData.power_outlet_density}
                                            onValueChange={(v) => setFormData({ ...formData, power_outlet_density: v })}
                                        >
                                            <SelectTrigger className="h-10 w-48">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="few">Few</SelectItem>
                                                <SelectItem value="moderate">Moderate</SelectItem>
                                                <SelectItem value="many">Many</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormField>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="vibe" className="mt-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                            <Sparkles className="h-4 w-4" />
                            Atmosphere
                        </div>
                        <div className="grid grid-cols-2 gap-4 pl-1">
                            <FormField label="Noise Level">
                                <Select
                                    value={formData.noise_level}
                                    onValueChange={(v) => setFormData({ ...formData, noise_level: v })}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="quiet">Quiet</SelectItem>
                                        <SelectItem value="moderate">Moderate</SelectItem>
                                        <SelectItem value="noisy">Noisy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormField>
                            <FormField label="Music Volume">
                                <Select
                                    value={formData.music_volume}
                                    onValueChange={(v) => setFormData({ ...formData, music_volume: v })}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="loud">Loud</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormField>
                            <FormField label="Crowd Level">
                                <Select
                                    value={formData.crowd_level}
                                    onValueChange={(v) => setFormData({ ...formData, crowd_level: v })}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="empty">Empty / Quiet</SelectItem>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="crowded">Crowded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormField>
                            <FormField label="Stay Policy">
                                <Select
                                    value={formData.stay_policy}
                                    onValueChange={(v) => setFormData({ ...formData, stay_policy: v })}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="no_limit">No Limit</SelectItem>
                                        <SelectItem value="soft_limit">Soft Limit (Order again)</SelectItem>
                                        <SelectItem value="explicit_limit">Explicit Time Limit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormField>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                            <Briefcase className="h-4 w-4" />
                            Common Visitors
                        </div>
                        <div className="grid grid-cols-2 gap-3 pl-1">
                            {['students', 'remote_workers', 'meetings', 'casual_visitors'].map((visitor) => (
                                <div
                                    key={visitor}
                                    onClick={() => toggleCommonVisitor(visitor)}
                                    className={`
                                        cursor-pointer flex items-center justify-between p-3 rounded-xl border transition-all duration-200
                                        ${
                                            formData.common_visitors.includes(visitor)
                                                ? 'border-primary/30 bg-primary/5'
                                                : 'border-border/50 bg-muted/20 hover:bg-muted/30'
                                        }
                                    `}
                                >
                                    <span className="text-sm font-medium capitalize">{visitor.replace('_', ' ')}</span>
                                    {formData.common_visitors.includes(visitor) && (
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
