// src/app/api/user/create/route.ts
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const client = await clerkClient();
  try {
    const { fullName, email, password, role } = await req.json();
    const fullNameParts = fullName.split(" ");
    const firstName = fullNameParts[0];
    const lastName = fullNameParts[1];

    const user = await client.users.createUser({
      emailAddress: [email],
      firstName,
      lastName,
      password,
      publicMetadata: {
        role,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
