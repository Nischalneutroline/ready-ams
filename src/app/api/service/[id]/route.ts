import { NextRequest, NextResponse } from "next/server"
import { getAnnouncementOrOfferById } from "@/db/announcement-offer"
import { getAppointmentById } from "@/db/appointment"
import { getServiceById } from "@/db/service"
import { prisma } from "@/lib/prisma"
import { z, ZodError } from "zod"
import { Service } from "@prisma/client"
import { serviceSchema } from "@/app/(admin)/service/_schemas/service"
import { deleteImageFromStorage } from "@/lib/image-management";

interface ParamsProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: ParamsProps) {
  try {
    const { id } = await params;
    const service = await getServiceById(id);

    if (!service) {
      return NextResponse.json(
        { message: "Service with id not found!", success: false },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        data: service,
        success: true,
        message: " Service fetched successfully!",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch service!", success: false, error: error },
      { status: 500 }
    );
  }
}

//edit or  update service
export async function PUT(req: NextRequest, { params }: ParamsProps) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Service Id required!", success: false },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsedData = serviceSchema.parse(body);

    const existingService = await getServiceById(id);

    if (!existingService) {
      return NextResponse.json(
        { message: "Service not found!", success: false },
        { status: 404 }
      );
    }
    
     // Handle image replacement if needed
     if (body.imageUrlFileId && body.imageUrlFileId !== existingService.imageUrlFileId) {
      // If there's a new image and an old one exists, delete the old one
      if (existingService.imageUrlFileId) {
          await deleteImageFromStorage(existingService.imageUrlFileId);
        } 
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
          type: parsedData.type,
          description: parsedData.description,
          estimatedDuration: parsedData.estimatedDuration,
          status: parsedData.status,
          imageUrl: parsedData.imageUrl,
          imageUrlFileId: parsedData.imageUrlFileId,
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
      });
      if (updatedService) {
        return NextResponse.json(
          {
            data: updatedService,
            success: true,
            message: "Service updated successfully!",
          },
          { status: 200 }
        );
      }
    }
    // update service

    // -------------------------_//

    return NextResponse.json(
      { message: "Failed to update service!", success: false },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed!",
          error: error.errors[0].message,
          success: false,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Failed to update service!", success: false, error: error },
      { status: 500 }
    );
  }
}

//delete service
export async function DELETE(req: NextRequest, { params }: ParamsProps) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Service Id required!", success: false },
        { status: 400 }
      );
    }

    const existingService = await getServiceById(id);

    if (!existingService) {
      return NextResponse.json(
        { message: "Service not found!", success: false },
        { status: 404 }
      );
    }

    if (existingService.imageUrlFileId) {
        await deleteImageFromStorage(existingService.imageUrlFileId);
    }

    const deletedService = await prisma.service.delete({
      where: { id },
    });

    if (!deletedService) {
      return NextResponse.json(
        { message: "Service could not be deleted!", success: false },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        data: deletedService,
        success: true,
        message: "Service deleted successfully!",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete service!", success: false, error: error },
      { status: 500 }
    );
  }
}
