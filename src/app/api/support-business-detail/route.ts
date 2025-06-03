import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import {
  AvailabilityType,
  Holiday,
  HolidayType,
  WeekDays,
} from "@/features/business-detail/types/types"
import { prisma } from "@/lib/prisma"
import {
  getSupportDetailByBusinessId,
  getSupportDetailByEmail,
  getSupportDetailById,
} from "@/db/supportDetail"
import { SupportBusinessDetailSchema } from "@/app/admin/support/_schemas/schema"
import { Prisma } from "@prisma/client"

// Dummy database for support business details
// let supportDetails: SupportBusinessDetail[] = [
//   {
//     id: "support-id-123",
//     supportBusinessName: "Tech Solutions Support",
//     supportEmail: "support@techsolutions.com",
//     supportPhone: "+977 1 4002100",
//     supportAddress: "789 Support Street, Kathmandu, Nepal",
//     supportGoogleMap: "https://goo.gl/maps/5678abc",
//     supportAvailability: [
//       {
//         id: "support-availability-id-1",
//         weekDay: WeekDays.MONDAY,
//         type: AvailabilityType.SUPPORT, // Only 'SUPPORT' for Support-specific Availability
//         timeSlots: [
//           {
//             id: "support-time-slot-id-1",
//             startTime: "2025-03-01T08:00:00Z",
//             endTime: "2025-03-01T16:00:00Z",
//           },
//         ],
//       },
//     ],
//     supportHoliday: [
//       {
//         id: "support-holiday-id-1",
//         holiday: WeekDays.SUNDAY,
//         type: HolidayType.SUPPORT, // Only 'SUPPORT' for Support Holidays
//         date: "2025-04-20T00:00:00Z",
//       },
//     ],
//     businessId: "business-id-123", // Link to the primary business
//   },
// ]

// **CREATE SupportBusinessDetail**
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsedData = SupportBusinessDetailSchema.parse(body)

    // Check if the business exists
    const existingSupportDetail = await getSupportDetailByEmail(
      parsedData.supportEmail
    )

    if (existingSupportDetail) {
      return NextResponse.json(
        { error: "Business with this email already exists!" },
        { status: 400 }
      )
    }

    // check if support detaila already exist by business id
    // one one support detaila is allowed per business
    const existingSupportDetailById = await getSupportDetailByBusinessId(
      parsedData.businessId
    )

    if (existingSupportDetailById) {
      return NextResponse.json(
        { error: "Support Business Detail already exists!" },
        { status: 400 }
      )
    }

    // User prisma logic
    const newSupportDetail = await prisma.supportBusinessDetail.create({
      data: {
        supportBusinessName: parsedData.supportBusinessName,
        supportEmail: parsedData.supportEmail,
        supportPhone: parsedData.supportPhone,
        businessId: parsedData.businessId,
        supportAddress: parsedData.supportAddress,
        supportAvailability: {
          create: parsedData.supportAvailability.map((availability) => ({
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
        supportHoliday: {
          create: parsedData.supportHoliday.map((holiday) => ({
            holiday: holiday.holiday as WeekDays,
            type: holiday.type,
            date: holiday.date || null,
          })),
        },
      },
      include: {
        supportAvailability: {
          include: {
            timeSlots: true,
          },
        },
        supportHoliday: true,
      },
    })

    return NextResponse.json(
      {
        message: "Support Business Detail created successfully",
        data: newSupportDetail,
        success: true,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Prisma.PrismaClientValidationError) {
      console.error("Validation error:", error.message)
      // Handle the validation error specifically
      return {
        error: "Validation failed",
        details: error, // or use error.stack for full stack trace
        success: false,
      }
    }
    console.log(error)
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors, success: false },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error", detail: error, success: false },
      { status: 500 }
    )
  }
}

// **READ all SupportBusinessDetails**
export async function GET() {
  try {
    const supportDetails = await prisma.supportBusinessDetail.findMany({
      include: {
        supportAvailability: {
          include: {
            timeSlots: true,
          },
        },
        supportHoliday: true,
      },
    })

    if (supportDetails.length === 0) {
      return NextResponse.json(
        { error: "No support details found" },
        { status: 404 }
      )
    }
    return NextResponse.json(supportDetails, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch support details" },
      { status: 500 }
    )
  }
}

// **UPDATE SupportBusinessDetail**
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const parsedData = SupportBusinessDetailSchema.parse(body)

    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: "Support Business ID is required" },
        { status: 400 }
      )
    }

    const existingSupportDetail = await getSupportDetailById(id)

    if (!existingSupportDetail) {
      return NextResponse.json(
        { error: "Support Business Detail not found" },
        { status: 404 }
      )
    }

    // update support details
    const updatedSupportDetail = await prisma.supportBusinessDetail.update({
      where: { id },
      data: {
        supportBusinessName: parsedData.supportBusinessName,
        supportEmail: parsedData.supportEmail,
        supportPhone: parsedData.supportPhone,
        // Handle addresses
        supportAddress: parsedData.supportAddress,

        // Handle business availability
        supportAvailability: {
          upsert: parsedData.supportAvailability.map((availability) => ({
            where: { id: availability.id || "" },
            update: {
              weekDay: availability.weekDay,
              type: availability.type,
              timeSlots: {
                upsert: availability.timeSlots.map((slot) => ({
                  where: { id: slot.id || "" },
                  update: {
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                  },
                  create: {
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                  },
                })),
              },
            },
            create: {
              weekDay: availability.weekDay,
              type: availability.type,
              timeSlots: {
                create: availability.timeSlots.map((slot) => ({
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                })),
              },
            },
          })),
        },

        // Handle holidays
        supportHoliday: {
          upsert: parsedData.supportHoliday.map((holiday) => ({
            where: { id: holiday.id || "" },
            update: {
              holiday: holiday.holiday as WeekDays,
              type: holiday.type,
              date: holiday.date,
            },
            create: {
              holiday: holiday.holiday as WeekDays,
              type: holiday.type,
              date: holiday.date,
            },
          })),
        },
      },
      include: {
        supportAvailability: {
          include: {
            timeSlots: true,
          },
        },
        supportHoliday: true,
      },
    })

    return NextResponse.json(
      {
        message: "Support Business Detail updated successfully",
        data: updatedSupportDetail,
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// **DELETE SupportBusinessDetail**
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json(
        { error: "Support Detail ID is required" },
        { status: 400 }
      )
    }

    const existingSupportDetail = await getSupportDetailById(id)

    if (!existingSupportDetail) {
      return NextResponse.json(
        { error: "Support Business Detail not found" },
        { status: 404 }
      )
    }

    const deletedSupportDetail = await prisma.supportBusinessDetail.delete({
      where: { id },
    })

    if (!deletedSupportDetail) {
      return NextResponse.json(
        { error: "Support Business Detail couldn't be deleted" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        message: "Support Business Detail deleted successfully",
        data: deletedSupportDetail,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete support detail" },
      { status: 500 }
    )
  }
}
