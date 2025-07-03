import { individualSchema } from "@/features/individual/schemas/schema";
import { Individual } from "@/features/individual/types/types";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

interface ParamsProps {
  params: Promise<{ id: string }>;
}


// GET endpoint to fetch a single individual by ID
export async function GET(
  req: NextRequest,
  { params }: ParamsProps
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {message: "Individual ID is required!",success:false },
        { status: 400 }
      );
    }

    // Fetch the individual profile
    const individual = await prisma.individual.findUnique({
      where: { id: id },
      include: {
        // Include related data if needed
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            // Add other user fields you want to include
          },
        },
        experiences: true,
      },
    });

    if (!individual) {
      return NextResponse.json(
        {message: "Individual not found!",success: false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Individual profile retrieved successfully!",
        data: individual,
        success: true
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching individual!",error: error, success: false },
      { status: 500 }
    );
  }
}

//PUT request using params
export async function PUT(
  req: NextRequest,
  { params }: ParamsProps 
) {
  try {
 
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Individual ID is required!", success: false },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsedData = individualSchema.parse(body);

    // Fetch the existing individual to check if it exists
    const existingIndividual = await prisma.individual.findUnique({
      where: { id: id },
    });

    if (!existingIndividual) {
      return NextResponse.json(
        { message: "Profile not found!", success: false },
        { status: 404 }
      );
    }

 
    // Update individual profile
    const updatedIndividual: Individual = await prisma.individual.update({
      where: { id: id },
      data: {
        bio: parsedData.bio,
        position: parsedData.position,
        profileImage: parsedData.profileImage,
        imageFileId: parsedData.imageFileId,
        country: parsedData.country,
        timezone: parsedData.timezone,
         company: parsedData.company,
        website: parsedData.website,
        linkedinUrl: parsedData.linkedinUrl,
        experiences: {
          deleteMany: {},
            create: (parsedData.experiences ?? []).map((experience) => ({
              company: experience.company,
              role: experience.role,
              description: experience.description,
               startDate: experience.startDate,
                 endDate: experience.endDate
            }))
        }
      },
    });

    return NextResponse.json(
      {
        message: "Profile updated successfully!",
        data: updatedIndividual,
        success: true,
      },
      { status: 200 }
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
      { message: "Failed to update profile!", error: error, success: false },
      { status: 500 }
    );
  }
}

//delete individual
export async function DELETE(
 req: NextRequest,
  { params }: ParamsProps
) {
  try {

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Individual Id is required!", success: false },
        { status: 400 }
      );
    }

    // Fetch the existing individual to check if it exists
    const existingIndividual = await prisma.individual.findUnique({
      where: { id: id },
    });

    if (!existingIndividual) {
      return NextResponse.json(
        { message: "Individual not found!", success: false },
        { status: 404 }
      );
    }

    // Delete the individual profile
    const deletedIndividual = await prisma.individual.delete({
      where: { id: id },
    });

    return NextResponse.json(
      { message: "Individual profile deleted successfully!", data: deletedIndividual, success:true },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete individual profile!", success: false, error: error },
      { status: 500 }
    );
  }
}
