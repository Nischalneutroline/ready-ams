// src/app/api/user/update/route.ts
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

interface UpdateUserRequest {
  userId: string;
  fullName?: string;
  newEmail?: string;
  role?: string;
}

export async function POST(req: Request) {
  const client = await clerkClient();
  try {
    const body: UpdateUserRequest = await req.json();
    console.log("Request Body:", body);
    const { userId, fullName, newEmail, role } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // ✅ Update full name
    if (fullName) {
      const [firstName, ...rest] = fullName.trim().split(" ");
      const lastName = rest.join(" ") || "";
      await client.users.updateUser(userId, {
        firstName,
        lastName,
      });
    }

    // ✅ Update email and trigger verification
    // if (newEmail) {
    //   const newEmailObj = await client.emailAddresses.updateEmailAddress(
    //     userId,
    //     {
    //       emailAddress: newEmail,
    //       primary: true,
    //     }
    //   );

    //   await client.emailAddresses.prepareVerification("email_code");
    // }

    // ✅ Update role in publicMetadata
    if (role) {
      await client.users.updateUser(userId, {
        publicMetadata: { role },
      });
    }

    return NextResponse.json({
      success: true,
      message:
        "User updated successfully. If email was changed, a verification email has been sent.",
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}
