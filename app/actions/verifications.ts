'use server'

import { prisma } from "@/lib/prisma"
import { PlaceStatus } from "@prisma/client"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

async function getSession() {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }
    return session
}

async function checkAdmin() {
    const session = await getSession()
    // @ts-ignore
    if (session.user.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }
    return session
}

export async function submitVerification(placeId: string, proofLink: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const verification = await prisma.placeVerification.create({
            data: {
                place_id: placeId,
                user_id: session.user.id,
                proof_link: proofLink,
                status: PlaceStatus.PENDING,
            },
        })

        revalidatePath("/")
        revalidatePath("/dashboard")
        revalidatePath(`/places/${placeId}`)

        return { success: true, data: verification }
    } catch (error) {
        console.error("Failed to submit verification:", error)
        return { success: false, error: "Failed to submit verification" }
    }
}

export async function getVerifications(placeId?: string) {
    try {
        const verifications = await prisma.placeVerification.findMany({
            where: placeId ? { place_id: placeId } : {},
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    }
                },
                place: {
                    select: {
                        name: true,
                    }
                }
            },
            orderBy: { created_at: "desc" },
        })
        return { success: true, data: verifications }
    } catch (error) {
        console.error("Failed to fetch verifications:", error)
        return { success: false, error: "Failed to fetch verifications" }
    }
}

export async function updateVerificationStatus(
    verificationId: string,
    status: PlaceStatus,
    adminNotes?: string
) {
    try {
        await checkAdmin()

        if (status === PlaceStatus.REJECTED) {
            await prisma.placeVerification.update({
                where: { id: verificationId },
                data: {
                    status: PlaceStatus.REJECTED,
                    admin_notes: adminNotes,
                }
            })
            revalidatePath("/admin")
            revalidatePath("/dashboard")
            return { success: true }
        }

        // Fetch verification and user role
        const verification = await prisma.placeVerification.findUnique({
            where: { id: verificationId },
            include: { user: true, place: true }
        })

        if (!verification) {
            return { success: false, error: "Verification not found" }
        }

        const newPlaceStatus = verification.user.role === "ADMIN" ? PlaceStatus.VERIFIED_ADMIN : PlaceStatus.VERIFIED_USER

        // Update verification status and place status
        await prisma.$transaction([
            prisma.placeVerification.update({
                where: { id: verificationId },
                data: {
                    status: newPlaceStatus,
                    admin_notes: adminNotes,
                }
            }),
            prisma.place.update({
                where: { id: verification.place_id },
                data: { status: newPlaceStatus }
            })
        ])

        revalidatePath("/admin")
        revalidatePath("/dashboard")
        revalidatePath(`/places/${verification.place_id}`)

        return { success: true }
    } catch (error) {
        console.error("Failed to update verification status:", error)
        return { success: false, error: "Failed to update verification status" }
    }
}
