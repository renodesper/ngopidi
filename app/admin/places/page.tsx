import { getPlacesList } from '@/app/actions/places'
import { auth } from '@/auth'
import { PlacesTable } from '@/components/organisms/PlacesTable'
import { PlaceStatus } from '@prisma/client'

interface SearchParams {
    page?: string
    search?: string
    status?: string
    sortKey?: string
    sortDir?: 'asc' | 'desc'
}

export default async function AdminPlacesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const params = await searchParams
    const { page, search, status, sortKey, sortDir } = params
    const session = await auth()
    const currentUserId = session?.user?.id
    // @ts-ignore
    const currentUserRole = session?.user?.role

    const currentPage = Number(page) || 1
    const currentStatus = status || 'ALL'

    const { data: places, totalPages } = await getPlacesList({
        page: currentPage,
        limit: 20,
        search: search || '',
        status: currentStatus,
        sortKey: sortKey || 'created_at',
        sortDir: sortDir || 'desc',
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Places Management</h1>
            </div>
            <PlacesTable
                places={places || []}
                page={currentPage}
                totalPages={totalPages || 1}
                statusFilter={currentStatus}
                searchQuery={search || ''}
                sortKey={sortKey || 'created_at'}
                sortDir={sortDir || 'desc'}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
            />
        </div>
    )
}
