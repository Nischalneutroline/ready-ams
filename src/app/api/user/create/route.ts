// src/app/api/user/create/route.ts
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createClerkClient } from "@clerk/nextjs/server";
import { createCustomer } from "@/app/(admin)/customer/_api-call/customer-api-call";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});
// define roles somewhere

export async function POST(req: Request) {
  try {
    const { fullName, email, password, role, isActive, phone } =
      await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [firstName, ...rest] = fullName.trim().split(" ");
    const lastName = rest.join(" ") || "";

    // ✅ Step 1: Create user in Clerk
    const clerkUser = await clerkClient.users.createUser({
      emailAddress: [email],
      password,
      firstName,
      lastName,
      publicMetadata: {
        role,
      },
    });

    // ✅ Step 2: Create user in your database
    if (clerkUser) {
      const result = await createCustomer({
        name: fullName,
        email,
        role,
        isActive,
        phone: phone,
        password,
      });

      if (result.success) {
        return NextResponse.json({ success: true, user: result });
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to create user in clerk" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
