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
  priceLevel: number | null
  averageDrinkPrice: number | null
  minimumSpend: number | null
  wifiAvailable: boolean
  wifiSpeed: number | null
  wifiStability: string | null
  wifiPolicy: string | null
  powerOutletsAvailable: boolean
  powerOutletDensity: string | null
  tableSize: string | null
  seatingTypes: string[]
  noiseLevel: string | null
  musicVolume: string | null
  crowdLevel: string | null
  laptopFriendly: boolean | null
  stayPolicy: string | null
  meetingFriendly: boolean | null
  callFriendly: boolean | null
  workFriendlyScore: number | null
  airConditioning: boolean | null
  temperatureComfort: string | null
  restroomAvailable: boolean | null
  smokingArea: string | null
  parkingAvailable: boolean | null
  openingHours: string | null
  busyHours: string | null
  commonVisitors: string[]
}

const defaultFormData = {
  name: '', address: '', description: '', latitude: '', longitude: '', status: 'PENDING' as PlaceStatus,
  priceLevel: '', averageDrinkPrice: '', minimumSpend: '',
  wifiAvailable: false, wifiSpeed: '', wifiStability: '', wifiPolicy: '',
  powerOutletsAvailable: false, powerOutletDensity: '', tableSize: '', seatingTypes: [] as string[],
  noiseLevel: '', musicVolume: '', crowdLevel: '',
  laptopFriendly: false, stayPolicy: '', meetingFriendly: false, callFriendly: false, workFriendlyScore: '',
  airConditioning: false, temperatureComfort: '', restroomAvailable: false, smokingArea: '', parkingAvailable: false,
  openingHours: '', busyHours: '', commonVisitors: [] as string[],
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
    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
      active 
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
  <div className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
    checked ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-muted/20'
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
      priceLevel: place.priceLevel ? String(place.priceLevel) : '',
      averageDrinkPrice: place.averageDrinkPrice ? String(place.averageDrinkPrice) : '',
      minimumSpend: place.minimumSpend ? String(place.minimumSpend) : '',
      wifiAvailable: place.wifiAvailable, wifiSpeed: place.wifiSpeed ? String(place.wifiSpeed) : '',
      wifiStability: place.wifiStability || '', wifiPolicy: place.wifiPolicy || '',
      powerOutletsAvailable: place.powerOutletsAvailable, powerOutletDensity: place.powerOutletDensity || '',
      tableSize: place.tableSize || '', seatingTypes: place.seatingTypes || [],
      noiseLevel: place.noiseLevel || '', musicVolume: place.musicVolume || '', crowdLevel: place.crowdLevel || '',
      laptopFriendly: place.laptopFriendly ?? false, stayPolicy: place.stayPolicy || '',
      meetingFriendly: place.meetingFriendly ?? false, callFriendly: place.callFriendly ?? false,
      workFriendlyScore: place.workFriendlyScore ? String(place.workFriendlyScore) : '',
      airConditioning: place.airConditioning ?? false, temperatureComfort: place.temperatureComfort || '',
      restroomAvailable: place.restroomAvailable ?? false, smokingArea: place.smokingArea || '',
      parkingAvailable: place.parkingAvailable ?? false,
      openingHours: place.openingHours || '', busyHours: place.busyHours || '', commonVisitors: place.commonVisitors || [],
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
    priceLevel: formData.priceLevel ? parseInt(formData.priceLevel) : undefined,
    averageDrinkPrice: formData.averageDrinkPrice ? parseInt(formData.averageDrinkPrice) : undefined,
    minimumSpend: formData.minimumSpend ? parseInt(formData.minimumSpend) : undefined,
    wifiAvailable: formData.wifiAvailable,
    wifiSpeed: formData.wifiSpeed ? parseInt(formData.wifiSpeed) : undefined,
    wifiStability: formData.wifiStability || undefined, wifiPolicy: formData.wifiPolicy || undefined,
    powerOutletsAvailable: formData.powerOutletsAvailable, powerOutletDensity: formData.powerOutletDensity || undefined,
    tableSize: formData.tableSize || undefined, seatingTypes: formData.seatingTypes.length ? formData.seatingTypes : undefined,
    noiseLevel: formData.noiseLevel || undefined, musicVolume: formData.musicVolume || undefined, crowdLevel: formData.crowdLevel || undefined,
    laptopFriendly: formData.laptopFriendly, stayPolicy: formData.stayPolicy || undefined,
    meetingFriendly: formData.meetingFriendly, callFriendly: formData.callFriendly,
    workFriendlyScore: formData.workFriendlyScore ? parseFloat(formData.workFriendlyScore) : undefined,
    airConditioning: formData.airConditioning, temperatureComfort: formData.temperatureComfort || undefined,
    restroomAvailable: formData.restroomAvailable, smokingArea: formData.smokingArea || undefined,
    parkingAvailable: formData.parkingAvailable,
    openingHours: formData.openingHours || undefined, busyHours: formData.busyHours || undefined,
    commonVisitors: formData.commonVisitors.length ? formData.commonVisitors : undefined,
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
      seatingTypes: prev.seatingTypes.includes(type)
        ? prev.seatingTypes.filter(t => t !== type)
        : [...prev.seatingTypes, type]
    }))
  }

  const toggleCommonVisitor = (visitor: string) => {
    setFormData(prev => ({
      ...prev,
      commonVisitors: prev.commonVisitors.includes(visitor)
        ? prev.commonVisitors.filter(v => v !== visitor)
        : [...prev.commonVisitors, visitor]
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
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="h-11"
              />
            </FormField>
            
            <FormField label="Address">
              <Input 
                placeholder="Full address" 
                value={formData.address} 
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="h-11"
              />
            </FormField>
            
            <FormField label="Description" hint="Brief description of the place">
              <Textarea 
                placeholder="A cozy cafe with great coffee..." 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
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
                  onChange={e => setFormData({...formData, latitude: e.target.value})}
                  className="h-10"
                />
              </FormField>
              <FormField label="Longitude">
                <Input 
                  type="number" step="any" placeholder="106.8456" 
                  value={formData.longitude} 
                  onChange={e => setFormData({...formData, longitude: e.target.value})}
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
                  value={formData.priceLevel} 
                  onChange={e => setFormData({...formData, priceLevel: e.target.value})}
                  className="h-10"
                />
              </FormField>
              <FormField label="Avg Drink" hint="IDR">
                <Input 
                  type="number" placeholder="35000"
                  value={formData.averageDrinkPrice} 
                  onChange={e => setFormData({...formData, averageDrinkPrice: e.target.value})}
                  className="h-10"
                />
              </FormField>
              <FormField label="Min Spend" hint="IDR">
                <Input 
                  type="number" placeholder="25000"
                  value={formData.minimumSpend} 
                  onChange={e => setFormData({...formData, minimumSpend: e.target.value})}
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
                  value={formData.openingHours} 
                  onChange={e => setFormData({...formData, openingHours: e.target.value})}
                  className="h-10"
                />
              </FormField>
              <FormField label="Busy Hours">
                <Input 
                  placeholder="12:00 - 14:00" 
                  value={formData.busyHours} 
                  onChange={e => setFormData({...formData, busyHours: e.target.value})}
                  className="h-10"
                />
              </FormField>
            </div>
          </div>

          <FormField label="Status">
            <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v as PlaceStatus})}>
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
            checked={formData.wifiAvailable}
            onChange={v => setFormData({...formData, wifiAvailable: v, wifiSpeed: '', wifiStability: '', wifiPolicy: ''})}
          />
          
          {formData.wifiAvailable && (
            <div className="pl-4 ml-2 border-l-2 border-primary/20 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-3 gap-3">
                <FormField label="Speed (Mbps)">
                  <Input 
                    type="number" placeholder="50" 
                    value={formData.wifiSpeed} 
                    onChange={e => setFormData({...formData, wifiSpeed: e.target.value})}
                    className="h-10"
                  />
                </FormField>
                <FormField label="Stability">
                  <Select value={formData.wifiStability} onValueChange={v => setFormData({...formData, wifiStability: v})}>
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
                  <Select value={formData.wifiPolicy} onValueChange={v => setFormData({...formData, wifiPolicy: v})}>
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
            checked={formData.powerOutletsAvailable}
            onChange={v => setFormData({...formData, powerOutletsAvailable: v, powerOutletDensity: ''})}
          />
          
          {formData.powerOutletsAvailable && (
            <div className="pl-4 ml-2 border-l-2 border-primary/20 animate-in slide-in-from-top-2 duration-200">
              <FormField label="Outlet Density">
                <Select value={formData.powerOutletDensity} onValueChange={v => setFormData({...formData, powerOutletDensity: v})}>
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
              <Select value={formData.noiseLevel} onValueChange={v => setFormData({...formData, noiseLevel: v})}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiet">🤫 Quiet</SelectItem>
                  <SelectItem value="moderate">😊 Moderate</SelectItem>
                  <SelectItem value="noisy">🔊 Noisy</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Music Volume">
              <Select value={formData.musicVolume} onValueChange={v => setFormData({...formData, musicVolume: v})}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🔈 Low</SelectItem>
                  <SelectItem value="medium">🔉 Medium</SelectItem>
                  <SelectItem value="loud">🔊 Loud</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Crowd Level">
              <Select value={formData.crowdLevel} onValueChange={v => setFormData({...formData, crowdLevel: v})}>
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
            <Select value={formData.tableSize} onValueChange={v => setFormData({...formData, tableSize: v})}>
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
                  active={formData.seatingTypes.includes(type.value)} 
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
                  active={formData.commonVisitors.includes(visitor.value)} 
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
              checked={formData.laptopFriendly}
              onChange={v => setFormData({...formData, laptopFriendly: v})}
            />
            <FeatureToggle 
              icon={Users} 
              label="Meeting Friendly" 
              checked={formData.meetingFriendly}
              onChange={v => setFormData({...formData, meetingFriendly: v})}
            />
          </div>
          
          <FeatureToggle 
            icon={Volume2} 
            label="Call Friendly" 
            checked={formData.callFriendly}
            onChange={v => setFormData({...formData, callFriendly: v})}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Stay Policy">
              <Select value={formData.stayPolicy} onValueChange={v => setFormData({...formData, stayPolicy: v})}>
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
                value={formData.workFriendlyScore} 
                onChange={e => setFormData({...formData, workFriendlyScore: e.target.value})}
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
              checked={formData.airConditioning}
              onChange={v => setFormData({...formData, airConditioning: v})}
            />
            <FeatureToggle 
              icon={Building} 
              label="Restroom" 
              checked={formData.restroomAvailable}
              onChange={v => setFormData({...formData, restroomAvailable: v})}
            />
          </div>
          
          <FeatureToggle 
            icon={Building} 
            label="Parking Available" 
            checked={formData.parkingAvailable}
            onChange={v => setFormData({...formData, parkingAvailable: v})}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Temperature">
              <Select value={formData.temperatureComfort} onValueChange={v => setFormData({...formData, temperatureComfort: v})}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cold">❄️ Cold</SelectItem>
                  <SelectItem value="comfortable">✨ Comfortable</SelectItem>
                  <SelectItem value="warm">🔥 Warm</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Smoking Area">
              <Select value={formData.smokingArea} onValueChange={v => setFormData({...formData, smokingArea: v})}>
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
                  <TableCell>{place.wifiAvailable ? (place.wifiSpeed ? `${place.wifiSpeed} Mbps` : "✓") : <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell>{place.priceLevel ? `${"$".repeat(place.priceLevel)}` : "—"}</TableCell>
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
