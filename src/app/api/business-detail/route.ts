import { NextRequest, NextResponse } from "next/server"
import { businessDetailSchema } from "@/features/business-detail/schemas/schema"
import { ZodError } from "zod"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { auth, clerkClient } from "@clerk/nextjs/server"

export async function POST(req: NextRequest) {
  const { userId,orgId } = await auth()

  if (!userId && !orgId) {
    return NextResponse.json(
      { message: "Unauthorized", success: false },
      { status: 401 }
    )
  }

  try {
    const client = await clerkClient()
    const body = await req.json()
    const parsedData = businessDetailSchema.parse(body)

    // Check if business with same email already exists
    const existingBusiness = await prisma.businessDetail.findUnique({
      where: { email: parsedData.email },
    })

    if (existingBusiness) {
      return NextResponse.json(
        {
          message: "Business with this email already exists!",
          success: false,
        },
        { status: 400 }
      )
    }

    // Create organization in Clerk
    const name = parsedData.name
    const user = await client.users.getUser(userId)
    const createdBy = user?.id

    const organization = await client.organizations.createOrganization({
      name,
      createdBy,
    })

    await client.organizations.updateOrganization(organization.id, {
      publicMetadata: {
        industry: parsedData.industry,
        email: parsedData.email,
        phone: parsedData.phone,
        website: parsedData.website,
        address: {
          city: parsedData.address[0].city,
          street: parsedData.address[0].street,
          country: parsedData.address[0].country,
          googleMap: parsedData.address[0].googleMap,
          zipCode: parsedData.address[0].zipCode,
        },
      },
    })

    // Create new business in Prisma
    const newBusiness = await prisma.businessDetail.create({
      data: {
        id: organization.id,
        name: parsedData.name,
        industry: parsedData.industry,
        email: parsedData.email,
        phone: parsedData.phone,
        website: parsedData.website,
        businessRegistrationNumber: parsedData.businessRegistrationNumber,
        timeZone: parsedData.timeZone,
        status: parsedData.status,
        address: {
          create: parsedData.address,
        },
        businessAvailability: {
          create: parsedData.businessAvailability.map((availability) => ({
            weekDay: availability.weekDay,
            type: availability.type,
            timeSlots: {
              create: availability.timeSlots.map((timeSlot) => ({
                type: timeSlot.type,
                startTime: timeSlot.startTime,
                endTime: timeSlot.endTime,
              })),
            },
          })),
        },
        holiday: {
          create: parsedData.holiday.map((holiday) => ({
            holiday: holiday.holiday,
            type: holiday.type,
            date: holiday.date || null,
          })),
        },
      },
      include: {
        address: true,
        businessAvailability: {
          include: {
            timeSlots: true,
          },
        },
        holiday: true,
      },
    })

    return NextResponse.json(
      {
        data: newBusiness,
        success: true,
        message: "Business created successfully!",
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed!",
          error: error.errors,
          success: false,
        },
        { status: 400 }
      )
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        {
          message: "Prisma validation failed",
          error: error.message,
          success: false,
        },
        { status: 400 }
      )
    }

    console.error("Unexpected error:", error)
    return NextResponse.json(
      {
        message: "Internal Server Error",
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const businessDetails = await prisma.businessDetail.findMany({
      include: {
        address: true,
        businessAvailability: {
          include: {
            timeSlots: true,
          },
        },
        holiday: true,
      },
    })

    if (!businessDetails.length) {
      return NextResponse.json(
        { message: "No business details found!", success: false },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        data: businessDetails,
        success: true,
        message: "Business fetched successfully!",
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch business details!",
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
