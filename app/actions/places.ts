'use server'

import { prisma } from "@/lib/prisma"
import { PlaceStatus, Prisma } from "@prisma/client"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

// --- Public Actions ---

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

export async function getPlaces() {
  try {
    const places = await prisma.place.findMany({
      include: { images: true },
      orderBy: { createdAt: "desc" },
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
      include: { images: true },
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
  priceLevel?: number
  averageDrinkPrice?: number
  minimumSpend?: number
  
  // Connectivity
  wifiAvailable?: boolean
  wifiSpeed?: number
  wifiStability?: string
  wifiPolicy?: string
  
  // Power & Seating
  powerOutletsAvailable?: boolean
  powerOutletDensity?: string
  tableSize?: string
  seatingTypes?: string[]
  
  // Environment
  noiseLevel?: string
  musicVolume?: string
  crowdLevel?: string
  
  // Work Suitability
  laptopFriendly?: boolean
  stayPolicy?: string
  meetingFriendly?: boolean
  callFriendly?: boolean
  workFriendlyScore?: number
  
  // Facilities
  airConditioning?: boolean
  temperatureComfort?: string
  restroomAvailable?: boolean
  smokingArea?: string
  parkingAvailable?: boolean
  
  // Meta
  openingHours?: string
  busyHours?: string
  commonVisitors?: string[]
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
        
        priceLevel: data.priceLevel,
        averageDrinkPrice: data.averageDrinkPrice,
        minimumSpend: data.minimumSpend,
        
        wifiAvailable: data.wifiAvailable ?? false,
        wifiSpeed: data.wifiSpeed,
        wifiStability: data.wifiStability as any,
        wifiPolicy: data.wifiPolicy as any,
        
        powerOutletsAvailable: data.powerOutletsAvailable ?? false,
        powerOutletDensity: data.powerOutletDensity as any,
        tableSize: data.tableSize as any,
        seatingTypes: data.seatingTypes as any,
        
        noiseLevel: data.noiseLevel as any,
        musicVolume: data.musicVolume as any,
        crowdLevel: data.crowdLevel as any,
        
        laptopFriendly: data.laptopFriendly,
        stayPolicy: data.stayPolicy as any,
        meetingFriendly: data.meetingFriendly,
        callFriendly: data.callFriendly,
        workFriendlyScore: data.workFriendlyScore,
        
        airConditioning: data.airConditioning,
        temperatureComfort: data.temperatureComfort as any,
        restroomAvailable: data.restroomAvailable,
        smokingArea: data.smokingArea as any,
        parkingAvailable: data.parkingAvailable,
        
        openingHours: data.openingHours,
        busyHours: data.busyHours,
        commonVisitors: data.commonVisitors as any,
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
        
        priceLevel: data.priceLevel,
        averageDrinkPrice: data.averageDrinkPrice,
        minimumSpend: data.minimumSpend,
        
        wifiAvailable: data.wifiAvailable,
        wifiSpeed: data.wifiSpeed,
        wifiStability: data.wifiStability as any,
        wifiPolicy: data.wifiPolicy as any,
        
        powerOutletsAvailable: data.powerOutletsAvailable,
        powerOutletDensity: data.powerOutletDensity as any,
        tableSize: data.tableSize as any,
        seatingTypes: data.seatingTypes as any,
        
        noiseLevel: data.noiseLevel as any,
        musicVolume: data.musicVolume as any,
        crowdLevel: data.crowdLevel as any,
        
        laptopFriendly: data.laptopFriendly,
        stayPolicy: data.stayPolicy as any,
        meetingFriendly: data.meetingFriendly,
        callFriendly: data.callFriendly,
        workFriendlyScore: data.workFriendlyScore,
        
        airConditioning: data.airConditioning,
        temperatureComfort: data.temperatureComfort as any,
        restroomAvailable: data.restroomAvailable,
        smokingArea: data.smokingArea as any,
        parkingAvailable: data.parkingAvailable,
        
        openingHours: data.openingHours,
        busyHours: data.busyHours,
        commonVisitors: data.commonVisitors as any,
      },
    })
    revalidatePath("/dashboard/places")
    return { success: true, data: place }
  } catch (error) {
    return { success: false, error: "Failed to update place" }
  }
}
