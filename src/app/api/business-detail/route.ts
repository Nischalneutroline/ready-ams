import { NextRequest, NextResponse } from "next/server"
import { businessDetailSchema } from "@/features/business-detail/schemas/schema"
import { ZodError } from "zod"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { business } from "../../../features/business-detail/action/action"

const client = await clerkClient()

export async function POST(req: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json(
      { message: "Unauthorized", success: false },
      { status: 401 }
    )
  }

  try {
    const body = await req.json()
    const parsedData = businessDetailSchema.parse(body)

    // Check if business with same email already exists
    const existingBusiness = await prisma.businessDetail.findUnique({
      where: { email: parsedData.email },
    })

    if (existingBusiness) {
      return NextResponse.json(
        { message: "Business with this email already exists!", success: false },
        { status: 400 }
      )
    }

    // Get Clerk user
    const user = await client.users.getUser(userId)
    if (!user || !user?.id) {
      return NextResponse.json(
        { message: "User not found in Clerk", success: false },
        { status: 400 }
      )
    }

    const createdBy: string = user.id

    // Create organization in Clerk
    const organization = await client.organizations.createOrganization({
      name: parsedData.name,
      createdBy,
    })

    // Update organization metadata
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

    // Create business in DB
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
        businessOwner: user.id,
        address: {
          create: parsedData.address,
        },
        // businessAvailability: {
        //   create: parsedData.businessAvailability.map((availability) => ({
        //     weekDay: availability.weekDay,
        //     type: availability.type,
        //     timeSlots: {
        //       create: availability.timeSlots.map((timeSlot) => ({
        //         type: timeSlot.type,
        //         startTime: timeSlot.startTime,
        //         endTime: timeSlot.endTime,
        //       })),
        //     },
        //   })),
        // },
        // holiday: {
        //   create: parsedData.holiday.map((holiday) => ({
        //     holiday: holiday.holiday,
        //     type: holiday.type,
        //     date: holiday.date || null,
        //   })),
        // },
      },
      include: {
        address: true,
        businessAvailability: { include: { timeSlots: true } },
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

    if ((error as any)?.clerkError && Array.isArray((error as any).errors)) {
      return NextResponse.json(
        {
          message: "Clerk API Error",
          error: (error as any).errors,
          success: false,
        },
        { status: 422 }
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
  let businessDetails: any = []
  try {
    businessDetails = await prisma.businessDetail.findMany({
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
