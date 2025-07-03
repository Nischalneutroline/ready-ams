import { NextRequest, NextResponse } from "next/server";

import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { getAppointmentById } from "@/db/appointment";
import { createAppointment } from "@/lib/appointment";
import { Appointment } from "@/app/(admin)/appointment/_types/appoinment";
import { appointmentSchema } from "@/app/(admin)/appointment/_schema/appoinment";

//create new appointment
export async function POST(req: NextRequest) {
  try {
    console.log("hi");
    // Parse the request body
    const body = await req.json();

    // Validate the request body
    const parsedData: Appointment = appointmentSchema.parse(body);
    console.log(parsedData, "parsedData");

    // Create a new appointment in prisma
    const newAppointment = await createAppointment({
      customerName: parsedData.customerName,
      email: parsedData.email,
      phone: parsedData.phone,
      status: parsedData.status,
      userId: "cmch8ahh90000uj8k19koy2y9",
      bookedById: parsedData.bookedById,
      serviceId: parsedData.serviceId,
      selectedDate: parsedData.selectedDate,
      selectedTime: parsedData.selectedTime,
      message: parsedData.message,
      isForSelf: parsedData.isForSelf,
      createdById: parsedData.createdById,
      resourceId: parsedData.resourceId,
    });

    // Return a success response
    return NextResponse.json(
      {
        data: newAppointment,
        success: true,
        message: "Appointment booked successfully!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("error is", error);
    // Handle validation errors
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
    // Handle other errors
    return NextResponse.json(
      { message: "Failed to book appointment!", success: false, error: error },
      { status: 500 }
    );
  }
}

//read all appointment
export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        user: true,
        service: true,
        resource: true,
        meeting: true,
      },
    });
    if (appointments.length === 0) {
      return NextResponse.json(
        { message: "No appointments found!", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: appointments,
        success: true,
        message: "Appointment fetched successfully!",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch appointments!",
        success: false,
        error: error,
      },
      { status: 500 }
    );
  }
}
