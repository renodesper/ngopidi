import { getPlaces } from "@/app/actions/places"
import { PlacesTable } from "@/components/admin/PlacesTable"
import { PlaceStatus } from "@prisma/client"

export default async function AdminPlacesPage() {
    const { data: places } = await getPlaces(undefined, undefined, undefined, [
        PlaceStatus.UNVERIFIED,
        PlaceStatus.VERIFIED_ADMIN,
        PlaceStatus.VERIFIED_USER
    ])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Places Management</h1>
            </div>
            <PlacesTable places={places || []} />
        </div>
    )
}
