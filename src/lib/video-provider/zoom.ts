import { prisma } from "@/lib/prisma";

export async function refreshZoomToken(videoIntegration: any) {
  const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID!;
  const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET!;

  const response = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: videoIntegration.refreshToken,
    }),
  });

  const data = await response.json();

  if (data.access_token) {
    // Update DB with new tokens and expiry
    await prisma.videoIntegration.update({
      where: { id: videoIntegration.id },
      data: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
      },
    });
    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  } else {
    throw new Error("Failed to refresh Zoom token");
  }
}

// Function to create Zoom meeting and return the link
export async function createZoomMeeting(
  userAccessToken: string,
  options: {
    title?: string;
    description?: string;
    startTime?: string;
    duration?: number;
  } = {}
): Promise<string> {
  try {
    const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userAccessToken}`, // Use user-specific access token here
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: options.title || "New Event Meeting",
        type: 2,
        start_time: options.startTime || new Date().toISOString(),
        duration: options.duration || 60,
        agenda: options.description || undefined,
        settings: {
          host_video: true,
          participant_video: true,
          audio: "voip",
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Zoom API Error:", errorData);
      throw new Error("Failed to create Zoom meeting");
    }

    const data = await response.json();
    console.log("data", data);
    return data.join_url; // Zoom meeting link
  } catch (error) {
    console.log("Error creating Zoom meeting:", error);
    throw new Error("Failed to create Zoom meeting");
  }
}
