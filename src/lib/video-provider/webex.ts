import { prisma } from "@/lib/prisma";

export async function refreshWebexToken(videoIntegration: any) {
  const WEBEX_CLIENT_ID = process.env.WEBEX_CLIENT_ID!;
  const WEBEX_CLIENT_SECRET = process.env.WEBEX_CLIENT_SECRET!;

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: WEBEX_CLIENT_ID,
    client_secret: WEBEX_CLIENT_SECRET,
    refresh_token: videoIntegration.refreshToken,
  });

  const response = await fetch("https://webexapis.com/v1/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const data = await response.json();

  if (data.access_token) {
    // Webex returns new access_token, refresh_token, and expiry times
    await prisma.videoIntegration.update({
      where: { id: videoIntegration.id },
      data: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000), // expires_in is in seconds
      },
    });
    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  } else {
    throw new Error('Failed to refresh Webex token');
  }
}

//for webex
export async function createWebexMeeting(
  webexAccessToken: string,
  meetingDetails: any
): Promise<string> {
  const startTime = new Date(meetingDetails.timeSlot);
  const durationMinutes = meetingDetails.duration || 60;
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

  const response = await fetch("https://webexapis.com/v1/meetings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${webexAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: meetingDetails.title,
      agenda: meetingDetails.description,
      start: startTime.toISOString(),
      end: endTime.toISOString(),
      invitees: [{ email: meetingDetails.bookedByEmail }],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("Webex API Error:", data);
    throw new Error("Failed to create Webex meeting");
  }

  // The join link for attendees
  return data.webLink; // or data.joinMeetingLink
}
