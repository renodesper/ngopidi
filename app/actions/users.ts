'use server'

import { prisma } from "@/lib/prisma"
import { UserRole, Prisma } from "@prisma/client"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

async function checkAdmin() {
  const session = await auth()
  // @ts-ignore
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
}

export async function getUsers() {
  await checkAdmin()
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    })
    return { success: true, data: users }
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return { success: false, error: "Failed to fetch users" }
  }
}

export async function getUserById(id: string) {
  await checkAdmin()
  try {
    const user = await prisma.user.findUnique({ where: { id } })
    return { success: true, data: user }
  } catch (error) {
    return { success: false, error: "User not found" }
  }
}

export async function createUser(data: {
  email: string
  name?: string
  password: string
  role: UserRole
}) {
  await checkAdmin()
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10)
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: data.role,
      },
    })
    revalidatePath("/dashboard/users")
    return { success: true, data: user }
  } catch (error) {
    console.error("Failed to create user:", error)
    return { success: false, error: "Failed to create user" }
  }
}

export async function updateUser(
  id: string,
  data: {
    email?: string
    name?: string
    password?: string
    role?: UserRole
  }
) {
  await checkAdmin()
  try {
    const updateData: Prisma.UserUpdateInput = {
      email: data.email,
      name: data.name,
      role: data.role,
    }
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10)
    }
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    })
    revalidatePath("/dashboard/users")
    return { success: true, data: user }
  } catch (error) {
    console.error("Failed to update user:", error)
    return { success: false, error: "Failed to update user" }
  }
}

export async function deleteUser(id: string) {
  await checkAdmin()
  try {
    await prisma.user.delete({ where: { id } })
    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete user:", error)
    return { success: false, error: "Failed to delete user" }
  }
}
