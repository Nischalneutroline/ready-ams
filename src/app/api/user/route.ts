import { NextRequest, NextResponse } from "next/server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getUserByEmail, getUserById } from "@/db/user"
import * as bcrypt from "bcryptjs"
import { Prisma } from "@prisma/client"
import { User } from "@/app/(admin)/customer/_types/customer"
import { userSchema } from "@/app/(admin)/customer/_schema/customer"

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as User
    const { email, password, name, phone, address, role } =
      userSchema.parse(body)

    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists!", success: false },
        { status: 400 }
      )
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password || "", 10)

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        address: address ? { create: { ...address } } : undefined,
        role,
      },
    })

    return NextResponse.json(
      { data: newUser, success: true, message: "User created successfully!" },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
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
      { message: "Failed to create user!", success: false, error: error },
      { status: 500 }
    )
  }
}

// GET: Retrieve all Users
export async function GET() {
  try {
    // get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        address: {
          select: {
            street: true,
            city: true,
            country: true,
            zipCode: true,
          },
        },
      },
    })
    console.log(users)

    // Check if there are any users
    if (users.length === 0) {
      return NextResponse.json(
        { message: "No users found!", success: false },
        { status: 404 }
      )
    }

    // Return the users
    return NextResponse.json(
      { data: users, success: true, message: "User fetched successfully!" },
      { status: 200 }
    )
  } catch (error) {
    // Handle errors
    return NextResponse.json(
      { message: "Failed to fetch users!", success: false, error: error },
      { status: 500 }
    )
  }
}
