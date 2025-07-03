import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ParamsProps {
  params: Promise<{ slug: string }>;
}

// GET /api/bookevent/[slug]
export async function GET(req: NextRequest, { params }: ParamsProps) {
  const { slug } = await params;

  try {
    // Find the shareable link by slug, including all relevant relations
    const link = await prisma.shareableLink.findUnique({
      where: { slug },
      include: {
        service: {
          include: {
            serviceAvailability: {
              include: { timeSlots: true }
            },
            individual: true,
            meetings: true, // If you want to show existing meetings
          }
        },
        appointment: true,
        resource: true,
        serviceTime: true,
      },
    });

    if (!link) {
      return NextResponse.json(
        { message: "Event not found", success: false },
        { status: 404 }
      );
    }

    // Optionally: If you want to filter out expired links, add a check here

    return NextResponse.json({ data: link, success: true });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch event", error, success: false },
      { status: 500 }
    );
  }
}