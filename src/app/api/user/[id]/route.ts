import { NextRequest, NextResponse } from "next/server"

import { getUserById } from "@/db/user"
import { ZodError } from "zod"
import { prisma } from "@/lib/prisma"
import { userSchema } from "@/app/(admin)/customer/_schema/customer"

interface ParamsProps {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: ParamsProps) {
  try {
    const { id } = await params
    const announcement = await getUserById(id)

    if (!announcement) {
      return NextResponse.json(
        { error: "User with id not found" },
        { status: 404 }
      )
    }
    return NextResponse.json(announcement, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

// PUT: Update an existing User
export async function PUT(req: NextRequest, { params }: ParamsProps) {
  try {
    const { id } = await params
    const body = await req.json()

    const parsedData = userSchema.parse(body)

    // Find the user by email (in a real scenario, use a unique identifier like userId)
    const existingUser = await getUserById(id)

    if (!existingUser) {
      return NextResponse.json({ error: "User not found!" }, { status: 404 })
    }

    // Update the user in primsa
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...existingUser,
        email: parsedData.email,
        password: parsedData.password
          ? parsedData.password
          : existingUser.password,
        name: parsedData.name,
        phone: parsedData.phone,
        address: parsedData.address && {
          update: {
            street: parsedData.address.street,
            city: parsedData.address.city,
            country: parsedData.address.country,
            zipCode: parsedData.address.zipCode,
          },
        },
        isActive: parsedData.isActive,
        role: parsedData.role,
      },
    })

    return NextResponse.json(
      { message: "User updated successfully!", user: updatedUser },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", message: error },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error", message: error },
      { status: 500 }
    )
  }
}

// DELETE: Delete a User
export async function DELETE(req: NextRequest, { params }: ParamsProps) {
  try {
    const { id } = await params

    const existingUser = await getUserById(id)

    if (!existingUser) {
      return NextResponse.json(
        { message: "User not found!", success: false },
        { status: 404 }
      )
    }

    const deletedUser = await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json(
      {
        data: deletedUser,
        success: true,
        message: "User deleted successfully!",
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed!",
          error: error.errors[0].message,
          success: false,
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      {
        message: "Failed to delete user!",
        success: false,
        error: error,
      },
      { status: 500 }
    )
  }
}
