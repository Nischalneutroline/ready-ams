
//GoTo Meeting function
export async function createGotoMeeting(
  gotoAccessToken: string,
  meetingDetails: any
): Promise<string> {
  const startTime = new Date(meetingDetails.timeSlot);
  const durationMinutes = meetingDetails.duration || 60;
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

  const response = await fetch("https://api.getgo.com/G2M/rest/meetings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${gotoAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subject: meetingDetails.title,
      starttime: startTime.toISOString(),
      endtime: endTime.toISOString(),
      passwordrequired: false,
      conferencecallinfo: "Hybrid",
      timezonekey: "UTC",
      meetingtype: "immediate", // or "scheduled" based on your needs
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("GoTo Meeting API Error:", data);
    throw new Error("Failed to create GoTo Meeting");
  }

  // Return the join URL for attendees
  return data.joinURL;
}