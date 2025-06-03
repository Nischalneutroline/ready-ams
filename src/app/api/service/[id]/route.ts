import { NextRequest, NextResponse } from "next/server"
import { getAnnouncementOrOfferById } from "@/db/announcement-offer"
import { getAppointmentById } from "@/db/appointment"
import { getServiceById } from "@/db/service"
import { prisma } from "@/lib/prisma"
import { z, ZodError } from "zod"
import { Service } from "@prisma/client"
import { serviceSchema } from "@/app/admin/service/_schemas/service"

interface ParamsProps {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: ParamsProps) {
  try {
    const { id } = await params
    const service = await getServiceById(id)

    if (!service) {
      return NextResponse.json(
        { message: "Service with id not found!", success: false },
        { status: 404 }
      )
    }
    return NextResponse.json(
      {
        data: service,
        success: true,
        message: " Service fetched successfully!",
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch service!", success: false, error: error },
      { status: 500 }
    )
  }
}

//edit or  update service
export async function PUT(req: NextRequest, { params }: ParamsProps) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { message: "Service Id required!", success: false },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parsedData = serviceSchema.parse(body)

    const existingService = await getServiceById(id)

    if (!existingService) {
      return NextResponse.json(
        { message: "Service not found!", success: false },
        { status: 404 }
      )
    }
    // Service Availability TimeSlot update logic
    // const deledtedService = await prisma.service.delete({
    //   where: { id },
    // })
    // if (deledtedService) {

    const serviceAvailability = await prisma.serviceAvailability.deleteMany({
      where: {
        serviceId: id,
      },
    })

    console.log("serviceAvailability----------", serviceAvailability)

    if (serviceAvailability) {
      const updatedService = await prisma.service.update({
        where: { id },
        data: {
          title: parsedData.title,
          description: parsedData.description,
          estimatedDuration: parsedData.estimatedDuration,
          status: parsedData.status,
          businessDetailId: parsedData.businessDetailId,
          serviceAvailability: {
            create: parsedData.serviceAvailability?.map((availability) => ({
              weekDay: availability.weekDay,
              timeSlots: {
                create: availability.timeSlots?.map((timeSlot) => ({
                  startTime: timeSlot.startTime,
                  endTime: timeSlot.endTime,
                })),
              },
            })),
          },
        },
      })
      if (updatedService) {
        return NextResponse.json(
          {
            data: updatedService,
            success: true,
            message: "Service updated successfully!",
          },
          { status: 200 }
        )
      }
    }
    // update service

    // -------------------------_//

    return NextResponse.json(
      { message: "Failed to update service!", success: false },
      { status: 400 }
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
      { message: "Failed to update service!", success: false, error: error },
      { status: 500 }
    )
  }
}
// import { NextRequest, NextResponse } from "next/server"
// import { z, ZodError } from "zod"
// import { prisma } from "@/lib/prisma" // Adjust based on your Prisma setup
// import { getServiceById } from "@/features/service/api/api" // Adjust import path
// import { Status, WeekDays } from "@/lib/enums" // Adjust based on your enums

// // Zod schema
// export const serviceSchema = z.object({
//   id: z.string().optional(),
//   title: z.string().min(3, "Title must be at least 3 characters long"),
//   description: z
//     .string()
//     .min(10, "Description must be at least 10 characters long"),
//   estimatedDuration: z
//     .number()
//     .min(1, "Estimated duration must be a positive number"),
//   status: z.enum([Status.ACTIVE, Status.INACTIVE]).optional(),
//   serviceAvailability: z
//     .array(
//       z.object({
//         weekDay: z.enum([
//           WeekDays.SUNDAY,
//           WeekDays.MONDAY,
//           WeekDays.TUESDAY,
//           WeekDays.WEDNESDAY,
//           WeekDays.THURSDAY,
//           WeekDays.FRIDAY,
//           WeekDays.SATURDAY,
//         ]),
//         timeSlots: z
//           .array(
//             z.object({
//               startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
//                 message: "Invalid start time format",
//               }),
//               endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
//                 message: "Invalid end time format",
//               }),
//             })
//           )
//           .optional(),
//       })
//     )
//     .optional(),
//   businessDetailId: z.string().min(1, "Business ID is required"),
// })

// interface ParamsProps {
//   params: { id: string }
// }

// export async function PUT(req: NextRequest, { params }: ParamsProps) {
//   try {
//     const { id } = await params

//     if (!id) {
//       return NextResponse.json(
//         { error: "Service ID required!" },
//         { status: 400 }
//       )
//     }

//     const existingService = await getServiceById(id)

//     if (!existingService) {
//       return NextResponse.json({ error: "Service not found" }, { status: 404 })
//     }

//     const body = (await req.json()) as z.infer<typeof serviceSchema>
//     const parsedData = serviceSchema.parse(body)

//     // Start a transaction to ensure atomicity
//     const updatedService = await prisma.$transaction(async (tx) => {
//       // Delete existing service availability
//       await tx.serviceAvailability.deleteMany({
//         where: { serviceId: id },
//       })

//       // Update the service
//       const service = await tx.service.update({
//         where: { id },
//         data: {
//           title: parsedData.title,
//           description: parsedData.description,
//           estimatedDuration: parsedData.estimatedDuration,
//           status: parsedData.status || "ACTIVE",
//           businessDetailId: parsedData.businessDetailId,
//           serviceAvailability: {
//             create: parsedData.serviceAvailability?.map((availability) => ({
//               weekDay: availability.weekDay,
//               timeSlots: {
//                 create: availability.timeSlots?.map((timeSlot) => ({
//                   startTime: new Date(timeSlot.startTime),
//                   endTime: new Date(timeSlot.endTime),
//                 })),
//               },
//             })),
//           },
//         },
//       })

//       return service
//     })

//     return NextResponse.json(
//       { message: "Service updated successfully", service: updatedService },
//       { status: 200 }
//     )
//   } catch (error) {
//     if (error instanceof ZodError) {
//       return NextResponse.json(
//         { error: "Validation failed", details: error.errors },
//         { status: 400 }
//       )
//     }
//     console.error("Error updating service:", error)
//     return NextResponse.json(
//       { error: "Internal server error", message: String(error) },
//       { status: 500 }
//     )
//   }
// }
//delete service
export async function DELETE(req: NextRequest, { params }: ParamsProps) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { message: "Service Id required!", success: false },
        { status: 400 }
      )
    }

    const existingService = await getServiceById(id)

    if (!existingService) {
      return NextResponse.json(
        { message: "Service not found!", success: false },
        { status: 404 }
      )
    }

    const deletedService = await prisma.service.delete({
      where: { id },
    })

    if (!deletedService) {
      return NextResponse.json(
        { message: "Service could not be deleted!", success: false },
        { status: 404 }
      )
    }
    return NextResponse.json(
      {
        data: deletedService,
        success: true,
        message: "Service deleted successfully!",
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete service!", success: false, error: error },
      { status: 500 }
    )
  }
}
