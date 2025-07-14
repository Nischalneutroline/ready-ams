import { inngestClient } from "@/tasks/inngest/client";
import { prisma } from "@/lib/prisma";

export const sendAnnouncement = inngestClient.createFunction(
  { id: "send-announcement-or-offer" },
  { event: "announcement/send" },
  async ({ event, step }) => {
    console.log("📨 Running Inngest function for:", event.data.id);
    const { id, lastUpdate } = event.data;

    // Fetch the latest record from DB inside a step
    const announcement = await step.run("fetch-announcement", async () => {
      return await prisma.announcementOrOffer.findUnique({
        where: { id },
      });
    });

    // If the announcement is missing, don't continue
    if (!announcement) {
      return { success: false, message: "Announcement not found" };
    }

    // Check if announcement is already sent
    if (announcement.isSent) {
      console.log("Announcement already sent, skipping.");
      return { success: false, message: "Announcement already sent" };
    }

    // Skip if version is outdated (announcement was updated after the event was scheduled)
    if (new Date(announcement.updatedAt).getTime() !== lastUpdate) {
      console.log("not matched");
      return {
        success: false,
        message: "Stale event – announcement was updated",
      };
    }

    let targetUsers: { id: string; name: string; email: string }[] = [];
    if (announcement.audience === "ALL") {
      targetUsers = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    } else if (announcement.audience === "APPOINTED_USERS") {
      targetUsers = await prisma.user.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    } else if (announcement.audience === "CANCELLED_USERS") {
      targetUsers = await prisma.user.findMany({
        where: { isActive: false },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    }

    // TODO: Send email, push notification, or SMS here
    await step.run("send-email", async () => {
      console.log(`Sending announcement: ${announcement.title}`);

      for (const user of targetUsers) {
        switch (announcement.showOn) {
          case "EMAIL":
            console.log(
              `📧 Sending Email to ${user.email} with message: ${announcement.message}`
            );
            // await sendEmail(user.email, announcement.title, announcement.message ?? "");
            break;

          case "PUSH":
            console.log(`📲 Sending Push Notification to ${user.id}`);
            // await sendPushNotification(user.id, announcement.title, announcement.message ?? "");
            break;

          case "SMS":
            console.log(
              `📱 Sending SMS to ${user.email} (replace with phone later)`
            );
            // await sendSMS(user.phone, announcement.message ?? "");
            break;

          case "BANNER":
            console.log(`🏳️ Showing Banner for user ${user.id}`);
            // await createBannerNotification(user.id, announcement.title, announcement.description ?? "");
            break;

          case "ALL":
            console.log(`📧 + 📲 + 📱 + 🏳️ Sending ALL types to ${user.email}`);
            // await sendEmail(user.email, announcement.title, announcement.message ?? "");
            // await sendPushNotification(user.id, announcement.title, announcement.message ?? "");
            // await sendSMS(user.phone, announcement.message ?? "");
            // await createBannerNotification(user.id, announcement.title, announcement.description ?? "");
            break;
        }
      }
    });

    //update the sent status
    await prisma.announcementOrOffer.update({
      where: { id: announcement.id },
      data: { isSent: true },
    });

    return { success: true };
  }
);
