import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // You can reuse your existing logic to generate the correct OAuth URL for each provider

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

  const { provider } = await req.json();

  // Check if the individual has the required video integration
  const videoIntegration = individual.videoIntegrations.find(
    (integration) => integration.provider === provider
  );

   // If already connected, return status
  if (videoIntegration) {
    return NextResponse.json({
      connected: true,
      message: `Already connected to ${provider}.`,
      success: true,
    });
  }

  let authUrl = "";
  switch (provider) {
    case "GOOGLE_MEET":
      authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth` +
        `?client_id=${process.env.GOOGLE_MEET_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(`${process.env.ORIGIN}/api/google/callback`)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(
          "https://www.googleapis.com/auth/calendar"
        )}` +
        `&access_type=offline` + // Get refresh token
        `&prompt=consent` + // Force consent to get refresh token
        `&state=${individualId}`;
      break;
    case "ZOOM":
      authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${process.env.ZOOM_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${process.env.ORIGIN}/api/zoom/callback`)}&state=${individualId}`;
      break;
    case "WEBEX":
      authUrl = `https://webexapis.com/v1/authorize?client_id=${process.env.WEBEX_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(`${process.env.ORIGIN}/api/webx/callback`)}&scope=${encodeURIComponent("spark:kms meeting:schedules_read meeting:participants_read meeting:participants_write meeting:schedules_write")}&state=${individualId}`;
      break;
    case "MICROSOFT_TEAMS":
      const clientId = process.env.MS_CLIENT_ID;
      const redirectUri = encodeURIComponent(
        "http://localhost:3000/api/microsoft/callback"
      );
      const scope = encodeURIComponent(
        "https://graph.microsoft.com/Calendars.ReadWrite https://graph.microsoft.com/OnlineMeetings.ReadWrite"
      );
      authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=${scope}&state=${individualId}`;
      break;
    case "GOTO_MEETING":
      authUrl = `https://authentication.logmeininc.com/oauth/authorize?client_id=${process.env.GOTO_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent("http://localhost:3000/api/go-to-meeting/callback")}&state=${individualId}`;
      break;
  }

  return NextResponse.json({ authUrl });
}

export async function GET(req: NextRequest) {
  const userId = "cmben86we0000vd8gk890533p";
  const individual = await prisma.individual.findUnique({
    where: { userId },
    include: { videoIntegrations: true },
  });

  const providers = individual?.videoIntegrations.map(v => v.provider) || [];
  return NextResponse.json({ providers });
}