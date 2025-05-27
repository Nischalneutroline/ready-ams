import { NextRequest, NextResponse } from "next/server"
import { getAnnouncementOrOfferById } from "@/db/announcement-offer"
import { getAppointmentById } from "@/db/appointment"
import { getBusinessDetailById } from "@/db/businessDetail"
import { prisma } from "@/lib/prisma"
import { ZodError } from "zod"
import { businessDetailSchema } from "@/features/business-detail/schemas/schema"
import { Prisma } from "@prisma/client"
import { auth, clerkClient } from "@clerk/nextjs/server"

interface ParamsProps {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: ParamsProps) {
  try {
    const { id } = await params
    const businessDetails = await getBusinessDetailById(id)
    console.log(businessDetails, "businessDetails")
    if (!businessDetails) {
      return NextResponse.json(
        { error: "Business Detail with id not found" },
        { status: 404 }
      )
    }
    return NextResponse.json(businessDetails, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch business-detail" },
      { status: 500 }
    )
  }
}

// Update an existing business detail
export async function PUT(req: NextRequest, { params }: ParamsProps) {
  const { userId, orgId } = await auth()

  if (!userId && !orgId) {
    return NextResponse.json(
      { message: "Unauthorized", success: false },
      { status: 401 }
    )
  }

  try {
    const client = await clerkClient()
    const { id } = await params // or Get the ID from the request body
    const body = await req.json()
    const parsedData = businessDetailSchema.parse(body)

    if (!id) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 }
      )
    }
    const existingBusiness = await prisma.businessDetail.findFirst({
      where: {
        email: parsedData.email,
        NOT: { id },
      },
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

    // Log parsed data for debugging
    console.log("Parsed Data:", JSON.stringify(parsedData, null, 2))

    const business = await getBusinessDetailById(id)

    if (!business) {
      return NextResponse.json(
        { error: "Business Detail with id not found" },
        { status: 404 }
      )
    }

    await client.organizations.updateOrganization(id, {
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

    const deletedBusiness = await prisma.businessDetail.delete({
      where: { id },
    })
    if (deletedBusiness) {
      const updatedBusiness = await prisma.businessDetail.create({
        data: {
          id: id,
          name: parsedData.name,
          industry: parsedData.industry,
          email: parsedData.email,
          phone: parsedData.phone,
          website: parsedData.website,
          businessOwner: parsedData.businessOwner,
          businessRegistrationNumber: parsedData.businessRegistrationNumber,
          status: parsedData.status,
          timeZone: parsedData.timeZone,

          // Handle addresses
          address: {
            create: parsedData.address.map((address) => ({
              street: address.street,
              city: address.city,
              country: address.country,
              zipCode: address.zipCode,
              googleMap: address.googleMap || "",
            })),
          },
          // Handle business availability
          // businessAvailability: {
          //   create: parsedData.businessAvailability.map((availability) => ({
          //     weekDay: availability.weekDay,
          //     type: availability.type,
          //     timeSlots: {
          //       create: availability.timeSlots.map((slot) => ({
          //         type: slot.type,
          //         startTime: slot.startTime,
          //         endTime: slot.endTime,
          //       })),
          //     },
          //   })),
          // },

          // Handle holidays
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
          businessAvailability: {
            include: {
              timeSlots: true,
            },
          },
          holiday: true,
        },
      })

      if (updatedBusiness) {
        return NextResponse.json(
          { message: "Business updated successfully", data: updatedBusiness },
          { status: 200 }
        )
      }
    }
  } catch (error) {
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
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      )
    }
    console.error("Prisma Error:", error) // Log the full error for debugging
    return NextResponse.json(
      { error: "Internal server error", detail: error },
      { status: 500 }
    )
  }
}

// Delete a business detail
export async function DELETE(req: NextRequest, { params }: ParamsProps) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 }
      )
    }

    const existingBusiness = await getBusinessDetailById(id)

    if (!existingBusiness) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    const deletedBusiness = await prisma.businessDetail.delete({
      where: { id },
    })

    if (!deletedBusiness) {
      return NextResponse.json(
        { error: "Business couldn't be deleted" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: "Business deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete business", detail: error },
      { status: 500 }
    )
  }
}
