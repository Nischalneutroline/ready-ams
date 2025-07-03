// New function to create Microsoft Teams meeting
export async function createTeamsMeeting(
  microsoftAccessToken: string,
  meetingDetails: any
): Promise<string> {
  try {
    const startTime = new Date(meetingDetails.timeSlot);
    const durationMinutes = meetingDetails.duration || 60;
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    const response = await fetch("https://graph.microsoft.com/v1.0/me/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${microsoftAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: meetingDetails.title,
        body: {
          contentType: "HTML",
          content: meetingDetails.description || "Teams meeting",
        },
        start: {
          dateTime: startTime.toISOString(),
          timeZone: "UTC",
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: "UTC",
        },
        attendees: [
          {
            emailAddress: {
              address: meetingDetails.bookedByEmail,
            },
            type: "required",
          },
        ],
        isOnlineMeeting: true,
        onlineMeetingProvider: "teamsForBusiness",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Microsoft Graph API Error:", errorData);
      /*     throw new Error("Failed to create Teams meeting"); */
    }

    const data = await response.json();
    console.log("data is", data);
    return data.onlineMeeting.joinUrl; // Teams meeting join URL
  } catch (error) {
    console.log("Error creating Teams meeting:", error);
    throw new Error("Failed to create Teams meeting");
  }
}
