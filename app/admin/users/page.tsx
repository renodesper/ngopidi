import { getUsers } from "@/app/actions/users"
import { UsersTable } from "@/components/admin/UsersTable"

export default async function AdminUsersPage() {
    const { data: usersResponse } = await getUsers()
    const users = usersResponse as any[]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Users Management</h1>
            </div>
            <UsersTable users={users || []} />
        </div>
    )
}
