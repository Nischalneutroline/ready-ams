import {
  Individual,
  VideoIntegration,
} from "@/features/individual/types/types";
import { createZoomMeeting, refreshZoomToken } from "@/lib/video-provider/zoom";
import { refreshGoogleToken } from "@/lib/video-provider/google-meet";
import { createWebexMeeting, refreshWebexToken } from "@/lib/video-provider/webex";
 import { createGoogleMeetEvent } from "@/lib/video-provider/google-meet";
import { createTeamsMeeting } from "./microsoftTeam";
import { createGotoMeeting } from "./gotoMeeting";

type MeetingLinkResult = {
  meetingUrl: string | null;
  videoProvider: string | null;
  error?: string;
};

export async function checkVideoIntegrationAuth({
  individual,
  provider,
}: {
  individual: Individual;
  provider: string;
}) {
  // Check if the individual has the required video integration
  const videoIntegration = (individual.videoIntegrations ?? []).find(
    (integration: VideoIntegration) => integration.provider === provider
  );
  console.log('videointegration', videoIntegration)

  let needsAuth = false;

  // If integration does not exist, require authentication!
  if (!videoIntegration) {
    needsAuth = true;
    return { needsAuth };
  }


  if (provider === "ZOOM" && videoIntegration) {
    // Check if token is expired
    if (videoIntegration.expiresAt && videoIntegration.expiresAt < new Date()) {
      if (videoIntegration.refreshToken) {
        try {
          // Attempt to refresh the token
          await refreshZoomToken(videoIntegration);
        
        } catch (err) {
          // If Zoom rejects the refresh (token expired/invalid), handle it here:
          needsAuth = true;
        }
      } else {
        // No refresh token, require re-authentication
        needsAuth = true;
      }
    }
  }

  // ---- GOOGLE MEET ----
  if (provider === "GOOGLE_MEET" && videoIntegration) {
    if (videoIntegration.expiresAt && videoIntegration.expiresAt < new Date()) {
      if (videoIntegration.refreshToken) {
        try {
           await refreshGoogleToken(videoIntegration);
         
        } catch (err) {
          needsAuth = true;
        }
      } else {
        needsAuth = true;
      }
    }
  }

  //--WEBEX--
  if (provider === "WEBEX" && videoIntegration) {
    if (videoIntegration.expiresAt && videoIntegration.expiresAt < new Date()) {
      if (videoIntegration.refreshToken) {
        try {
        await refreshWebexToken(videoIntegration);
        
        } catch (err) {
          needsAuth = true;
        }
      } else {
        needsAuth = true;
      }
    }
  }

  return {
    needsAuth,
  };
}


export async function generateMeetingLink({
  individual,
  provider,
  service,
  date,
  bookedByEmail
}: {
  individual: Individual;
  provider: string;
  service: any;
  date: string | Date;
   bookedByEmail?: string | null;
}): Promise<MeetingLinkResult> {
  const videoIntegration = (individual.videoIntegrations ?? []).find(
    (integration: VideoIntegration) => integration.provider === provider
  );

  if (!videoIntegration || !videoIntegration.accessToken) {
    return {
      meetingUrl: null,
      videoProvider: null,
      error: "Video integration or access token not found for individual",
    };
  }

  let meetingUrl: string | null = null;
  let videoProvider: MeetingLinkResult["videoProvider"] = null;

  if (provider === "ZOOM") {
    meetingUrl = await createZoomMeeting(videoIntegration.accessToken, {
      title: service.title,
      description: service.description,
      startTime: typeof date === 'string' ? date : date.toISOString(),
    });
    videoProvider = "ZOOM";
  } else if (provider === "GOOGLE_MEET") {
    if (!videoIntegration.refreshToken) {
      return {
        meetingUrl: null,
        videoProvider: null,
        error: "Google refresh token is missing",
      };
    }
    meetingUrl = await createGoogleMeetEvent(videoIntegration.refreshToken, {
      title: service.title,
      description: service.description,
      timeSlot: date,
      duration: service.estimatedDuration,
      bookedByEmail
    });
    videoProvider = "GOOGLE_MEET";
  } else if (provider === "MICROSOFT_TEAMS") {
    meetingUrl = await createTeamsMeeting(videoIntegration.accessToken, {
      title: service.title,
      description: service.description,
      timeSlot: date,
      duration: service.estimatedDuration,
      bookedByEmail,
    });
    videoProvider = "MICROSOFT_TEAMS";
  } else if (provider === "WEBEX") {
    meetingUrl = await createWebexMeeting(videoIntegration.accessToken, {
      title: service.title,
      description: service.description,
      timeSlot: date,
      duration: service.estimatedDuration,
      bookedByEmail,
    });
    videoProvider = "WEBEX";
  } else if (provider === "GOTO_MEETING") {
    meetingUrl = await createGotoMeeting(videoIntegration.accessToken, {
      title: service.title,
      description: service.description,
      timeSlot: date,
      duration: service.estimatedDuration,
      bookedByEmail,
    });
    videoProvider = "GOTO_MEETING";
  } else {
    return {
      meetingUrl: null,
      videoProvider: null,
      error: "Invalid or missing video provider",
    };
  }

  return { meetingUrl: meetingUrl ?? null, videoProvider };
}
   