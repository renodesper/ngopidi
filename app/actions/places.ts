'use server'

import { prisma } from "@/lib/prisma"
import { PlaceStatus, Prisma } from "@prisma/client"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function submitPlace(data: Prisma.PlaceCreateInput) {
  try {
    const place = await prisma.place.create({
      data: {
        ...data,
        status: PlaceStatus.PENDING,
      },
    })
    return { success: true, data: place }
  } catch (error) {
    console.error("Failed to submit place:", error)
    return { success: false, error: "Failed to submit place" }
  }
}

export async function getPlaces(lat?: number, lng?: number, radiusKm: number = 1, statuses?: PlaceStatus[]) {
  try {
    let ids: string[] | null = null;

    if (lat !== undefined && lng !== undefined) {
      const radiusMeters = radiusKm * 1000;
      // Using raw SQL to perform spatial distance check
      const nearbyPlaces = await prisma.$queryRaw<any[]>`
        SELECT id FROM places 
        WHERE ST_DWithin(
          geo, 
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, 
          ${radiusMeters}
        )
      `;
      ids = nearbyPlaces.map(p => p.id);

      if (ids.length === 0) return { success: true, data: [] };
    }

    const where: Prisma.PlaceWhereInput = {}
    if (ids) where.id = { in: ids }
    if (statuses && statuses.length > 0) where.status = { in: statuses }

    const places = await prisma.place.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        latitude: true,
        longitude: true,
        status: true,
        price_level: true,
        average_drink_price: true,
        minimum_spend: true,
        wifi_available: true,
        wifi_speed: true,
        wifi_stability: true,
        wifi_policy: true,
        power_outlets_available: true,
        power_outlet_density: true,
        table_size: true,
        seating_types: true,
        noise_level: true,
        music_volume: true,
        crowd_level: true,
        laptop_friendly: true,
        stay_policy: true,
        meeting_friendly: true,
        call_friendly: true,
        work_friendly_score: true,
        air_conditioning: true,
        temperature_comfort: true,
        restroom_available: true,
        prayer_room_available: true,
        smoking_area: true,
        parking_available: true,
        opening_hours: true,
        busy_hours: true,
        common_visitors: true,
        created_at: true,
        updated_at: true,
        // images: true,
      },
      orderBy: { created_at: "desc" },
    })
    return { success: true, data: places }
  } catch (error) {
    console.error("Failed to fetch places:", error)
    return { success: false, error: "Failed to fetch places" }
  }
}

export async function getPlaceById(id: string) {
  try {
    const place = await prisma.place.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        latitude: true,
        longitude: true,
        status: true,
        price_level: true,
        average_drink_price: true,
        minimum_spend: true,
        wifi_available: true,
        wifi_speed: true,
        wifi_stability: true,
        wifi_policy: true,
        power_outlets_available: true,
        power_outlet_density: true,
        table_size: true,
        seating_types: true,
        noise_level: true,
        music_volume: true,
        crowd_level: true,
        laptop_friendly: true,
        stay_policy: true,
        meeting_friendly: true,
        call_friendly: true,
        work_friendly_score: true,
        air_conditioning: true,
        temperature_comfort: true,
        restroom_available: true,
        prayer_room_available: true,
        smoking_area: true,
        parking_available: true,
        opening_hours: true,
        busy_hours: true,
        common_visitors: true,
        created_at: true,
        updated_at: true,
        // images: true,
      }
    })
    return { success: true, data: place }
  } catch (error) {
    return { success: false, error: "Place not found" }
  }
}

// --- Admin Actions ---

async function checkAdmin() {
  const session = await auth()
  // @ts-ignore
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
}

export interface PlaceFormData {
  // Basic
  name: string
  address: string
  description?: string
  latitude: number
  longitude: number
  status?: PlaceStatus

  // Pricing
  price_level?: number
  average_drink_price?: number
  minimum_spend?: number

  // Connectivity
  wifi_available?: boolean
  wifi_speed?: number
  wifi_stability?: string
  wifi_policy?: string

  // Power & Seating
  power_outlets_available?: boolean
  power_outlet_density?: string
  table_size?: string
  seating_types?: string[]

  // Environment
  noise_level?: string
  music_volume?: string
  crowd_level?: string

  // Work Suitability
  laptop_friendly?: boolean
  stay_policy?: string
  meeting_friendly?: boolean
  call_friendly?: boolean
  work_friendly_score?: number

  // Facilities
  air_conditioning?: boolean
  temperature_comfort?: string
  restroom_available?: boolean
  smoking_area?: string
  parking_available?: boolean

  // Meta
  opening_hours?: string
  busy_hours?: string
  common_visitors?: string[]
}

export async function createPlace(data: PlaceFormData) {
  await checkAdmin()
  try {
    const place = await prisma.place.create({
      data: {
        name: data.name,
        address: data.address,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        status: data.status ?? PlaceStatus.PENDING,

        price_level: data.price_level,
        average_drink_price: data.average_drink_price,
        minimum_spend: data.minimum_spend,

        wifi_available: data.wifi_available ?? false,
        wifi_speed: data.wifi_speed,
        wifi_stability: data.wifi_stability as any,
        wifi_policy: data.wifi_policy as any,

        power_outlets_available: data.power_outlets_available ?? false,
        power_outlet_density: data.power_outlet_density as any,
        table_size: data.table_size as any,
        seating_types: data.seating_types as any,

        noise_level: data.noise_level as any,
        music_volume: data.music_volume as any,
        crowd_level: data.crowd_level as any,

        laptop_friendly: data.laptop_friendly,
        stay_policy: data.stay_policy as any,
        meeting_friendly: data.meeting_friendly,
        call_friendly: data.call_friendly,
        work_friendly_score: data.work_friendly_score,

        air_conditioning: data.air_conditioning,
        temperature_comfort: data.temperature_comfort as any,
        restroom_available: data.restroom_available,
        smoking_area: data.smoking_area as any,
        parking_available: data.parking_available,

        opening_hours: data.opening_hours,
        busy_hours: data.busy_hours,
        common_visitors: data.common_visitors as any,
      },
    })
    revalidatePath("/dashboard/places")
    return { success: true, data: place }
  } catch (error) {
    console.error("Failed to create place:", error)
    return { success: false, error: "Failed to create place" }
  }
}

export async function verifyPlace(id: string, status: PlaceStatus) {
  await checkAdmin()
  try {
    const place = await prisma.place.update({
      where: { id },
      data: { status },
    })
    revalidatePath("/dashboard/places")
    return { success: true, data: place }
  } catch (error) {
    return { success: false, error: "Failed to verify place" }
  }
}

export async function deletePlace(id: string) {
  await checkAdmin()
  try {
    await prisma.place.delete({ where: { id } })
    revalidatePath("/dashboard/places")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete place" }
  }
}

export async function updatePlace(id: string, data: Partial<PlaceFormData>) {
  await checkAdmin()
  try {
    const place = await prisma.place.update({
      where: { id },
      data: {
        name: data.name,
        address: data.address,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        status: data.status,

        price_level: data.price_level,
        average_drink_price: data.average_drink_price,
        minimum_spend: data.minimum_spend,

        wifi_available: data.wifi_available,
        wifi_speed: data.wifi_speed,
        wifi_stability: data.wifi_stability as any,
        wifi_policy: data.wifi_policy as any,

        power_outlets_available: data.power_outlets_available,
        power_outlet_density: data.power_outlet_density as any,
        table_size: data.table_size as any,
        seating_types: data.seating_types as any,

        noise_level: data.noise_level as any,
        music_volume: data.music_volume as any,
        crowd_level: data.crowd_level as any,

        laptop_friendly: data.laptop_friendly,
        stay_policy: data.stay_policy as any,
        meeting_friendly: data.meeting_friendly,
        call_friendly: data.call_friendly,
        work_friendly_score: data.work_friendly_score,

        air_conditioning: data.air_conditioning,
        temperature_comfort: data.temperature_comfort as any,
        restroom_available: data.restroom_available,
        smoking_area: data.smoking_area as any,
        parking_available: data.parking_available,

        opening_hours: data.opening_hours,
        busy_hours: data.busy_hours,
        common_visitors: data.common_visitors as any,
      },
    })
    revalidatePath("/dashboard/places")
    return { success: true, data: place }
  } catch (error) {
    return { success: false, error: "Failed to update place" }
  }
}
