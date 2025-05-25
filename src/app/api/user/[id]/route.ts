import { NextRequest, NextResponse } from "next/server"

import { getUserById } from "@/db/user"
import { ZodError } from "zod"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import * as bcrypt from "bcryptjs"
import { z } from "zod"
import { userSchema } from "@/app/(admin)/customer/_schema/customer"
import { createClerkClient, Organization } from "@clerk/nextjs/server"
import SuperAdmin from "../../../superadmin/page"

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
})
interface ParamsProps {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: ParamsProps) {
  try {
    const { id } = await params
    const user = await getUserById(id)

    if (!user) {
      return NextResponse.json(
        { message: "User with id not found!", success: false },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        data: user,
        success: true,
        message: "User fetched successfully!",
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch user!", success: false, error: error },
      { status: 500 }
    )
  }
}

// PUT: Update an existing User
// export async function PUT(req: NextRequest, { params }: ParamsProps) {
//   try {
//     const { id } = await params
//     const body = await req.json()

//     const parsedData = userSchema.parse(body)

//     const { password, email, name, phone, address, role, orgId } = parsedData

//     // Find the user by email (in a real scenario, use a unique identifier like userId)
//     const existingUser = await getUserById(id)

//     if (!existingUser) {
//       return NextResponse.json(
//         { message: "User not found!", success: false },
//         { status: 404 }
//       )
//     }
//     const [firstName, ...rest] = name.trim().split(" ")
//     const lastName = rest.join(" ") || ""
//     const user = await clerkClient.users.getUser(existingUser.id)

//     // Get the current primary email ID
//     const oldEmailId = user.primaryEmailAddressId

//     // (Optional) Get full old email object
//     const oldEmail = user.emailAddresses.find(
//       (email) => email.id === oldEmailId
//     )

//     // Step 1: Update Clerk user
//     try {
//       await clerkClient.users.updateUser(existingUser.id, {
//         firstName: firstName, // you can use fullName if Clerk supports it
//         lastName: lastName,
//         publicMetadata: {
//           role,
//         },
//       })
//     } catch (clerkError) {
//       console.error("Clerk name and role update failed", clerkError)
//       return NextResponse.json(
//         {
//           message: "Failed to update user name and role in Clerk",
//           success: false,
//         },
//         { status: 500 }
//       )
//     }
//     try {
//       // Get the current Clerk user
//       const clerkUser = await clerkClient.users.getUser(existingUser.id)

//       const currentEmail = clerkUser.emailAddresses.find(
//         (emailObj) => emailObj.id === clerkUser.primaryEmailAddressId
//       )

//       // Only proceed if the email has changed
//       if (currentEmail?.emailAddress !== email) {
//         const newEmail = await clerkClient.emailAddresses.createEmailAddress({
//           userId: existingUser.id,
//           emailAddress: email,
//         })

//         // Send Verification code to the new Email

//         // // Set new email as primary
//         // const changePrimaryEmail = await clerkClient.users.updateUser(
//         //   existingUser.id,
//         //   {
//         //     primaryEmailAddressID: newEmail.id,
//         //   }
//         // );

//         // Remove old email address
//         // await clerkClient.emailAddresses.deleteEmailAddress(currentEmail?);
//       }
//     } catch (clerkError) {
//       console.log("Clerk email update failed", clerkError)
//       return NextResponse.json(
//         {
//           message: "Failed to update email in Clerk",
//           success: false,
//         },
//         { status: 500 }
//       )
//     }

//     const updateData: Prisma.UserUpdateInput = {
//       email: parsedData.email,
//       name: parsedData.name,
//       phone: parsedData.phone || "Update Phone Number",
//       address: parsedData.address && {
//         update: {
//           street: parsedData.address.street,
//           city: parsedData.address.city,
//           country: parsedData.address.country,
//           zipCode: parsedData.address.zipCode,
//         },
//       },
//       role: parsedData.role,
//       organizationID: parsedData.orgId,
//     }

//     // Only hash and set password if a new one is provided
//     if (password && password.trim() !== "") {
//       const hashedPassword = await bcrypt.hash(password, 10)
//       updateData.password = hashedPassword
//     }

//     // Update the user in primsa
//     const updatedUser = await prisma.user.update({
//       where: { id },
//       data: updateData,
//     })

//     return NextResponse.json(
//       {
//         data: updatedUser,
//         success: true,
//         message: "User updated successfully!",
//       },
//       { status: 200 }
//     )
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return NextResponse.json(
//         {
//           message: "Validation failed!",
//           error: error.errors[0].message,
//           success: false,
//         },
//         { status: 400 }
//       )
//     }
//     return NextResponse.json(
//       { message: "Failed to update user!", success: false, error: error },
//       { status: 500 }
//     )
//   }
// }

export async function PUT(req: NextRequest, { params }: ParamsProps) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsedData = userSchema.parse(body)

    const { password, email, name, phone, address, role, orgId } = parsedData

    const existingUser = await getUserById(id)

    if (!existingUser) {
      return NextResponse.json(
        { message: "User not found!", success: false },
        { status: 404 }
      )
    }

    const [firstName, ...rest] = name.trim().split(" ")
    const lastName = rest.join(" ") || ""

    const clerkUser = await clerkClient.users.getUser(existingUser.id)

    const currentEmail = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    )

    console.log(role, "role being updated in the customer")

    // Step 1: Update name and metadata (role) on Clerk user
    await clerkClient.users.updateUser(existingUser.id, {
      firstName,
      lastName,
      publicMetadata: { role },
    })

    // Step 2: Update email if it has changed
    if (currentEmail?.emailAddress !== email) {
      // Add new email
      const newEmail = await clerkClient.emailAddresses.createEmailAddress({
        userId: existingUser.id,
        emailAddress: email,
        verified: true,
      })

      // Set new email as primary
      await clerkClient.users.updateUser(existingUser.id, {
        primaryEmailAddressID: newEmail.id,
      })

      // Remove old email (optional, depending on your policy)
      if (currentEmail) {
        await clerkClient.emailAddresses.deleteEmailAddress(currentEmail.id)
      }
    }

    console.log(orgId, "of organization id")

    // Step 3: Update user's role inside the organization (if applicable)
    if (orgId) {
      // Map incoming roles to Clerk org roles
      const roleMapping: Record<string, string> = {
        ADMIN: "org:admin",
        USER: "org:customer",
      }

      const clerkRole = roleMapping[role]

      if (!clerkRole) {
        return NextResponse.json(
          {
            message: `Role '${role}' is invalid or not supported.`,
            success: false,
          },
          { status: 400 }
        )
      }

      const memberships =
        await clerkClient.organizations.getOrganizationMembershipList({
          organizationId: orgId,
        })

      const membership = memberships.data.find(
        (m: any) => m.publicUserData.userId === existingUser.id
      )

      if (membership) {
        await clerkClient.organizations.updateOrganizationMembership({
          organizationId: orgId,
          userId: existingUser.id,
          role: clerkRole, // use mapped role here
        })
      }
    }

    // Step 4: Hash and update password (if provided)
    const updateData: Prisma.UserUpdateInput = {
      email,
      name,
      phone: phone || "Update Phone Number",
      address: address && {
        update: {
          street: address.street,
          city: address.city,
          country: address.country,
          zipCode: address.zipCode,
        },
      },
      role,
      organizationID: orgId,
    }

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10)
      updateData.password = hashedPassword
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(
      {
        data: updatedUser,
        success: true,
        message: "User updated successfully!",
      },
      { status: 200 }
    )
  } catch (error: any) {
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
    return NextResponse.json(
      { message: "Failed to update user!", success: false, error },
      { status: 500 }
    )
  }
}

// DELETE: Delete a User
export async function DELETE(req: NextRequest, { params }: ParamsProps) {
  try {
    const { id } = await params

    const existingUser = await getUserById(id)
    const clerkUser = await clerkClient.users.getUser(id)

    if (!existingUser || !clerkUser) {
      return NextResponse.json(
        { message: "User not found!", success: false },
        { status: 404 }
      )
    }
    try {
      await clerkClient.users.deleteUser(id)
    } catch (error) {
      console.log(error)
      return NextResponse.json({ error: "Error deleting user" })
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: "User deleted successfully!", success: false },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed!",
          error: error.errors[0].message,
          success: false,
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      {
        message: "Failed to delete user!",
        success: false,
        error: error,
      },
      { status: 500 }
    )
  }
}
