import { NextRequest, NextResponse } from "next/server";
import { businessDetailSchema } from "@/features/business-detail/schemas/schema";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { getBusinessDetailById } from "@/db/businessDetail";
import { Prisma } from "@prisma/client";

// Create a new business detail
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedData = businessDetailSchema.parse(body);

    // create business in prisma

    const existingBusiness = await prisma.businessDetail.findUnique({
      where: { email: parsedData.email },
    });

    if (existingBusiness) {
      return NextResponse.json(
        { message: "Business with this email already exists!", success: false },
        { status: 400 }
      );
    }


    const newBusiness = await prisma.businessDetail.create({
      data: {
        name: parsedData.name,
        industry: parsedData.industry,
        email: parsedData.email,
        phone: parsedData.phone,
        website: parsedData.website,
        businessRegistrationNumber: parsedData.businessRegistrationNumber,
        taxId: parsedData.taxId,
        taxIdFileId: parsedData.taxIdFileId,
        logo: parsedData.logo,
        logoFileId: parsedData.logoFileId,
        businessOwner: parsedData.businessOwner,
        timeZone: parsedData.timeZone,
        status: parsedData.status,

        businessAvailability: {
          create: parsedData.businessAvailability.map((availability) => ({
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
        holiday: {
          create: parsedData.holiday.map((holiday) => ({
            holiday: holiday.holiday,
            type: holiday.type,
            date: holiday.date || null,
          })),
        },
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
    });

    if (!newBusiness) {
      return NextResponse.json(
        { message: "Failed to create business!", success: false },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data: newBusiness,
        success: true,
        message: "Business created successfully!",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientValidationError) {
      console.error("Validation error:", error.message);
      // Handle the validation error specifically
      return {
        error: "Validation failed",
        details: error, // or use error.stack for full stack trace
      };
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed!",
          error: error,
          success: false,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Failed to create business!", success: false, error: error },
      { status: 500 }
    );
  }
}

// Fetch all business details
export async function GET() {
  try {
    const businessDetails = await prisma.businessDetail.findMany({
      include: {
        address: true,
        businessAvailability: {
          include: {
            timeSlots: true,
          },
        },
        holiday: true,
      },
    });

    if (businessDetails.length === 0) {
      return NextResponse.json(
        { message: "No business details found!", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: businessDetails,
        success: true,
        message: "Business fetched successfully!",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch business details!",
        success: false,
        error: error,
      },
      { status: 500 }
    );
  }
}
