import { prisma } from "../lib/prisma";

// get service by id
async function getAppointmentById(id: string) {
  return await prisma.appointment.findUnique({
    where: {
      id,
    },
  });
}

// Fetch appointment ID by appointment name

async function getAppointmentIdByEmailAndService(
  email: string,
  serviceName: string
): Promise<string | null> {
  const appointment = await prisma.appointment.findFirst({
    where: {
      email,
      service: {
        title: serviceName,
      },
    },
    select: { id: true },
  });
  return appointment?.id || null;
}

export { getAppointmentById, getAppointmentIdByEmailAndService };
