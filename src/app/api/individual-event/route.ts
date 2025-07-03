import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  shareableLinkWithServiceSchema,
} from "@/features/individual-event/schemas/schema";
import { ZodError } from "zod";
import { EventType } from "@/features/individual-event/types/types";
import { VideoProvider } from "@prisma/client";
import {
  checkVideoIntegrationAuth,
  generateMeetingLink,
} from "@/lib/video-provider/videoIntegration";


export async function POST(req: NextRequest) {
  try {
    const userId = "cmben86we0000vd8gk890533p"; // Get from your auth system (Clerk)
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized!", success: false },
        { status: 401 }
      );
    }

    // Find the individual associated with this user
    const individual = await prisma.individual.findUnique({
      where: { userId: userId },
      include: {
        videoIntegrations: true, // Include the video integrations
      },
    });

    if (!individual) {
      return NextResponse.json(
        {
          message:
            "Individual profile not found. Please create a profile first.!",
          success: false,
        },
        { status: 404 }
      );
    }

    const individualId = individual.id;

    const body = await req.json();

    // Validate the body using the Zod schema
    const parsedData = shareableLinkWithServiceSchema.parse(body);

    // Convert location to VideoProvider enum value
    const provider = parsedData.location?.toUpperCase() as VideoProvider;
    console.log("provider", provider);

    // Validate that the provider is a valid VideoProvider enum value
    if (!Object.values(VideoProvider).includes(provider)) {
      return NextResponse.json(
        { message: "Invalid video provider", success: false },
        { status: 400 }
      );
    }

    const { needsAuth } = await checkVideoIntegrationAuth({
      individual,
      provider,
    });

    if (needsAuth) {
      return NextResponse.json(
        {
          success: false,
          message: `Auth expired.Please go to Integrations and reconnect your ${provider} account.`,
        },
        { status: 401 }
      );
    }

    // 1. Create the Service (virtual event)
    const createdService = await prisma.service.create({
      data: {
        title: parsedData.service.title,
        type: parsedData.service.type, // hardcoded for virtual event
        description: parsedData.service.description || "",
        estimatedDuration: parsedData.service.estimatedDuration || 60,
        status: parsedData.service.status || "ACTIVE",
        serviceAvailability: {
          create: (parsedData.service.serviceAvailability ?? []).map(
            (avail) => ({
              weekDay: avail.weekDay,
              timeSlots: {
                create: (avail.timeSlots ?? []).map((slot) => ({
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                })),
              },
            })
          ),
        },
        individualId: individualId,
      },
    });

    let meetingUrl: string | null = null;
    //check for event type
    if (parsedData.type === EventType.ONE_TO_ONE) {
      if (!parsedData.date) {
        return NextResponse.json(
          { message: "Date is required for one-to-one events", success: false },
          { status: 400 }
        );
      }
      const result = await generateMeetingLink({
        individual,
        provider,
        service: parsedData.service,
        date: new Date(parsedData.date),
        bookedByEmail: null
      });
      meetingUrl = result.meetingUrl;

      if (!meetingUrl) {
        return NextResponse.json(
          { message: "Failed to generate meeting link", success: false },
          { status: 400 }
        );
      }
    }


    // 2. Create the ShareableLink, linking to the new service
    const createdLink = await prisma.shareableLink.create({
      data: {
        location: parsedData.location,
        slug: parsedData.slug,
        type: parsedData.type,
        serviceId: createdService.id,
        linkType: parsedData.linkType,
        metaTitle: parsedData.metaTitle,
        metaDescription: parsedData.metaDescription,
        date: parsedData.date ? new Date(parsedData.date) : undefined,
        dateRangeEnd: parsedData.dateRangeEnd
          ? new Date(parsedData.dateRangeEnd)
          : undefined,
        expiresAt: parsedData.expiresAt
          ? new Date(parsedData.expiresAt)
          : undefined,
        videoUrl: meetingUrl,
      },
    });

    return NextResponse.json(
      {
        message: "Event created successfully!",
        data: createdLink,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Validation failed!", error: error.errors, success: false },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Failed to create event!", error: error, success: false },
      { status: 500 }
    );
  }
}

//get request
export async function GET(req: NextRequest) {
  // Replace with your auth system
  const userId = "cmben86we0000vd8gk890533p";
  if (!userId) {
    return NextResponse.json(
      { message: "Unauthorized", success: false },
      { status: 401 }
    );
  }

  try {
    // Find the individual's ID for this user
    const individual = await prisma.individual.findUnique({
      where: { userId },
    });

    if (!individual) {
      return NextResponse.json(
        { message: "Individual profile not found", success: false },
        { status: 404 }
      );
    }

    const events = await prisma.service.findMany({
      where: { individualId: individual.id },
      include: {
        serviceAvailability: {
          include: { timeSlots: true },
        },
        shareableLinks: true,
        meetings: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: events, success: true });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch events", error, success: false },
      { status: 500 }
    );
  }
}
