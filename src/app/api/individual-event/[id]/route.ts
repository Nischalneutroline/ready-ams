import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  shareableLinkWithServiceSchema,
} from "@/features/individual-event/schemas/schema";

interface ParamsProps {
  params: Promise<{ id: string }>;
}

// GET /api/individual-event/[id]
export async function GET(req: NextRequest, { params }: ParamsProps)  {
   const { id } = await params;
  try {
    const event = await prisma.service.findUnique({
      where: { id },
      include: {
        serviceAvailability: {
          include: { timeSlots: true },
        },
        shareableLinks: true,
        meetings: true,
      },
    });
    if (!event ) {
      return NextResponse.json({ message: "Event not found", success: false }, { status: 404 });
    }
    return NextResponse.json({ data: event, success: true });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch event", error, success: false }, { status: 500 });
  }
}

// PUT /api/individual-event/[id]
export async function PUT(req: NextRequest, { params }: ParamsProps) {
   const { id } = await params;
  const body = await req.json();
  try {
    const parsedData = shareableLinkWithServiceSchema.parse(body);
    const { serviceAvailability, ...serviceData } =  parsedData.service;

    if (!serviceAvailability) {
      return NextResponse.json({ message: "No availability provided", success: false }, { status: 400 });
    }

    // Remove availabilities not present in the update
    const keepIds = serviceAvailability
      .map(a => a.id)
      .filter((id): id is string => typeof id === "string");
    await prisma.serviceAvailability.deleteMany({
      where: {
        serviceId: id,
        id: { notIn: keepIds }
      }
    });

    // Upsert or create availabilities
    const upsertAvailabilities = (serviceAvailability ?? [])
      .filter(slot => slot.id)
      .map(slot => ({
        where: { id: slot.id! },
        update: {
          weekDay: slot.weekDay,
          timeSlots: {
            deleteMany: {}, // Optionally delete old slots if needed
            create: slot.timeSlots?.map(ts => ({
              startTime: ts.startTime,
              endTime: ts.endTime,
            })) ?? [],
          }
        },
        create: {
          weekDay: slot.weekDay,
          serviceId: id,
          timeSlots: {
            create: slot.timeSlots?.map(ts => ({
              startTime: ts.startTime,
              endTime: ts.endTime,
            })) ?? [],
          }
        },
      }));

    const createAvailabilities = (serviceAvailability ?? [])
      .filter(slot => !slot.id)
      .map(slot => ({
        weekDay: slot.weekDay,
        serviceId: id,
        timeSlots: {
          create: slot.timeSlots?.map(ts => ({
            startTime: ts.startTime,
            endTime: ts.endTime,
          })) ?? [],
        }
      }));

    // Update the service and its availabilities
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        ...serviceData,
        serviceAvailability: {
          upsert: upsertAvailabilities,
          create: createAvailabilities,
        },
      },
      include: {
        serviceAvailability: { include: { timeSlots: true } },
        shareableLinks: true,
      },
    });

    return NextResponse.json({ data: updatedService, success: true });
  } catch (error) {
    return NextResponse.json({ message: "Failed to update event!", error, success: false }, { status: 500 });
  }
}

// DELETE /api/individual-event/[id]
export async function DELETE(req: NextRequest, { params }: ParamsProps) {
const { id } = await params;
  try {
    // Delete related serviceAvailabilities and timeSlots first if needed (cascade may handle this)
    await prisma.serviceAvailability.deleteMany({
      where: { serviceId: id }
    });

    // Now delete the service
    await prisma.service.delete({ where: { id } });

    return NextResponse.json({ message: "Event deleted successfully", success: true });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete event", error, success: false }, { status: 500 });
  }
}