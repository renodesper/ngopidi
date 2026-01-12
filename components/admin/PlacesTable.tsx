'use client'

import { useState } from 'react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MoreHorizontal, Pencil, Trash, CheckCircle, Plus, MapPin, Wifi,
  Plug, Volume2, Briefcase, Building, Clock, DollarSign, Users
} from 'lucide-react'
import { createPlace, deletePlace, updatePlace, verifyPlace, PlaceFormData } from "@/app/actions/places"
import { PlaceStatus } from "@prisma/client"

interface Place {
  id: string
  name: string
  address: string
  description: string | null
  status: PlaceStatus
  latitude: number
  longitude: number
  price_level: number | null
  average_drink_price: number | null
  minimum_spend: number | null
  wifi_available: boolean
  wifi_speed: number | null
  wifi_stability: string | null
  wifi_policy: string | null
  power_outlets_available: boolean
  power_outlet_density: string | null
  table_size: string | null
  seating_types: string[]
  noise_level: string | null
  music_volume: string | null
  crowd_level: string | null
  laptop_friendly: boolean | null
  stay_policy: string | null
  meeting_friendly: boolean | null
  call_friendly: boolean | null
  work_friendly_score: number | null
  air_conditioning: boolean | null
  temperature_comfort: string | null
  restroom_available: boolean | null
  smoking_area: string | null
  parking_available: boolean | null
  opening_hours: string | null
  busy_hours: string | null
  common_visitors: string[]
}

const defaultFormData = {
  name: '', address: '', description: '', latitude: '', longitude: '', status: 'PENDING' as PlaceStatus,
  price_level: '', average_drink_price: '', minimum_spend: '',
  wifi_available: false, wifi_speed: '', wifi_stability: '', wifi_policy: '',
  power_outlets_available: false, power_outlet_density: '', table_size: '', seating_types: [] as string[],
  noise_level: '', music_volume: '', crowd_level: '',
  laptop_friendly: false, stay_policy: '', meeting_friendly: false, call_friendly: false, work_friendly_score: '',
  air_conditioning: false, temperature_comfort: '', restroom_available: false, smoking_area: '', parking_available: false,
  opening_hours: '', busy_hours: '', common_visitors: [] as string[],
}

// Modern styled form field component
const FormField = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-foreground/80">{label}</Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground/60">{hint}</p>}
  </div>
)

// Toggle chip button for multi-select
const ChipButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${active
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
  >
    {children}
  </button>
)

// Feature toggle with icon
const FeatureToggle = ({ icon: Icon, label, checked, onChange }: {
  icon: React.ElementType; label: string; checked: boolean; onChange: (v: boolean) => void
}) => (
  <div className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${checked ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-muted/20'
    }`}>
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${checked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
)

export function PlacesTable({ places }: { places: Place[] }) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(defaultFormData)
  const [activeTab, setActiveTab] = useState('basic')

  const resetForm = () => { setFormData(defaultFormData); setActiveTab('basic'); }

  const handleEdit = (place: Place) => {
    setSelectedPlace(place)
    setFormData({
      name: place.name, address: place.address, description: place.description || '',
      latitude: String(place.latitude), longitude: String(place.longitude), status: place.status,
      price_level: place.price_level ? String(place.price_level) : '',
      average_drink_price: place.average_drink_price ? String(place.average_drink_price) : '',
      minimum_spend: place.minimum_spend ? String(place.minimum_spend) : '',
      wifi_available: place.wifi_available, wifi_speed: place.wifi_speed ? String(place.wifi_speed) : '',
      wifi_stability: place.wifi_stability || '', wifi_policy: place.wifi_policy || '',
      power_outlets_available: place.power_outlets_available, power_outlet_density: place.power_outlet_density || '',
      table_size: place.table_size || '', seating_types: place.seating_types || [],
      noise_level: place.noise_level || '', music_volume: place.music_volume || '', crowd_level: place.crowd_level || '',
      laptop_friendly: place.laptop_friendly ?? false, stay_policy: place.stay_policy || '',
      meeting_friendly: place.meeting_friendly ?? false, call_friendly: place.call_friendly ?? false,
      work_friendly_score: place.work_friendly_score ? String(place.work_friendly_score) : '',
      air_conditioning: place.air_conditioning ?? false, temperature_comfort: place.temperature_comfort || '',
      restroom_available: place.restroom_available ?? false, smoking_area: place.smoking_area || '',
      parking_available: place.parking_available ?? false,
      opening_hours: place.opening_hours || '', busy_hours: place.busy_hours || '', common_visitors: place.common_visitors || [],
    })
    setActiveTab('basic')
    setEditOpen(true)
  }

  const handleDelete = (place: Place) => { setSelectedPlace(place); setDeleteOpen(true); }
  const handleVerify = async (place: Place) => { await verifyPlace(place.id, "VERIFIED_ADMIN"); }
  const confirmDelete = async () => {
    if (!selectedPlace) return
    setLoading(true); await deletePlace(selectedPlace.id); setLoading(false); setDeleteOpen(false);
  }

  const buildPayload = (): PlaceFormData => ({
    name: formData.name, address: formData.address, description: formData.description || undefined,
    latitude: parseFloat(formData.latitude) || 0, longitude: parseFloat(formData.longitude) || 0, status: formData.status,
    price_level: formData.price_level ? parseInt(formData.price_level) : undefined,
    average_drink_price: formData.average_drink_price ? parseInt(formData.average_drink_price) : undefined,
    minimum_spend: formData.minimum_spend ? parseInt(formData.minimum_spend) : undefined,
    wifi_available: formData.wifi_available,
    wifi_speed: formData.wifi_speed ? parseInt(formData.wifi_speed) : undefined,
    wifi_stability: formData.wifi_stability || undefined, wifi_policy: formData.wifi_policy || undefined,
    power_outlets_available: formData.power_outlets_available, power_outlet_density: formData.power_outlet_density || undefined,
    table_size: formData.table_size || undefined, seating_types: formData.seating_types.length ? formData.seating_types : undefined,
    noise_level: formData.noise_level || undefined, music_volume: formData.music_volume || undefined, crowd_level: formData.crowd_level || undefined,
    laptop_friendly: formData.laptop_friendly, stay_policy: formData.stay_policy || undefined,
    meeting_friendly: formData.meeting_friendly, call_friendly: formData.call_friendly,
    work_friendly_score: formData.work_friendly_score ? parseFloat(formData.work_friendly_score) : undefined,
    air_conditioning: formData.air_conditioning, temperature_comfort: formData.temperature_comfort || undefined,
    restroom_available: formData.restroom_available, smoking_area: formData.smoking_area || undefined,
    parking_available: formData.parking_available,
    opening_hours: formData.opening_hours || undefined, busy_hours: formData.busy_hours || undefined,
    common_visitors: formData.common_visitors.length ? formData.common_visitors : undefined,
  })

  const handleSubmitCreate = async () => {
    setLoading(true); const result = await createPlace(buildPayload()); setLoading(false);
    if (result.success) { setCreateOpen(false); resetForm(); }
  }
  const handleSubmitEdit = async () => {
    if (!selectedPlace) return
    setLoading(true); const result = await updatePlace(selectedPlace.id, buildPayload()); setLoading(false);
    if (result.success) { setEditOpen(false); }
  }

  const getStatusBadge = (status: PlaceStatus) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      VERIFIED_ADMIN: "default", VERIFIED_USER: "secondary", PENDING: "outline", REJECTED: "destructive"
    }
    return <Badge variant={variants[status] || "outline"}>{status.replace(/_/g, ' ')}</Badge>
  }

  const toggleSeatingType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      seating_types: prev.seating_types.includes(type)
        ? prev.seating_types.filter(t => t !== type)
        : [...prev.seating_types, type]
    }))
  }

  const toggleCommonVisitor = (visitor: string) => {
    setFormData(prev => ({
      ...prev,
      common_visitors: prev.common_visitors.includes(visitor)
        ? prev.common_visitors.filter(v => v !== visitor)
        : [...prev.common_visitors, visitor]
    }))
  }

  const FormContent = () => (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-muted/30 p-1 rounded-xl">
          <TabsTrigger value="basic" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs">
            <MapPin className="h-3.5 w-3.5 mr-1.5" />Basic
          </TabsTrigger>
          <TabsTrigger value="connectivity" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs">
            <Wifi className="h-3.5 w-3.5 mr-1.5" />Connect
          </TabsTrigger>
          <TabsTrigger value="environment" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs">
            <Volume2 className="h-3.5 w-3.5 mr-1.5" />Vibe
          </TabsTrigger>
          <TabsTrigger value="work" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs">
            <Briefcase className="h-3.5 w-3.5 mr-1.5" />Work
          </TabsTrigger>
          <TabsTrigger value="facilities" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs">
            <Building className="h-3.5 w-3.5 mr-1.5" />Facilities
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="mt-6 space-y-5">
          <div className="grid gap-4">
            <FormField label="Place Name">
              <Input
                placeholder="Enter cafe or workspace name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="h-11"
              />
            </FormField>

            <FormField label="Address">
              <Input
                placeholder="Full address"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="h-11"
              />
            </FormField>

            <FormField label="Description" hint="Brief description of the place">
              <Textarea
                placeholder="A cozy cafe with great coffee..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="resize-none"
                rows={3}
              />
            </FormField>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Location Coordinates
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Latitude">
                <Input
                  type="number" step="any" placeholder="-6.2088"
                  value={formData.latitude}
                  onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                  className="h-10"
                />
              </FormField>
              <FormField label="Longitude">
                <Input
                  type="number" step="any" placeholder="106.8456"
                  value={formData.longitude}
                  onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                  className="h-10"
                />
              </FormField>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Pricing
            </div>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Price Level" hint="1-5">
                <Input
                  type="number" min="1" max="5" placeholder="3"
                  value={formData.price_level}
                  onChange={e => setFormData({ ...formData, price_level: e.target.value })}
                  className="h-10"
                />
              </FormField>
              <FormField label="Avg Drink" hint="IDR">
                <Input
                  type="number" placeholder="35000"
                  value={formData.average_drink_price}
                  onChange={e => setFormData({ ...formData, average_drink_price: e.target.value })}
                  className="h-10"
                />
              </FormField>
              <FormField label="Min Spend" hint="IDR">
                <Input
                  type="number" placeholder="25000"
                  value={formData.minimum_spend}
                  onChange={e => setFormData({ ...formData, minimum_spend: e.target.value })}
                  className="h-10"
                />
              </FormField>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4" />
              Hours
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Opening Hours">
                <Input
                  placeholder="08:00 - 22:00"
                  value={formData.opening_hours}
                  onChange={e => setFormData({ ...formData, opening_hours: e.target.value })}
                  className="h-10"
                />
              </FormField>
              <FormField label="Busy Hours">
                <Input
                  placeholder="12:00 - 14:00"
                  value={formData.busy_hours}
                  onChange={e => setFormData({ ...formData, busy_hours: e.target.value })}
                  className="h-10"
                />
              </FormField>
            </div>
          </div>

          <FormField label="Status">
            <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v as PlaceStatus })}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="VERIFIED_ADMIN">Verified</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </TabsContent>

        {/* Connectivity Tab */}
        <TabsContent value="connectivity" className="mt-6 space-y-5">
          <FeatureToggle
            icon={Wifi}
            label="WiFi Available"
            checked={formData.wifi_available}
            onChange={v => setFormData({ ...formData, wifi_available: v, wifi_speed: '', wifi_stability: '', wifi_policy: '' })}
          />

          {formData.wifi_available && (
            <div className="pl-4 ml-2 border-l-2 border-primary/20 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-3 gap-3">
                <FormField label="Speed (Mbps)">
                  <Input
                    type="number" placeholder="50"
                    value={formData.wifi_speed}
                    onChange={e => setFormData({ ...formData, wifi_speed: e.target.value })}
                    className="h-10"
                  />
                </FormField>
                <FormField label="Stability">
                  <Select value={formData.wifi_stability} onValueChange={v => setFormData({ ...formData, wifi_stability: v })}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="poor">Poor</SelectItem>
                      <SelectItem value="average">Average</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="excellent">Excellent</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Policy">
                  <Select value={formData.wifi_policy} onValueChange={v => setFormData({ ...formData, wifi_policy: v })}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
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
            onChange={v => setFormData({ ...formData, power_outlets_available: v, power_outlet_density: '' })}
          />

          {formData.power_outlets_available && (
            <div className="pl-4 ml-2 border-l-2 border-primary/20 animate-in slide-in-from-top-2 duration-200">
              <FormField label="Outlet Density">
                <Select value={formData.power_outlet_density} onValueChange={v => setFormData({ ...formData, power_outlet_density: v })}>
                  <SelectTrigger className="h-10 w-48"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="few">Few</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="many">Many</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          )}
        </TabsContent>

        {/* Environment Tab */}
        <TabsContent value="environment" className="mt-6 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Noise Level">
              <Select value={formData.noise_level} onValueChange={v => setFormData({ ...formData, noise_level: v })}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiet">🤫 Quiet</SelectItem>
                  <SelectItem value="moderate">😊 Moderate</SelectItem>
                  <SelectItem value="noisy">🔊 Noisy</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Music Volume">
              <Select value={formData.music_volume} onValueChange={v => setFormData({ ...formData, music_volume: v })}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🔈 Low</SelectItem>
                  <SelectItem value="medium">🔉 Medium</SelectItem>
                  <SelectItem value="loud">🔊 Loud</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Crowd Level">
              <Select value={formData.crowd_level} onValueChange={v => setFormData({ ...formData, crowd_level: v })}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="empty">Empty</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="crowded">Crowded</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <FormField label="Table Size">
            <Select value={formData.table_size} onValueChange={v => setFormData({ ...formData, table_size: v })}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Select table size" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Seating Types">
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { value: 'single_table', label: 'Single Table' },
                { value: 'communal_table', label: 'Communal' },
                { value: 'bar_seating', label: 'Bar Seating' },
                { value: 'sofa', label: 'Sofa' }
              ].map(type => (
                <ChipButton
                  key={type.value}
                  active={formData.seating_types.includes(type.value)}
                  onClick={() => toggleSeatingType(type.value)}
                >
                  {type.label}
                </ChipButton>
              ))}
            </div>
          </FormField>

          <FormField label="Common Visitors">
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { value: 'students', label: '🎓 Students' },
                { value: 'remote_workers', label: '💻 Remote Workers' },
                { value: 'meetings', label: '🤝 Meetings' },
                { value: 'casual_visitors', label: '☕ Casual' }
              ].map(visitor => (
                <ChipButton
                  key={visitor.value}
                  active={formData.common_visitors.includes(visitor.value)}
                  onClick={() => toggleCommonVisitor(visitor.value)}
                >
                  {visitor.label}
                </ChipButton>
              ))}
            </div>
          </FormField>
        </TabsContent>

        {/* Work Suitability Tab */}
        <TabsContent value="work" className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FeatureToggle
              icon={Briefcase}
              label="Laptop Friendly"
              checked={formData.laptop_friendly}
              onChange={v => setFormData({ ...formData, laptop_friendly: v })}
            />
            <FeatureToggle
              icon={Users}
              label="Meeting Friendly"
              checked={formData.meeting_friendly}
              onChange={v => setFormData({ ...formData, meeting_friendly: v })}
            />
          </div>

          <FeatureToggle
            icon={Volume2}
            label="Call Friendly"
            checked={formData.call_friendly}
            onChange={v => setFormData({ ...formData, call_friendly: v })}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Stay Policy">
              <Select value={formData.stay_policy} onValueChange={v => setFormData({ ...formData, stay_policy: v })}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_limit">No Limit</SelectItem>
                  <SelectItem value="soft_limit">Soft Limit</SelectItem>
                  <SelectItem value="explicit_limit">Explicit Limit</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Work Score" hint="1.0 - 5.0">
              <Input
                type="number" min="1" max="5" step="0.1" placeholder="4.5"
                value={formData.work_friendly_score}
                onChange={e => setFormData({ ...formData, work_friendly_score: e.target.value })}
                className="h-10"
              />
            </FormField>
          </div>
        </TabsContent>

        {/* Facilities Tab */}
        <TabsContent value="facilities" className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FeatureToggle
              icon={Building}
              label="Air Conditioning"
              checked={formData.air_conditioning}
              onChange={v => setFormData({ ...formData, air_conditioning: v })}
            />
            <FeatureToggle
              icon={Building}
              label="Restroom"
              checked={formData.restroom_available}
              onChange={v => setFormData({ ...formData, restroom_available: v })}
            />
          </div>

          <FeatureToggle
            icon={Building}
            label="Parking Available"
            checked={formData.parking_available}
            onChange={v => setFormData({ ...formData, parking_available: v })}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Temperature">
              <Select value={formData.temperature_comfort} onValueChange={v => setFormData({ ...formData, temperature_comfort: v })}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cold">❄️ Cold</SelectItem>
                  <SelectItem value="comfortable">✨ Comfortable</SelectItem>
                  <SelectItem value="warm">🔥 Warm</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Smoking Area">
              <Select value={formData.smoking_area} onValueChange={v => setFormData({ ...formData, smoking_area: v })}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="separate">Separate Area</SelectItem>
                  <SelectItem value="indoor">Indoor</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )

  return (
    <>
      <div className="flex justify-end mb-4">
        <Dialog open={createOpen} onOpenChange={open => { setCreateOpen(open); if (open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Add Place</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-xl">Add New Place</DialogTitle>
              <DialogDescription>Add a work-from-cafe friendly location</DialogDescription>
            </DialogHeader>
            <div className="px-6 py-4">
              <FormContent />
            </div>
            <DialogFooter className="p-6 pt-4 border-t bg-muted/20">
              <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button
                onClick={handleSubmitCreate}
                disabled={loading || !formData.name || !formData.address || !formData.latitude || !formData.longitude}
                className="min-w-[120px]"
              >
                {loading ? "Creating..." : "Create Place"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Address</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">WiFi</TableHead>
              <TableHead className="font-semibold">Price</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {places.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No places found. Add your first location!</TableCell></TableRow>
            ) : (
              places.map(place => (
                <TableRow key={place.id}>
                  <TableCell className="font-medium">{place.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">{place.address}</TableCell>
                  <TableCell>{getStatusBadge(place.status)}</TableCell>
                  <TableCell>{place.wifi_available ? (place.wifi_speed ? `${place.wifi_speed} Mbps` : "✓") : <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell>{place.price_level ? `${"$".repeat(place.price_level)}` : "—"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(place)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                        {place.status !== "VERIFIED_ADMIN" && <DropdownMenuItem onClick={() => handleVerify(place)}><CheckCircle className="mr-2 h-4 w-4" />Verify</DropdownMenuItem>}
                        <DropdownMenuItem onClick={() => handleDelete(place)} className="text-destructive"><Trash className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl">Edit Place</DialogTitle>
            <DialogDescription>Update place details</DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4">
            <FormContent />
          </div>
          <DialogFooter className="p-6 pt-4 border-t bg-muted/20">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitEdit} disabled={loading} className="min-w-[120px]">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Place</DialogTitle>
            <DialogDescription>Are you sure you want to delete "{selectedPlace?.name}"?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
