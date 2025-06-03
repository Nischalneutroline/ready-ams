import { NextRequest, NextResponse } from "next/server"
import { getSupportDetailById } from "@/db/supportDetail"
import { prisma } from "@/lib/prisma"
import { ZodError } from "zod"
import { WeekDays } from "@/features/business-detail/types/types"
import { SupportBusinessDetailSchema } from "@/app/admin/support/_schemas/schema"
import { Prisma } from "@prisma/client"

interface ParamsProps {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: ParamsProps) {
  try {
    const { id } = await params
    const announcement = await getSupportDetailById(id)

    if (!announcement) {
      return NextResponse.json(
        { error: "Support Business Detail with id not found" },
        { status: 404 }
      )
    }
    return NextResponse.json(announcement, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch support business detail" },
      { status: 500 }
    )
  }
}

// **UPDATE SupportBusinessDetail**
export async function PUT(req: NextRequest, { params }: ParamsProps) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "Support Business ID is required" },
        { status: 400 }
      )
    }
    const body = await req.json()
    console.log(body, "body")
    const parsedData = SupportBusinessDetailSchema.parse(body)
    console.log(parsedData, "parsedData")

    const existingSupportDetail = await getSupportDetailById(id)
    console.log(existingSupportDetail, "existingSupportDetail")

    if (!existingSupportDetail) {
      return NextResponse.json(
        { error: "Support Business Detail not found" },
        { status: 404 }
      )
    }

    const deletedSupportAvailability =
      await prisma.supportBusinessDetail.delete({
        where: {
          id,
        },
      })

    let updatedSupportDetail

    // update support details
    if (deletedSupportAvailability) {
      updatedSupportDetail = await prisma.supportBusinessDetail.create({
        data: {
          id,
          supportBusinessName: parsedData.supportBusinessName,
          supportEmail: parsedData.supportEmail,
          supportPhone: parsedData.supportPhone,
          businessId: parsedData.businessId,
          supportAddress: parsedData.supportAddress,
          supportGoogleMap: parsedData.supportGoogleMap,
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
          message: "Support Business Detail updated successfully",
          data: updatedSupportDetail,
        },
        { status: 200 }
      )
    }
    return NextResponse.json(
      {
        message: "Support Business Detail updated failed!",
        data: updatedSupportDetail,
      },
      { status: 400 }
    )
  } catch (error) {
    if (error instanceof Prisma.PrismaClientValidationError) {
      console.error("Validation error:", error.message)
      // Handle the validation error specifically
      return {
        error: "Validation failed",
        details: error, // or use error.stack for full stack trace
      }
    }

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
