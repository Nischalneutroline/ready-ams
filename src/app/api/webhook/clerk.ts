import { Webhook } from "svix";
import { buffer } from "micro";
import { clerkClient } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { WebhookRequiredHeaders } from "svix";


export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = await clerkClient();
  const payload = (await buffer(req)).toString();

  const headers = req.headers as unknown as WebhookRequiredHeaders;
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let event;
  try {
    event = wh.verify(payload, headers);
  } catch (err) {
    console.error("❌ Invalid webhook signature", err);
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  const { type, data } = event as { type: string; data: any };

  // 1️⃣ When email is created, send verification
  if (type === "email_address.created") {
    try {
      await client.emailAddresses.prepareVerification({
        emailAddressId: data.id,
        strategy: "email_code",
      });
      //   await client.processEmailVerification .prepareVerification({
      //     emailAddressId: data.id,
      //     strategy: "email_code",
      //   });
      console.log(`✅ Sent verification to ${data.email_address}`);
    } catch (err) {
      console.error("❌ Failed to send email verification", err);
      // Continue processing even if verification fails
    }
  }

  // 2️⃣ When email is verified, set as primary
  if (type === "email_address.verified") {
    try {
      const userId = data.user_id;
      const emailId = data.id;

      await client.users.updateUser(userId, {
        primaryEmailAddressID: emailId,
      });

      console.log(`✅ ${data.email_address} is now primary for user ${userId}`);
    } catch (err) {
      console.error("❌ Failed to update primary email", err);
      return res.status(500).json({ error: "Failed to update primary email" });
    }
  }

  return res.status(200).json({ success: true });
}
