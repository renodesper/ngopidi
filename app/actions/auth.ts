'use server'

import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Query user role to determine redirect path
  const { prisma } = await import("@/lib/prisma")
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true }
  })

  const redirectTo = user?.role === "ADMIN" ? "/admin" : "/dashboard"

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials."
        default:
          return "Something went wrong."
      }
    }
    throw error
  }
}

export async function logout() {
  const { signOut } = await import("@/auth")
  await signOut({ redirectTo: "/login" })
}

export async function register(
  prevState: { success: boolean; message: string } | undefined,
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  // Validation
  if (!name || name.length < 2) {
    return { success: false, message: "Name must be at least 2 characters." }
  }

  if (!email || !email.includes("@")) {
    return { success: false, message: "Please enter a valid email." }
  }

  if (!password || password.length < 6) {
    return { success: false, message: "Password must be at least 6 characters." }
  }

  if (password !== confirmPassword) {
    return { success: false, message: "Passwords do not match." }
  }

  try {
    const { prisma } = await import("@/lib/prisma")
    const bcrypt = await import("bcryptjs")

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { success: false, message: "Email already registered." }
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10)
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      }
    })

    return { success: true, message: "Registration successful! Please login." }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, message: "Something went wrong. Please try again." }
  }
}
