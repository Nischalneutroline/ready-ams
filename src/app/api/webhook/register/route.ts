import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { WebhookEvent, clerkClient } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
export async function POST(req: Request) {
  const clerk = await clerkClient();
  console.log("Webhook endpoint hit");

  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET_KEY;
  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  try {
    const headersList = await headers();
    const svix_id = headersList.get("svix-id");
    const svix_timestamp = headersList.get("svix-timestamp");
    const svix_signature = headersList.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("Missing Svix headers", {
        svix_id,
        svix_timestamp,
        svix_signature,
      });
      return NextResponse.json(
        { error: "Missing Svix headers" },
        { status: 400 }
      );
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(WEBHOOK_SECRET);
    let event: WebhookEvent;
    try {
      event = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (error) {
      console.error("Webhook verification failed:", error);
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const { type, data } = event;
    console.log(`Received webhook event: ${type}`);

    if (type === "user.created") {
      console.log("Processing user.created event", { userId: data.id });

      const { id: userId, email_addresses, first_name, last_name } = data;
      if (!userId) {
        console.error("Missing userId in user.created event");
        return NextResponse.json(
          { error: "Invalid user data: missing userId" },
          { status: 400 }
        );
      }

      const email = email_addresses?.[0]?.email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim() || "Unknown";

      // Step 1: Update public metadata in Clerk
      try {
        await clerk.users.updateUser(userId, {
          publicMetadata: {
            role: "USER",
          },
        });
        console.log(`Updated public metadata for user: ${userId}`);
      } catch (metadataError) {
        console.error(
          `Failed to update public metadata for ${userId}:`,
          metadataError
        );
        // Decide if you want to return here or proceed
      }

      // Step 2: Store user in your database

      try {
        // hash password

        const newUser = await prisma.user.create({
          data: {
            email,
            name,
            role: "USER",
            id: userId,
          },
        });

        return NextResponse.json(
          {
            data: newUser,
            success: true,
            message: "User created successfully!",
          },
          { status: 201 }
        );
      } catch (error) {
        console.error(`Failed to create user in Prisma for ${userId}:`, error);
      }

      return NextResponse.json(
        { message: "User created and metadata updated", userId },
        { status: 200 }
      );
    }

    console.log(`Unhandled webhook type: ${type}`);
    return NextResponse.json(
      { message: "Webhook received but not processed", type },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
