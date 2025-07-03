import { prisma } from "@/lib/prisma";
import { google } from "googleapis";

export async function refreshGoogleToken(videoIntegration: any) {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_MEET_CLIENT_ID!;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_MEET_SECRET!;

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: videoIntegration.refreshToken,
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const data = await response.json();
  console.log('data is',data)

  if (data.access_token) {
    // Update DB with new tokens and expiry
    await prisma.videoIntegration.update({
      where: { id: videoIntegration.id },
      data: {
        accessToken: data.access_token,
        // Google may not always return a new refresh token; keep the old one if not present
        refreshToken: data.refresh_token || videoIntegration.refreshToken,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
      },
    });
    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  } else {
    throw new Error('Failed to refresh Google token');
  }
}

export async function createGoogleMeetEvent(
  googleRefreshToken: string,
  meetingDetails: any
) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_MEET_CLIENT_ID,
    process.env.GOOGLE_MEET_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Set credentials with the refresh token only
    oauth2Client.setCredentials({ refresh_token: googleRefreshToken });


  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const startTime = new Date(meetingDetails.timeSlot);
  const durationMinutes = meetingDetails.duration || 60; // fallback to 60 if not provided
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

  const event = {
    summary: meetingDetails.title,
    description: meetingDetails.description,
    start: { dateTime: startTime.toISOString() },
    end: { dateTime: endTime.toISOString() },
    conferenceData: {
      createRequest: {
        requestId: Math.random().toString(36).substring(2),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
      ...(meetingDetails.bookedByEmail && {
    attendees: [{ email: meetingDetails.bookedByEmail }],
  }),
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
    conferenceDataVersion: 1,
  });

  return response.data.hangoutLink ?? null;
}
