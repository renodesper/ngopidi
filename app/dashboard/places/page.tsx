import { getPlaces, deletePlace, verifyPlace } from "@/app/actions/places"
import { PlacesTable } from "@/components/admin/PlacesTable"

export default async function PlacesPage() {
  const { data: places } = await getPlaces()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Places Management</h1>
      </div>
      <PlacesTable places={places || []} />
    </div>
  )
}
