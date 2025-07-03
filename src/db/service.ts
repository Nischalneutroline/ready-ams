import { prisma } from "../lib/prisma"

// get service by id
async function getServiceById(id: string) {
  return await prisma.service.findUnique({
    where: {
      id,
    },
    include: {
      appointments: true,
      serviceAvailability: {
        include: {
          timeSlots: true,
        },
      },
      businessDetail: {
        include: {
          businessAvailability: {
            include: {
              timeSlots: true,
            },
          },
          holiday: true,
        },
      },
    },
  })
}

export { getServiceById }
