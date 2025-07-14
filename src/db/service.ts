import { prisma } from "../lib/prisma";

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
  });
}

// Fetch service ID by service name
async function getServiceIdByName(serviceName: string): Promise<string | null> {
  const service = await prisma.service.findFirst({
    where: { title: serviceName },
    select: { id: true },
  });
  console.log('service is',service)
  return service ? service.id : null;
}

export { getServiceById, getServiceIdByName };
