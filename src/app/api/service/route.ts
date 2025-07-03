import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { prisma } from "@/lib/prisma"
import { getServiceById } from "@/db/service"
import { Service } from "@/app/(admin)/service/_types/service"
import { serviceSchema } from "@/app/(admin)/service/_schemas/service"
import { Prisma } from "@prisma/client"

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Service

    const parsedData = serviceSchema.parse(body)

    const newService = await prisma.service.create({
      data: {
        title: parsedData.title,
          type: parsedData.type || "PHYSICAL",
        description: parsedData.description,
        estimatedDuration: parsedData.estimatedDuration,
        status: parsedData.status || "ACTIVE", // Fallback to default if undefined
         imageUrl: parsedData.imageUrl, 
        imageUrlFileId: parsedData.imageUrlFileId, 
        serviceAvailability: {
          create: parsedData.serviceAvailability?.map((availability) => ({
            weekDay: availability.weekDay,
            timeSlots: {
              create: availability.timeSlots?.map((timeSlot) => ({
                startTime: timeSlot.startTime, // Explicitly convert to Date
                endTime: timeSlot.endTime, // Explicitly convert to Date
              })),
            },
          })),
        },
        businessDetailId: parsedData.businessDetailId,
      },
    })

    if (!newService) {
      return NextResponse.json(
        { message: "Failed to create service", success: false },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        data: newService,
        success: true,
        message: "New Service created successfully!",
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Prisma.PrismaClientValidationError) {
      console.error("Validation error:", error)
      // Handle the validation error specifically
      return {
        error: "Validation failed",
        details: error, // or use error.stack for full stack trace
      }
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed!",
          error: error,
          success: false,
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { message: "Failed to create service!", success: false, error: error },
      { status: 500 }
    )
  }
}


//fetch all service
export async function GET() {
  try {
    // get all services
    const services = await prisma.service.findMany({
      include: {
        appointments: true,
        serviceAvailability: {
          include: {
            timeSlots: true,
          },
        },
        businessDetail: {
          include: {
            businessAvailability: {
              include: {
                timeSlots: true,
              },
            },
            holiday: true,
          },
        },
      },
    });

    if (services.length === 0) {
      return NextResponse.json(
        { message: "No services found!", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: services,
        success: true,
        message: "Services fetched successfully!",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch services!", success: false, error: error },
      { status: 500 }
    );
  }
}
