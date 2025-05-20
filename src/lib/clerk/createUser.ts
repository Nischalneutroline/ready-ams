import { clerkClient } from "@clerk/nextjs/server"

export async function createOrUpdateClerkUser({
  name,
  email,
  password,
  clerkId,
}: {
  name: string
  email: string
  password?: string
  clerkId?: string
}) {
  const client = await clerkClient()
  const names = name.trim().split(" ")
  const firstName = names[0]
  const lastName = names.slice(1).join(" ")

  if (clerkId) {
    // Update Clerk user basic info
    const updatedUser = await client.users.updateUser(clerkId, {
      firstName,
      lastName,
      ...(password ? { password } : {}),
    })

    // Optionally add and set new email address
    const emailAddress = await client.emailAddresses.createEmailAddress({
      userId: clerkId,
      emailAddress: email,
    })

    // Set it as primary (if needed)
    await client.users.updateUser(clerkId, {
      primaryEmailAddressID: emailAddress.id,
    })

    // You may also delete the old email address if needed

    return updatedUser
  } else {
    // Create Clerk user
    return await client.users.createUser({
      emailAddress: [email],
      firstName,
      lastName,
      ...(password ? { password } : {}),
    })
  }
}
