'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { submitPlace } from "@/app/actions/places"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  wifiSpeed: z.coerce.number().optional(),
  priceLevel: z.coerce.number().min(1).max(5).optional(),
  latitude: z.number(),
  longitude: z.number(),
})

type FormData = z.infer<typeof formSchema>

export default function SubmitPage() {
  const router = useRouter()
  const [loadingLocation, setLoadingLocation] = useState(false)
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      latitude: 0,
      longitude: 0,
    }
  })

  const getLocation = () => {
    setLoadingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue("latitude", position.coords.latitude)
          setValue("longitude", position.coords.longitude)
          setLoadingLocation(false)
        },
        (error) => {
          console.error(error)
          setLoadingLocation(false)
          alert("Could not get location")
        }
      )
    } else {
      setLoadingLocation(false)
      alert("Geolocation is not supported")
    }
  }

  const onSubmit = async (data: FormData) => {
    const res = await submitPlace({
      name: data.name,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      wifiSpeed: data.wifiSpeed,
      priceLevel: data.priceLevel || 1,
      status: "SUBMITTED"
    })

    if (res.success) {
      alert("Place submitted successfully! It will be reviewed by admin.")
      router.push('/')
    } else {
      alert("Failed to submit place.")
    }
  }

  const lat = watch("latitude")
  const lng = watch("longitude")

  return (
    <div className="container max-w-lg mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Submit a WFC Spot</CardTitle>
          <CardDescription>Share a great place to work from.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
               <Label>Place Name</Label>
               <Input {...register("name")} placeholder="Coffee Shop Name" />
               {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
               <Label>Address</Label>
               <Input {...register("address")} placeholder="Full Address" />
               {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Wifi Speed (Mbps)</Label>
                <Input type="number" {...register("wifiSpeed")} placeholder="e.g. 50" />
              </div>
              <div className="space-y-2">
                <Label>Price Level (1-5)</Label>
                <Input type="number" min="1" max="5" {...register("priceLevel")} placeholder="1" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <div className="flex gap-2 items-center">
                 <Button type="button" variant="outline" onClick={getLocation} disabled={loadingLocation}>
                   {loadingLocation ? "Locating..." : "Use Current Location"}
                 </Button>
                 <div className="text-sm text-gray-500">
                   {lat !== 0 ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : "No location set"}
                 </div>
              </div>
              <Input type="hidden" {...register("latitude")} />
              <Input type="hidden" {...register("longitude")} />
              {(errors.latitude || errors.longitude) && <p className="text-red-500 text-sm">Location is required</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Place"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
