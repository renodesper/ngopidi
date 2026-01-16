'use client'

import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/molecules/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/molecules/dropdown-menu'
import { Pagination } from '@/components/molecules/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/molecules/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/molecules/table'
import {
    ArrowUpDown,
    Car,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock,
    Coffee,
    Filter,
    Info,
    Laptop,
    MapPin,
    MoreHorizontal,
    Navigation,
    Pencil,
    Plus,
    ShieldCheck,
    SortAsc,
    SortDesc,
    Sparkles,
    Trash,
    Users,
    Volume2,
    Wifi,
    Wind,
    XCircle,
    Zap,
} from 'lucide-react'
import type L from 'leaflet'
import { usePathname, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false })

import { createPlace, deletePlace, updatePlace } from '@/app/actions/places'
import { submitVerification } from '@/app/actions/verifications'
import { PlaceStatusBadge } from '@/components/molecules/PlaceStatusBadge'
import { defaultFormData, PlaceForm, PlaceFormData } from '@/components/organisms/PlaceForm'
import { PlaceStatus } from '@prisma/client'

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
    submitter_id: string | null
}

export function PlacesTable({
    places,
    page,
    totalPages,
    statusFilter = 'ALL',
    searchQuery = '',
    sortKey = 'created_at',
    sortDir = 'desc',
    currentUserId,
    currentUserRole,
}: {
    places: Place[]
    page: number
    totalPages: number
    statusFilter?: string
    searchQuery?: string
    sortKey?: string
    sortDir?: 'asc' | 'desc'
    currentUserId?: string
    currentUserRole?: string
}) {
    const router = useRouter()
    const pathname = usePathname()

    const [createOpen, setCreateOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [verifyOpen, setVerifyOpen] = useState(false)
    const [detailOpen, setDetailOpen] = useState(false)
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<PlaceFormData>(defaultFormData)
    const [activeTab, setActiveTab] = useState('basic')
    const [searchValue, setSearchValue] = useState(searchQuery) // Local state for input
    const [verifyFormData, setVerifyFormData] = useState({ proofLink: '', notes: '' })
    const [placeIcon, setPlaceIcon] = useState<L.DivIcon | null>(null)

    // Create Leaflet icon on client side only
    useEffect(() => {
        if (typeof window !== 'undefined') {
            import('leaflet').then((L) => {
                const icon = L.divIcon({
                    html: `<div class="flex items-center justify-center">
                        <div class="w-8 h-8 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                            <svg class="w-4 h-4 text-white" fill="white" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                    </div>`,
                    className: 'custom-place-icon',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                })
                setPlaceIcon(icon)
            })
        }
    }, [])

    const resetForm = () => {
        setFormData(defaultFormData)
        setActiveTab('basic')
    }

    const toTitleCase = (str: string | null | undefined) => {
        if (!str) return '—'
        return str
            .toLowerCase()
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    const handleRowClick = (place: Place) => {
        setSelectedPlace(place)
        setDetailOpen(true)
    }

    // URL State Management
    const updateUrl = (params: Record<string, string | number | null>) => {
        const newParams = new URLSearchParams(window.location.search)
        Object.entries(params).forEach(([key, value]) => {
            if (value === null || value === '' || value === undefined) {
                newParams.delete(key)
            } else {
                newParams.set(key, String(value))
            }
        })

        // Always reset to page 1 when filtering/searching/sorting changes (except pagination itself)
        if (!params.page && (params.search || params.status || params.sortKey || params.sortDir)) {
            newParams.set('page', '1')
        }

        router.push(`${pathname}?${newParams.toString()}`)
    }

    const handleSearch = (value: string) => {
        setSearchValue(value)
        // Debounce this in real implementation, for now let's just update on enter or blur?
        // Or just simple delay
        if (value === '') updateUrl({ search: null })
    }

    // Effect to debounce search update to URL
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue !== searchQuery) {
                updateUrl({ search: searchValue || null })
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [searchValue, searchQuery])

    const handleSort = (key: string) => {
        const newDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc'
        updateUrl({ sortKey: key, sortDir: newDir })
    }

    const handlePageChange = (newPage: number) => {
        updateUrl({ page: newPage })
    }

    const handleStatusFilter = (status: string) => {
        updateUrl({ status: status === 'ALL' ? null : status })
    }

    const handleEdit = (place: Place) => {
        setSelectedPlace(place)
        setFormData({
            name: place.name,
            address: place.address,
            description: place.description || '',
            latitude: String(place.latitude),
            longitude: String(place.longitude),
            status: place.status,
            price_level: place.price_level ? String(place.price_level) : '',
            average_drink_price: place.average_drink_price ? String(place.average_drink_price) : '',
            minimum_spend: place.minimum_spend ? String(place.minimum_spend) : '',
            wifi_available: place.wifi_available,
            wifi_speed: place.wifi_speed ? String(place.wifi_speed) : '',
            wifi_stability: place.wifi_stability || '',
            wifi_policy: place.wifi_policy || '',
            power_outlets_available: place.power_outlets_available,
            power_outlet_density: place.power_outlet_density || '',
            table_size: place.table_size || '',
            seating_types: place.seating_types || [],
            noise_level: place.noise_level || '',
            music_volume: place.music_volume || '',
            crowd_level: place.crowd_level || '',
            laptop_friendly: place.laptop_friendly ?? false,
            stay_policy: place.stay_policy || '',
            meeting_friendly: place.meeting_friendly ?? false,
            call_friendly: place.call_friendly ?? false,
            work_friendly_score: place.work_friendly_score ? String(place.work_friendly_score) : '',
            air_conditioning: place.air_conditioning ?? false,
            temperature_comfort: place.temperature_comfort || '',
            restroom_available: place.restroom_available ?? false,
            smoking_area: place.smoking_area || '',
            parking_available: place.parking_available ?? false,
            opening_hours: place.opening_hours || '',
            busy_hours: place.busy_hours || '',
            common_visitors: place.common_visitors || [],
        })
        setActiveTab('basic')
        setEditOpen(true)
    }

    const handleDelete = (place: Place) => {
        setSelectedPlace(place)
        setDeleteOpen(true)
    }
    const confirmDelete = async () => {
        if (!selectedPlace) return
        setLoading(true)
        await deletePlace(selectedPlace.id)
        setLoading(false)
        setDeleteOpen(false)
    }

    const handleVerify = (place: Place) => {
        setSelectedPlace(place)
        setVerifyFormData({ proofLink: '', notes: '' })
        setVerifyOpen(true)
    }

    const confirmVerify = async () => {
        if (!selectedPlace) return
        if (!verifyFormData.proofLink) {
            alert('Proof link is required')
            return
        }
        setLoading(true)
        const result = await submitVerification(selectedPlace.id, verifyFormData.proofLink, verifyFormData.notes)
        setLoading(false)
        if (result.success) {
            setVerifyOpen(false)
        } else {
            alert(result.error || 'Failed to verify place')
        }
    }

    const buildPayload = (): any => ({
        name: formData.name,
        address: formData.address,
        description: formData.description || undefined,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        status: formData.status,
        price_level: formData.price_level ? parseInt(formData.price_level) : undefined,
        average_drink_price: formData.average_drink_price ? parseInt(formData.average_drink_price) : undefined,
        minimum_spend: formData.minimum_spend ? parseInt(formData.minimum_spend) : undefined,
        wifi_available: formData.wifi_available,
        wifi_speed: formData.wifi_speed ? parseInt(formData.wifi_speed) : undefined,
        wifi_stability: formData.wifi_stability || undefined,
        wifi_policy: formData.wifi_policy || undefined,
        power_outlets_available: formData.power_outlets_available,
        power_outlet_density: formData.power_outlet_density || undefined,
        table_size: formData.table_size || undefined,
        seating_types: formData.seating_types.length ? formData.seating_types : undefined,
        noise_level: formData.noise_level || undefined,
        music_volume: formData.music_volume || undefined,
        crowd_level: formData.crowd_level || undefined,
        laptop_friendly: formData.laptop_friendly,
        stay_policy: formData.stay_policy || undefined,
        meeting_friendly: formData.meeting_friendly,
        call_friendly: formData.call_friendly,
        work_friendly_score: formData.work_friendly_score ? parseFloat(formData.work_friendly_score) : undefined,
        air_conditioning: formData.air_conditioning,
        temperature_comfort: formData.temperature_comfort || undefined,
        restroom_available: formData.restroom_available,
        smoking_area: formData.smoking_area || undefined,
        parking_available: formData.parking_available,
        opening_hours: formData.opening_hours || undefined,
        busy_hours: formData.busy_hours || undefined,
        common_visitors: formData.common_visitors.length ? formData.common_visitors : undefined,
    })

    const handleSubmitCreate = async () => {
        setLoading(true)
        const result = await createPlace(buildPayload())
        setLoading(false)
        if (result.success) {
            setCreateOpen(false)
            resetForm()
        } else {
            alert(result.error || 'Failed to create place')
        }
    }
    const handleSubmitEdit = async () => {
        if (!selectedPlace) return
        setLoading(true)
        const result = await updatePlace(selectedPlace.id, buildPayload())
        setLoading(false)
        if (result.success) {
            setEditOpen(false)
        }
    }

    const getSortIcon = (key: string) => {
        if (sortKey !== key) return <ArrowUpDown className="h-3 w-3 opacity-30" />
        return sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
    }

    const PlaceCard = ({ place }: { place: Place }) => (
        <div className="bg-card border rounded-xl p-4 space-y-3 shadow-sm cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => handleRowClick(place)}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-base">{place.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{place.address}</p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {place.status === 'UNVERIFIED' && (
                                <DropdownMenuItem onClick={() => handleVerify(place)} className="text-emerald-600">
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Verify
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onClick={() => handleEdit(place)}
                                disabled={currentUserRole !== 'ADMIN' && place.submitter_id !== currentUserId}
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDelete(place)}
                                className="text-destructive"
                                disabled={currentUserRole !== 'ADMIN' && place.submitter_id !== currentUserId}
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
                <PlaceStatusBadge status={place.status} />
                {place.work_friendly_score && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                        <Sparkles className="h-3 w-3" />
                        {Number(place.work_friendly_score).toFixed(1)}
                    </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                    <Wifi className="h-3 w-3" />
                    {place.wifi_available ? (place.wifi_speed ? `${place.wifi_speed} Mbps` : 'Yes') : '—'}
                </div>
                <div className="flex items-center gap-1 text-primary text-xs font-semibold bg-primary/10 px-2 py-1 rounded-md">
                    {place.price_level ? '$'.repeat(place.price_level) : '—'}
                </div>
                {place.submitter_id === currentUserId && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md font-semibold border border-blue-100">
                        You
                    </div>
                )}
            </div>
        </div>
    )

    return (
        <>
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 mb-6">
                <div className="relative w-full lg:max-w-sm">
                    <Input
                        placeholder="Search places by name..."
                        value={searchValue}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-9 h-11 bg-card rounded-xl border-border/50 focus:ring-primary/20 w-full"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Sparkles className="h-4 w-4 opacity-70" />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    <div className="flex items-center gap-2 bg-card border border-border/50 rounded-xl px-3 h-11 flex-1 lg:flex-initial">
                        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                        <Select value={statusFilter} onValueChange={handleStatusFilter}>
                            <SelectTrigger className="border-none focus:ring-0 w-full lg:w-[140px] h-9 bg-transparent p-0">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="UNVERIFIED">Unverified</SelectItem>
                                <SelectItem value="VERIFIED_ADMIN">Verified Admin</SelectItem>
                                <SelectItem value="VERIFIED_USER">Verified User</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2 bg-card border border-border/50 rounded-xl px-3 h-11 flex-1 lg:flex-initial">
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        <Select value={sortKey} onValueChange={(val) => handleSort(val)}>
                            <SelectTrigger className="border-none focus:ring-0 w-full lg:w-[140px] h-9 bg-transparent p-0">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="status">Status</SelectItem>
                                <SelectItem value="work_friendly_score">Work Score</SelectItem>
                                <SelectItem value="price_level">Price Level</SelectItem>
                                <SelectItem value="noise_level">Noise Level</SelectItem>
                                <SelectItem value="music_volume">Music Volume</SelectItem>
                                <SelectItem value="crowd_level">Crowd Level</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 text-muted-foreground shrink-0"
                            onClick={() => handleSort(sortKey || 'created_at')}
                            title={sortDir === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
                        >
                            {sortDir === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="hidden lg:block h-2" />

            <div className="hidden md:block rounded-xl border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead
                                className="font-semibold px-6 cursor-pointer hover:text-primary transition-colors"
                                onClick={() => handleSort('name')}
                            >
                                <div className="flex items-center gap-2">Name {getSortIcon('name')}</div>
                            </TableHead>
                            <TableHead className="font-semibold w-[100px] text-center">Submitter</TableHead>
                            <TableHead className="font-semibold">Address</TableHead>
                            <TableHead
                                className="font-semibold cursor-pointer hover:text-primary transition-colors"
                                onClick={() => handleSort('status')}
                            >
                                <div className="flex items-center gap-2">Status {getSortIcon('status')}</div>
                            </TableHead>
                            <TableHead
                                className="font-semibold cursor-pointer hover:text-primary transition-colors"
                                onClick={() => handleSort('work_friendly_score')}
                            >
                                <div className="flex items-center gap-2">
                                    Score {getSortIcon('work_friendly_score')}
                                </div>
                            </TableHead>
                            <TableHead
                                className="font-semibold cursor-pointer hover:text-primary transition-colors"
                                onClick={() => handleSort('price_level')}
                            >
                                <div className="flex items-center gap-2">Price {getSortIcon('price_level')}</div>
                            </TableHead>
                            <TableHead
                                className="font-semibold cursor-pointer hover:text-primary transition-colors"
                                onClick={() => handleSort('noise_level')}
                            >
                                <div className="flex items-center gap-2">Noise {getSortIcon('noise_level')}</div>
                            </TableHead>
                            <TableHead className="w-[70px] pr-6"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {places.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                                    <div className="flex flex-col items-center gap-2">
                                        <Info className="h-8 w-8 opacity-20" />
                                        <p>No places found matching your filters.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            places.map((place) => (
                                <TableRow key={place.id} className="group transition-colors hover:bg-muted/50 cursor-pointer">
                                    <TableCell className="font-medium px-6" onClick={() => handleRowClick(place)}>{place.name}</TableCell>
                                    <TableCell className="text-center" onClick={() => handleRowClick(place)}>
                                        {place.submitter_id === currentUserId ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                You
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground/30">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate text-muted-foreground" onClick={() => handleRowClick(place)}>
                                        {place.address}
                                    </TableCell>
                                    <TableCell onClick={() => handleRowClick(place)}>
                                        <PlaceStatusBadge status={place.status} />
                                    </TableCell>
                                    <TableCell onClick={() => handleRowClick(place)}>
                                        {place.work_friendly_score ? (
                                            <div className="flex items-center gap-1.5 font-semibold text-amber-600">
                                                {Number(place.work_friendly_score).toFixed(1)}
                                            </div>
                                        ) : (
                                            '—'
                                        )}
                                    </TableCell>
                                    <TableCell onClick={() => handleRowClick(place)}>
                                        <div className="font-semibold text-emerald-600">
                                            {place.price_level ? '$'.repeat(place.price_level) : '—'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs uppercase tracking-wider font-medium" onClick={() => handleRowClick(place)}>
                                        {place.noise_level?.replace(/_/g, ' ') || '—'}
                                    </TableCell>
                                    <TableCell className="pr-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {place.status === 'UNVERIFIED' && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleVerify(place)}
                                                        className="text-emerald-600"
                                                    >
                                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                                        Verify
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    onClick={() => handleEdit(place)}
                                                    disabled={
                                                        currentUserRole !== 'ADMIN' &&
                                                        place.submitter_id !== currentUserId
                                                    }
                                                >
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(place)}
                                                    className="text-destructive"
                                                    disabled={
                                                        currentUserRole !== 'ADMIN' &&
                                                        place.submitter_id !== currentUserId
                                                    }
                                                >
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="mt-4 flex justify-end">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {places.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12 bg-card border rounded-xl flex flex-col items-center gap-2">
                        <Info className="h-8 w-8 opacity-20" />
                        No places found matching your filters.
                    </div>
                ) : (
                    places.map((place) => <PlaceCard key={place.id} place={place} />)
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 rounded-2xl">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-xl">Edit Place</DialogTitle>
                        <DialogDescription>Update place details</DialogDescription>
                    </DialogHeader>
                    <div className="px-6 py-4">
                        <PlaceForm
                            formData={formData}
                            setFormData={setFormData}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                    </div>
                    <DialogFooter className="p-6 pt-4 border-t bg-muted/20">
                        <Button variant="ghost" onClick={() => setEditOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitEdit} disabled={loading} className="min-w-[120px]">
                            {loading ? 'Saving...' : 'Save Changes'}
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
                        <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={loading}>
                            {loading ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Verify Dialog */}
            <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Verify Place</DialogTitle>
                        <DialogDescription>
                            Verify "{selectedPlace?.name}" by providing proof of verification.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label htmlFor="proofLink" className="text-sm font-medium">
                                Proof Link <span className="text-destructive">*</span>
                            </label>
                            <Input
                                id="proofLink"
                                placeholder="https://example.com/proof"
                                value={verifyFormData.proofLink}
                                onChange={(e) =>
                                    setVerifyFormData((prev) => ({ ...prev, proofLink: e.target.value }))
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                Link to Google Maps, social media, or official website
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="notes" className="text-sm font-medium">
                                Notes
                            </label>
                            <textarea
                                id="notes"
                                placeholder="Additional notes about verification..."
                                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={verifyFormData.notes}
                                onChange={(e) => setVerifyFormData((prev) => ({ ...prev, notes: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setVerifyOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmVerify}
                            disabled={loading || !verifyFormData.proofLink}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {loading ? 'Verifying...' : 'Verify Place'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Place Detail Modal */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-hidden p-0 rounded-2xl">
                    <DialogTitle className="sr-only">
                        {selectedPlace?.name || 'Place Details'}
                    </DialogTitle>
                    {selectedPlace && (
                        <>
                            {/* Header */}
                            <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 pb-4 border-b">
                                <div className="space-y-3 pr-10">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <PlaceStatusBadge status={selectedPlace.status} />
                                        {selectedPlace.price_level && (
                                            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                                                {'$'.repeat(selectedPlace.price_level)}
                                            </span>
                                        )}
                                        {selectedPlace.work_friendly_score && (
                                            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                                                <Sparkles className="h-3 w-3" />
                                                {Number(selectedPlace.work_friendly_score).toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tight">{selectedPlace.name}</h2>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4 shrink-0" />
                                        {selectedPlace.address}
                                    </p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-6">
                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="bg-muted/50 rounded-xl p-4 space-y-1">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Wifi className="h-4 w-4" />
                                            <span className="text-xs font-medium">WiFi</span>
                                        </div>
                                        <p className="font-semibold">
                                            {selectedPlace.wifi_available
                                                ? selectedPlace.wifi_speed
                                                    ? `${selectedPlace.wifi_speed} Mbps`
                                                    : 'Available'
                                                : 'Not Available'}
                                        </p>
                                        {selectedPlace.wifi_stability && (
                                            <p className="text-xs text-muted-foreground">{toTitleCase(selectedPlace.wifi_stability)}</p>
                                        )}
                                    </div>
                                    <div className="bg-muted/50 rounded-xl p-4 space-y-1">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Zap className="h-4 w-4" />
                                            <span className="text-xs font-medium">Power</span>
                                        </div>
                                        <p className="font-semibold">
                                            {selectedPlace.power_outlets_available ? 'Available' : 'Limited'}
                                        </p>
                                        {selectedPlace.power_outlet_density && (
                                            <p className="text-xs text-muted-foreground">{toTitleCase(selectedPlace.power_outlet_density)}</p>
                                        )}
                                    </div>
                                    <div className="bg-muted/50 rounded-xl p-4 space-y-1">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Volume2 className="h-4 w-4" />
                                            <span className="text-xs font-medium">Noise</span>
                                        </div>
                                        <p className="font-semibold">{toTitleCase(selectedPlace.noise_level)}</p>
                                    </div>
                                    <div className="bg-muted/50 rounded-xl p-4 space-y-1">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                            <span className="text-xs font-medium">Crowd</span>
                                        </div>
                                        <p className="font-semibold">{toTitleCase(selectedPlace.crowd_level)}</p>
                                    </div>
                                </div>

                                {/* Workspace & Environment */}
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {/* Workspace Suitability */}
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <Laptop className="h-4 w-4" />
                                            Workspace
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between py-2 border-b border-border/50">
                                                <span className="text-sm">Laptop Friendly</span>
                                                {selectedPlace.laptop_friendly ? (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-muted-foreground/50" />
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between py-2 border-b border-border/50">
                                                <span className="text-sm">Meeting Friendly</span>
                                                {selectedPlace.meeting_friendly ? (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-muted-foreground/50" />
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between py-2 border-b border-border/50">
                                                <span className="text-sm">Call Friendly</span>
                                                {selectedPlace.call_friendly ? (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-muted-foreground/50" />
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-sm">Stay Policy</span>
                                                <span className="text-sm font-medium">{toTitleCase(selectedPlace.stay_policy)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Environment */}
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <Coffee className="h-4 w-4" />
                                            Environment
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between py-2 border-b border-border/50">
                                                <span className="text-sm">Music Volume</span>
                                                <span className="text-sm font-medium">{toTitleCase(selectedPlace.music_volume)}</span>
                                            </div>
                                            <div className="flex items-center justify-between py-2 border-b border-border/50">
                                                <span className="text-sm">Table Size</span>
                                                <span className="text-sm font-medium">{toTitleCase(selectedPlace.table_size)}</span>
                                            </div>
                                            <div className="flex items-center justify-between py-2 border-b border-border/50">
                                                <span className="text-sm">Temperature</span>
                                                <span className="text-sm font-medium">{toTitleCase(selectedPlace.temperature_comfort)}</span>
                                            </div>
                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-sm">Seating Types</span>
                                                <span className="text-sm font-medium">
                                                    {selectedPlace.seating_types?.length
                                                        ? selectedPlace.seating_types.map(toTitleCase).join(', ')
                                                        : '—'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Facilities */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Facilities</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${selectedPlace.air_conditioning ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}`}>
                                            <Wind className="h-3.5 w-3.5" />
                                            A/C
                                        </span>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${selectedPlace.restroom_available ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}`}>
                                            <Coffee className="h-3.5 w-3.5" />
                                            Restroom
                                        </span>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${selectedPlace.parking_available ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}`}>
                                            <Car className="h-3.5 w-3.5" />
                                            Parking
                                        </span>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${selectedPlace.smoking_area && selectedPlace.smoking_area !== 'none' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}`}>
                                            <Wind className="h-3.5 w-3.5" />
                                            Smoking Area
                                        </span>
                                    </div>
                                </div>

                                {/* Pricing & Hours */}
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <Navigation className="h-4 w-4" />
                                            Pricing
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between py-2 border-b border-border/50">
                                                <span className="text-sm">Avg. Drink Price</span>
                                                <span className="text-sm font-medium">
                                                    {selectedPlace.average_drink_price ? `Rp ${selectedPlace.average_drink_price.toLocaleString()}` : '—'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-sm">Minimum Spend</span>
                                                <span className="text-sm font-medium">
                                                    {selectedPlace.minimum_spend ? `Rp ${selectedPlace.minimum_spend.toLocaleString()}` : '—'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Hours
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between py-2 border-b border-border/50">
                                                <span className="text-sm">Opening Hours</span>
                                                <span className="text-sm font-medium">{selectedPlace.opening_hours || '—'}</span>
                                            </div>
                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-sm">Busy Hours</span>
                                                <span className="text-sm font-medium">{selectedPlace.busy_hours || '—'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Common Visitors */}
                                {selectedPlace.common_visitors?.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Common Visitors</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedPlace.common_visitors.map((visitor: string) => (
                                                <span key={visitor} className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                    {toTitleCase(visitor)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                {selectedPlace.description && (
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{selectedPlace.description}</p>
                                    </div>
                                )}

                                {/* Location */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</h3>
                                    <div className="flex items-center gap-4 text-sm mb-3">
                                        <span className="text-muted-foreground">
                                            Lat: <span className="font-mono">{selectedPlace.latitude.toFixed(6)}</span>
                                        </span>
                                        <span className="text-muted-foreground">
                                            Lng: <span className="font-mono">{selectedPlace.longitude.toFixed(6)}</span>
                                        </span>
                                    </div>
                                    {/* Mini Map */}
                                    <div className="h-48 rounded-xl overflow-hidden border shadow-sm">
                                        <MapContainer
                                            center={[selectedPlace.latitude, selectedPlace.longitude]}
                                            zoom={15}
                                            scrollWheelZoom={false}
                                            dragging={false}
                                            zoomControl={false}
                                            attributionControl={false}
                                            className="h-full w-full"
                                            key={`${selectedPlace.latitude}-${selectedPlace.longitude}`}
                                        >
                                            <TileLayer
                                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                            />
                                            {placeIcon && (
                                                <Marker
                                                    position={[selectedPlace.latitude, selectedPlace.longitude]}
                                                    icon={placeIcon}
                                                />
                                            )}
                                        </MapContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t bg-muted/30">
                                <Button className="w-full" asChild>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.latitude},${selectedPlace.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Navigation className="h-4 w-4 mr-2" />
                                        Get Directions
                                    </a>
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Floating Action Button (FAB) */}
            <Dialog
                open={createOpen}
                onOpenChange={(open) => {
                    setCreateOpen(open)
                    if (open) resetForm()
                }}
            >
                <DialogTrigger asChild>
                    <Button
                        size="icon"
                        className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-2xl z-50 transition-all duration-300 hover:scale-110 active:scale-95 bg-primary text-primary-foreground border-4 border-background"
                    >
                        <Plus className="h-7 w-7" />
                        <span className="sr-only">Add Place</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 rounded-2xl">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-xl">Add New Place</DialogTitle>
                        <DialogDescription>Add a work-from-cafe friendly location</DialogDescription>
                    </DialogHeader>
                    <div className="px-6 py-4">
                        <PlaceForm
                            formData={formData}
                            setFormData={setFormData}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                    </div>
                    <DialogFooter className="p-6 pt-4 border-t bg-muted/20">
                        <Button variant="ghost" onClick={() => setCreateOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitCreate}
                            disabled={
                                loading ||
                                !formData.name ||
                                !formData.address ||
                                !formData.latitude ||
                                !formData.longitude
                            }
                            className="min-w-[120px]"
                        >
                            {loading ? 'Creating...' : 'Create Place'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
