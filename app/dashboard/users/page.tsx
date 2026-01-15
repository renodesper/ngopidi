import { getUsersList } from '@/app/actions/users'
import { UsersTable } from '@/components/organisms/UsersTable'

interface SearchParams {
    page?: string
    limit?: string
}

export default async function UsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const params = await searchParams
    const currentPage = Number(params.page) || 1

    const { data: users, totalPages } = await getUsersList({
        page: currentPage,
        limit: 20,
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Users Management</h1>
            </div>
            <UsersTable users={users || []} page={currentPage} totalPages={totalPages || 1} />
        </div>
    )
}
