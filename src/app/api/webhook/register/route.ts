import { Webhook } from "svix"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { WebhookEvent, clerkClient } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

function mapOrgRoleToPrismaRole(orgRoleStr: string): Role {
  switch (orgRoleStr.toLowerCase()) {
    case "admin":
    case "org:admin":
      return Role.ADMIN
    case "org:superadmin":
      return Role.SUPERADMIN
    case "org:customer":
    default:
      return Role.USER
  }
}

const client = await clerkClient()

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET_KEY
  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable")
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    )
  }

  try {
    const headersList = await headers()
    const svix_id = headersList.get("svix-id")
    const svix_timestamp = headersList.get("svix-timestamp")
    const svix_signature = headersList.get("svix-signature")

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("Missing Svix headers", {
        svix_id,
        svix_timestamp,
        svix_signature,
      })
      return NextResponse.json(
        { error: "Missing Svix headers" },
        { status: 400 }
      )
    }

    const payload = await req.json()
    const body = JSON.stringify(payload)

    const wh = new Webhook(WEBHOOK_SECRET)
    let event: WebhookEvent
    try {
      event = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent
    } catch (error) {
      console.error("Webhook verification failed:", error)
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      )
    }

    const { type, data } = event
    console.log(`Received webhook event: ${type}`)

    if (type === "user.created") {
      console.log("Processing user.created event", data, { userId: data.id })

      const { id: userId, email_addresses, first_name, last_name } = data
      if (!userId) {
        console.error("Missing userId in user.created event")
        return NextResponse.json(
          { error: "Invalid user data: missing userId" },
          { status: 400 }
        )
      }

      const email = email_addresses?.[0]?.email_address
      const name = `${first_name || ""} ${last_name || ""}`.trim() || "Unknown"

      // Step 1: Update public metadata in Clerk
      try {
        await client.users.updateUserMetadata(userId, {
          publicMetadata: {
            role: "org:customer",
          },
        })
        console.log(`Updated public metadata for user: ${userId}`)
      } catch (metadataError) {
        console.error(
          `Failed to update public metadata for ${userId}:`,
          metadataError
        )
        // Decide if you want to return here or proceed
      }

      // Step 2: Store user in your database
      try {
        await prisma.user.create({
          data: {
            id: userId,
            email: email || "",
            name,
            phone: null,
            role: "USER",
            password: "",
            organizationID: "",
          },
        })
        console.log(`Created user in Prisma: ${userId}`)
      } catch (error) {
        console.error(`Failed to create user in Prisma for ${userId}:`, error)
      }

      return NextResponse.json(
        { message: "User created and metadata updated", userId },
        { status: 200 }
      )
    }

    if (type === "user.updated") {
      console.log("Processing user.updated event", { userId: data.id })
      console.log("✅ Clerk Webhook Received", data)
      const { id: userId, email_addresses, first_name, last_name } = data

      // ✅ Basic validation: Make sure we got a valid user ID
      if (!userId) {
        console.error("Missing userId in user.updated event")
        return NextResponse.json(
          { error: "Invalid user data: missing userId" },
          { status: 400 }
        )
      }

      // ✅ Extract primary email from email_addresses array
      const email = email_addresses?.[0]?.email_address || ""

      // ✅ Format full name from first and last name
      const name = `${first_name || ""} ${last_name || ""}`.trim() || "Unknown"

      // 🔁 Step 1: Try to fetch user's organization role
      let role: Role = Role.USER // Default fallback

      try {
        // 👇 Clerk API: Get all organization memberships for this user
        const memberships: any =
          await client.users.getOrganizationMembershipList({ userId })
        const orgRole = memberships[0]?.role || "org:customer"

        if (orgRole) {
          // 🔁 Map Clerk org roles to your internal role enums
          switch (orgRole) {
            case "admin":
              role = Role.ADMIN
            case "org:admin":
              role = Role.ADMIN
              break
            case "org:superadmin":
              role = Role.SUPERADMIN
            case "org:customer":
              role = Role.USER
            default:
              role = Role.USER
          }

          console.log(`User ${userId} org role resolved to: ${role}`)
        } else {
          console.log(`User ${userId} has no organization memberships`)
        }
      } catch (orgError) {
        console.error(
          `Failed to fetch organization memberships for ${userId}:`,
          orgError
        )
      }

      // ✏️ Step 2: Update the user's public metadata in Clerk
      try {
        await client.users.updateUserMetadata(userId, {
          publicMetadata: {
            role, // Store internal role in Clerk
          },
        })
        console.log(`✅ Updated Clerk publicMetadata for user: ${userId}`)
      } catch (metadataError) {
        console.error(
          ` Failed to update Clerk metadata for ${userId}:`,
          metadataError
        )
      }

      // 🛠️ Step 3: Update the user’s data in your Prisma database

      try {
        await prisma.user.update({
          where: { id: userId },
          data: {
            email, // Update email if changed
            name, // Update full name
            role, // Update the internal role based on org membership
          },
        })
        console.log(`Updated user in Prisma: ${userId}`)
      } catch (dbError) {
        console.error(`Failed to update user in Prisma for ${userId}:`, dbError)
      }

      // ✅ Final response
      return NextResponse.json(
        {
          message: "User updated and synced with organization role",
          userId,
        },
        { status: 200 }
      )
    }

    if (type === "user.deleted") {
      const userId = data.id
      try {
        await prisma.user.delete({ where: { id: userId } })
        console.log(`Deleted user: ${userId}`)
      } catch (err) {
        console.error("Error deleting user", err)
      }

      return NextResponse.json({ message: "user.deleted handled" })
    }

    if (type === "organizationMembership.created") {
      const { organization, public_user_data, role } = data
      const userId = public_user_data.user_id
      const orgRole: string = role

      const prismaRole = mapOrgRoleToPrismaRole(orgRole)

      try {
        // Sync to DB
        await prisma.user.update({
          where: { id: userId },
          data: {
            role: prismaRole,
            organizationID: organization.id,
          },
        })

        // Update Clerk metadata
        await client.users.updateUser(userId, {
          publicMetadata: {
            role: prismaRole.toLowerCase(),
            organizationID: organization.id,
          },
        })

        console.log(
          `✅ Assigned role '${prismaRole}' to user ${userId} in org ${organization.id}`
        )

        return NextResponse.json({
          message: "organizationMembership.created handled",
          success: true,
        })
      } catch (err) {
        console.error("❌ Error assigning role in org", err)

        return NextResponse.json(
          {
            message: "Failed to handle organizationMembership.created",
            error: err instanceof Error ? err.message : String(err),
            success: false,
          },
          { status: 500 }
        )
      }
    }

    // -------------------------------
    // 📝 Handle organizationMembership.updated
    if (type === "organizationMembership.updated") {
      const { organization, public_user_data, role } = data
      const userId = public_user_data.user_id
      const orgRole: string = role

      // Map incoming org membership role string to Prisma Role enum
      // Import Role enum from Prisma client
      // put this at the top of your file
      NextResponse.json({
        message: `User role updated into ${orgRole}`,
      })
      // Create a function or inline map to convert Clerk org role string to your enum
      function mapOrgRoleToPrismaRole(orgRoleStr: string): Role {
        switch (orgRoleStr.toLowerCase()) {
          case "org:admin":
            return Role.ADMIN
          case "org:superadmin":
            return Role.SUPERADMIN
          case "org:customer":
            return Role.USER
          default:
            return Role.USER
        }
      }

      const prismaRole = mapOrgRoleToPrismaRole(orgRole)

      try {
        // Update user role in DB with mapped enum value
        await prisma.user.update({
          where: { id: userId },
          data: {
            role: prismaRole,
            // optionally update organizationId if needed:
            // organizationId: organization.id,
          },
        })
        console.log(
          `Assigned role '${prismaRole}' to user ${userId} in org ${organization.id}`
        )
      } catch (err) {
        console.error("Error assigning role in org", err)
      }

      return NextResponse.json({
        message: "organizationMembership.created handled",
      })
    }
    // -------------------------------
    // ❌ Handle organizationMembership.deleted
    if (type === "organizationMembership.deleted") {
      const userId = data.public_user_data.user_id
      try {
        await prisma.user.update({
          where: { id: userId },
          data: {
            role: "USER",
            // organizationId: null,
          },
        })
        console.log(`Removed org info from user ${userId}`)
      } catch (err) {
        console.error("Error removing org membership", err)
      }

      return NextResponse.json({ message: "orgMembership.deleted handled" })
    }

    console.log(`Unhandled webhook type: ${type}`)
    return NextResponse.json(
      { message: "Webhook received but not processed", type },
      { status: 200 }
    )
  } catch (error) {
    console.error("Unexpected error processing webhook:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
