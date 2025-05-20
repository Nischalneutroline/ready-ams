// // POST /api/user/verify-email-code
// import { NextResponse } from "next/server";
// import { clerkClient } from "@clerk/nextjs/server";

// export async function POST(req: Request) {
//   const client = await clerkClient();
//   try {
//     const { userId, emailId, code, oldEmail } = await req.json();

//     // 1. Get the email object
//     const email = await client.emailAddresses.getEmailAddress(emailId);

//     // 2. Attempt verification
//     await email.attemptVerification({ code });

//     // 3. Promote as primary
//     await client.users.updateUser(userId, {
//       primaryEmailAddressID: email.id,
//     });

//     // 4. Delete old email (if needed)
//     const user = await client.users.getUser(userId);
//     const toDelete = user.emailAddresses.find(
//       (e) => e.emailAddress === oldEmail && e.id !== email.id
//     );

//     if (toDelete) {
//       await client.emailAddresses.deleteEmailAddress(toDelete.id);
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Email verified and updated",
//     });
//   } catch (error: any) {
//     return NextResponse.json(
//       { success: false, error: error?.message || "Verification failed" },
//       { status: 500 }
//     );
//   }
// }
