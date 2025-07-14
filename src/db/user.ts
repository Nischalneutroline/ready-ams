import { prisma } from "../lib/prisma"

// get user by email from prisma
async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: {
      email: email,
    },
  })
}

// get user by id
async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: {
      id: id,
    },
  })
}

//get userid by email
 async function getUserIdByEmail(email: string): Promise<string | undefined> {
  if (!email) return undefined;
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return user?.id;
}

export { getUserByEmail, getUserById, getUserIdByEmail }
