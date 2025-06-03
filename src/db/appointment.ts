import { prisma } from "../lib/prisma";

// get service by id
async function getAppointmentById(id: string) {
  return await prisma.appointment.findUnique({
    where: {
      id,
    },
  });
}

export { getAppointmentById };
