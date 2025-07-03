import { VideoProvider } from "@/features/individual-event/types/types";
import { meetingSchema } from "@/features/meeting/schemas/schema";
import { prisma } from "@/lib/prisma";
import {
  checkVideoIntegrationAuth,
  generateMeetingLink,
} from "@/lib/video-provider/videoIntegration";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedData = meetingSchema.parse(body);
    console.log('tets',parsedData)

    // Fetch the shareable link 
    const shareableLink = await prisma.shareableLink.findUnique({
      where: { slug: parsedData.slug }, //
      include: {
        service: {
          include: { individual: { include: { videoIntegrations: true } } },
        },
        serviceTime: true,
      },
    });
    if (
      !shareableLink ||
      !shareableLink.service ||
      !shareableLink.service.individual
    ) {
      return NextResponse.json(
        { error: "Shareable link, service, or individual not found" },
        { status: 404 }
      );
    }

    //  Get provider from shareable link location
    const provider = (
      shareableLink.location || ""
    ).toUpperCase() as VideoProvider;
    if (!Object.values(VideoProvider).includes(provider)) {
      return NextResponse.json(
        { message: "Invalid video provider", success: false },
        { status: 400 }
      );
    }

    //  Check integration auth
    const { needsAuth } = await checkVideoIntegrationAuth({
      individual: shareableLink.service.individual,
      provider,
    });
    if (needsAuth) {
      return NextResponse.json(
        {
          success: false,
          message: `Sorry, there was a problem scheduling your meeting. Please try again later or contact support.`,
        },
        { status: 401 }
      );
    }

    //  Generate video meeting link
    let meetingUrl: string | null = null;
    let videoProvider: string | null = null;
    if (provider) {
      const result = await generateMeetingLink({
        individual: shareableLink.service.individual,
        provider,
        service: shareableLink.service,
        date: parsedData.startTime,
        bookedByEmail: parsedData.bookedByEmail
      });
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      meetingUrl = result.meetingUrl;
      videoProvider = result.videoProvider;
    }

    let appointmentId: string | undefined = parsedData.appointmentId;

if (!appointmentId) {
      const appointment = await prisma.appointment.create({
    data: {
      customerName: parsedData.bookedByName,
      email: parsedData.bookedByEmail,
      phone: /* parsedData.bookerPhone || */ "", // or handle as needed
      serviceId: shareableLink.service.id,
      selectedDate: new Date(parsedData.startTime),
      selectedTime: new Date(parsedData.startTime).toTimeString().slice(0,5), // "HH:mm"
      createdById: "cmben86we0000vd8gk890533p", 
    },
  });
  appointmentId = appointment.id;
}

    // 5. Create the meeting record
    const meeting = await prisma.meeting.create({
      data: {
        serviceId: parsedData.serviceId,
        appointmentId: appointmentId,
        startTime: new Date(parsedData.startTime),
        endTime: new Date(parsedData.endTime),
        bookedByName: parsedData.bookedByName,
        bookedByEmail: parsedData.bookedByEmail,
        bookerTimezone: parsedData.bookerTimezone,
        comment: parsedData.comment,
        videoUrl: meetingUrl,
        videoProvider: videoProvider as any,
        slug: parsedData.slug,
      },
    });

    return NextResponse.json(
      { message: "Meeting booked successfully", meeting },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error", message: error },
      { status: 500 }
    );
  }
}
