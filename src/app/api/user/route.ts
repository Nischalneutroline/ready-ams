import { NextRequest, NextResponse } from "next/server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getUserByEmail, getUserById } from "@/db/user"
import * as bcrypt from "bcryptjs"
import { Prisma } from "@prisma/client"
import { User } from "@/app/admin/customer/_types/customer"
import { userSchema } from "@/app/admin/customer/_schema/customer"
import { Organization, auth, clerkClient, getAuth } from "@clerk/nextjs/server"
import Error from "next/error"
import { Address } from "../../admin/customer/_types/customer"
import { Phone } from "lucide-react"

// Enum for all the roles available in the organization
const roleMapping = {
  USER: "org:customer", // or "basic_member"
  ADMIN: "org:admin", // or "admin"
  SUPERADMIN: "org:superadmin", // or whatever you use for super admin
}

// Handles POST request for creating a user or inviting one to an organization
export async function POST(req: NextRequest) {
  const client = await clerkClient()
  const { userId } = getAuth(req)
  try {
    // Parse and validate request body using Zod schema
    const body = (await req.json()) as any
    const { email, password, name, phone, role, orgId } = userSchema.parse(body)
    console.log(body, "json in api call")
    // Ensure organization ID is provided
    if (!orgId) {
      return NextResponse.json(
        { message: "Organization ID is required", success: false },
        { status: 400 }
      )
    }

    // Clerk uses `firstName` and `lastName` instead of `name`
    const [firstName, ...rest] = name.trim().split(" ")
    const lastName = rest.join(" ") || ""

    // Check if user exists in Clerk (https://clerk.com/docs/reference/backend-api/tag/Users)
    const res: any = await client.users.getUserList({
      emailAddress: [email],
    })

    const users = res.data
    const existingClerkUser = users.find((user: any) =>
      user.emailAddresses.some((e: any) => e.emailAddress === email)
    )

    if (existingClerkUser) {
      // If user is found in Clerk, check if user exists in local DB
      const existingUserInDB = await getUserByEmail(email)

      // Map app role to Clerk role (e.g., admin → org:admin)
      const clerkRole = roleMapping[role] || "org:customer"

      if (!existingUserInDB) {
        // Sync user to local DB for consistency
        await prisma.user.create({
          data: {
            id: existingClerkUser.id, // Use Clerk's ID as primary key
            email,
            password: "", // Password not stored for Clerk-authenticated users
            name,
            phone,
            role,
            organizationID: orgId,
          },
        })
      }

      try {
        const newUserRole =
          await client.organizations.createOrganizationMembership({
            organizationId: orgId,
            userId: existingClerkUser.id,
            role: clerkRole,
          })

        // await client.users.updateUser(existingClerkUser.id, {
        //   publicMetadata: {
        //     role: "USER",
        //     phone,
        //   },
        // })

        return NextResponse.json(
          {
            message:
              "User added to organization" +
              (!existingUserInDB ? " and synced to DB" : ""),
            success: true,
          },
          { status: 200 }
        )
      } catch (membershipError: any) {
        // Handle edge case where user is already a member
        console.error("Failed to create membership:", membershipError)

        if (membershipError.errors?.[0]?.code === "already_member") {
          return NextResponse.json(
            {
              message: "User is already a member of this organization",
              success: false,
            },
            { status: 400 }
          )
        }

        // Let unexpected errors bubble up to outer catch
        throw membershipError
      }
    } else {
      const clerkRole = roleMapping[role] || "org:customer"

      // User not found in Clerk → Invite to join organization
      // Docs: https://clerk.com/docs/reference/backend-api/tag/Organizations#operation/CreateOrganizationInvitation

      try {
        await client.organizations.createOrganizationInvitation({
          emailAddress: email,
          organizationId: orgId,
          role: clerkRole,
          // inviterUserId: userId as string,
        })

        return NextResponse.json(
          {
            success: true,
            message: "Invitation sent!",
          },
          { status: 201 }
        )
      } catch (error: any) {
        console.error("Invitation Error:", {
          name: error.name,
          message: error.message,
          status: error.status,
          code: error?.errors?.[0]?.code,
          full: JSON.stringify(error, null, 2),
        })

        return NextResponse.json({
          success: false,
          message: "Cannot send invitation",
          data: {
            name: error.name,
            message: error.message,
            stack: error.stack,
            raw: error, // include this for debug
          },
        })
      }
    }
  } catch (error: any) {
    // Handle schema validation error (from Zod)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed!",
          error: error.errors[0].message,
          success: false,
        },
        { status: 400 }
      )
    }

    // Catch-all for unexpected errors
    return NextResponse.json(
      {
        message: "Failed to process request!",
        success: false,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      },
      { status: 500 }
    )
  }
}

// GET: Retrieve all Users
export async function GET() {
  try {
    // Step 1: Get the current user session
    const { orgId } = await auth()

    // Step 2: Ensure orgId exists
    if (!orgId) {
      return NextResponse.json(
        { message: "Unauthorized. Organization not found.", success: false },
        { status: 401 }
      )
    }

    // get all users
    const users = await prisma.user.findMany({
      where: {
        organizationID: orgId, // Assuming your Prisma model uses this field
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        organizationID: true,
        address: {
          select: {
            street: true,
            city: true,
            country: true,
            zipCode: true,
          },
        },
      },
    })
    console.log(users)

    // Check if there are any users
    if (users.length === 0) {
      return NextResponse.json(
        { message: "No users found!", success: false },
        { status: 404 }
      )
    }

    // Return the users
    return NextResponse.json(
      { data: users, success: true, message: "User fetched successfully!" },
      { status: 200 }
    )
  } catch (error) {
    // Handle errors
    return NextResponse.json(
      { message: "Failed to fetch users!", success: false, error: error },
      { status: 500 }
    )
  }
}
