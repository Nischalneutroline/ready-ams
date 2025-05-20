// lib/signup.ts
"use server"
import { clerkClient } from "@clerk/nextjs/server"

interface SignupData {
  email: string
  password: string
  name?: string
}

export async function signup({ email, password, name }: SignupData) {
  const clerk = await clerkClient()
  try {
    const user = await clerk.users.createUser({
      emailAddress: [email],
      password,
      firstName: name?.split(" ")[0],
      lastName: name?.split(" ").slice(1).join(" "),
    })

    // Optional: set public metadata
    await clerk.users.updateUser(user.id, {
      publicMetadata: {
        role: "user",
      },
    })

    return {
      success: true,
      userId: user.id,
      message: "User created successfully",
    }
  } catch (error: any) {
    console.error("Error creating Clerk user:", error)
    return {
      success: false,
      message: error?.errors?.[0]?.message || "Failed to create user",
    }
  }
}
