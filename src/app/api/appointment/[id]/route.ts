import { NextRequest, NextResponse } from "next/server";
import { getAnnouncementOrOfferById } from "@/db/announcement-offer";
import { getAppointmentById } from "@/db/appointment";
import { prisma } from "@/lib/prisma";
import { ZodError } from "zod";
import { updateAppointment } from "@/lib/appointment";
import { Appointment } from "@/app/(admin)/appointment/_types/appoinment";
import { appointmentSchema } from "@/app/(admin)/appointment/_schema/appoinment";

interface ParamsProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: ParamsProps) {
  try {
    const { id } = await params;
    const appointment = await getAppointmentById(id);

    if (!appointment) {
      return NextResponse.json(
        { message: "Appointment with id not found!", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: appointment,
        success: true,
        message: "Appointment fetched successfully!",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch appointment!", success: false, error: error },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: ParamsProps) {
  try {
    const { id } = await params;
    console.log("id is", id);

    if (!id) {
      return NextResponse.json(
        { message: "Appointment Id required!", success: false },
        { status: 400 }
      );
    }

    // Find the service by ID
    const existingAppointment = await getAppointmentById(id);

    if (!existingAppointment) {
      return NextResponse.json(
        { message: "Appointment not found!", success: false },
        { status: 404 }
      );
    }

    const body = await req.json();
    console.log("body is", body);
    const parsedData: Appointment = appointmentSchema.parse(body);
    console.log("parsed data", parsedData.status);

    // update appointment in prisma database
    const updatedAppointment = await updateAppointment(id, {
      customerName: parsedData.customerName,
      email: parsedData.email,
      phone: parsedData.phone,
      status: parsedData.status,
      userId: parsedData.userId,
      bookedById: parsedData.bookedById,
      serviceId: parsedData.serviceId,
      selectedDate: parsedData.selectedDate,
      selectedTime: parsedData.selectedTime,
      message: parsedData.message,
      isForSelf: parsedData.isForSelf,
      createdById: parsedData.createdById,
      resourceId: parsedData.resourceId,
    });

    return NextResponse.json(
      {
        data: updatedAppointment,
        success: true,
        message: "Appointment updated successfully!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("error is", error);
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
      {
        message: "Failed to update appointment!",
        success: false,
        error: error,
      },
      { status: 500 }
    );
  }
}

//delete appointment
export async function DELETE(req: NextRequest, { params }: ParamsProps) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Appointment Id required!", success: false },
        { status: 400 }
      );
    }

    const existingAppointment = await getAppointmentById(id);

    if (!existingAppointment) {
      return NextResponse.json(
        { message: "Appointment not found!", success: false },
        { status: 404 }
      );
    }

    const deletedAppointment = await prisma.appointment.delete({
      where: { id },
    });

    if (!deletedAppointment) {
      return NextResponse.json(
        { message: "Failed to delete appointment!", success: false },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data: deletedAppointment,
        success: true,
        message: "Appointment deleted successfully!",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to delete appointment!",
        success: false,
        error: error,
      },
      { status: 500 }
    );
  }
}
