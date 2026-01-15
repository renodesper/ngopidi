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
    ChevronDown,
    ChevronUp,
    Filter,
    Info,
    MoreHorizontal,
    Pencil,
    Plus,
    SortAsc,
    SortDesc,
    Sparkles,
    Trash,
    Wifi,
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { createPlace, deletePlace, updatePlace } from '@/app/actions/places'
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
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<PlaceFormData>(defaultFormData)
    const [activeTab, setActiveTab] = useState('basic')
    const [searchValue, setSearchValue] = useState(searchQuery) // Local state for input

    const resetForm = () => {
        setFormData(defaultFormData)
        setActiveTab('basic')
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
        <div className="bg-card border rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-base">{place.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{place.address}</p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
                            <TableHead className="font-semibold w-[100px] text-center">Source</TableHead>
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
                                <TableRow key={place.id} className="group transition-colors">
                                    <TableCell className="font-medium px-6">{place.name}</TableCell>
                                    <TableCell className="text-center">
                                        {place.submitter_id === currentUserId ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                You
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground/30">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                        {place.address}
                                    </TableCell>
                                    <TableCell>
                                        <PlaceStatusBadge status={place.status} />
                                    </TableCell>
                                    <TableCell>
                                        {place.work_friendly_score ? (
                                            <div className="flex items-center gap-1.5 font-semibold text-amber-600">
                                                {Number(place.work_friendly_score).toFixed(1)}
                                            </div>
                                        ) : (
                                            '—'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-semibold text-emerald-600">
                                            {place.price_level ? '$'.repeat(place.price_level) : '—'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs uppercase tracking-wider font-medium">
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
