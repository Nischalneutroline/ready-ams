import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { individualSchema } from "@/features/individual/schemas/schema";
import { ZodError } from "zod";
import { Individual } from "@/features/individual/types/types";

export async function POST(req: NextRequest) {
  const userId = "cmben86we0000vd8gk890533p"; //fetch userId from clerk authentication
  if (!userId) {
    return NextResponse.json(
      { message: "User ID not found!", success: false },
      { status: 404 }
    );
  }

  const data = await req.json();
  const parsedData = individualSchema.parse(data);

   // Check if an Individual profile already exists for this user
  const existing = await prisma.individual.findUnique({
    where: { userId }
  });

  if (existing) {
    return NextResponse.json(
      {
        message: "Profile already exists for this user!",
        data: existing,
        success: false,
      },
      { status: 400 } 
    );
  }

  try {
    const individual: Individual = await prisma.individual.create({
      data: {
        bio: parsedData.bio,
        position: parsedData.position,
        profileImage: parsedData.profileImage,
        imageFileId: parsedData.imageFileId,
        country: parsedData.country,
        timezone: parsedData.timezone,
        userId: userId, // Assign Clerk's user ID here
        company: parsedData.company,
        website: parsedData.website,
        linkedinUrl: parsedData.linkedinUrl,
        experiences: {
            create: (parsedData.experiences ?? []).map((experience) => ({
              company: experience.company,
              role: experience.role,
              description: experience.description,
               startDate: experience.startDate ,
                 endDate: experience.endDate,
                 isCertification: experience.isCertification,
            }))
        }
      },
    });

    return NextResponse.json(
      {
        message: "Profile Created Successfully!",
        data: individual,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create profile!", error: error, success: false },
      { status: 500 }
    );
  }
}

//fetch all profile
export async function GET() {
  const individuals = await prisma.individual.findMany({
    include: { user: true, experiences: true },
  });

  return NextResponse.json(
    {
      data: individuals,
      message: "Profile fetched successfully!",
      success: true,
    },
    { status: 200 }
  );
}


