// src/app/api/user/update/route.ts
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { Clerk } from "@clerk/clerk-sdk-node";

interface UpdateUserRequest {
  userId: string;
  fullName?: string;
  email?: string;
  newEmail?: string;
  password?: string;
  role?: string;
}

export async function POST(req: Request) {
  const client = await clerkClient();

  try {
    const body = await req.json();
    console.log("Request Body:", body);
    const { userId, fullName, newEmail, role, email, password } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    if (fullName) {
      const fullNameParts = fullName.split(" ");
      const firstName = fullNameParts[0];
      const lastName = fullNameParts[1];

      try {
        await client.users.updateUser(userId, {
          firstName,
          lastName,
        });
      } catch (error) {
        console.log(error);
      }
    }

    // if (email) {
    //   // 1. Create new email for user
    //   const newEmailObj = await client.emailAddresses.createEmailAddress({
    //     userId,
    //     emailAddress: newEmail,
    //   });
    //   // Send verification email
    //   const user = await client.users.getUser(userId);
    //   const emailAddress = user.emailAddresses.find(
    //     (a) => a.id === newEmailObj?.id
    //   );
    //   if (emailAddress) {
    //     emailAddress?.prepareVerification({ strategy: "email_code" });
    //   }
    // }

    if (role) {
      await client.users.updateUser(userId, {
        publicMetadata: {
          role,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message:
        "User updated successfully. Please check your email for verification.",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}
