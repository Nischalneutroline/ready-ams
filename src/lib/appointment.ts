// Create appointment
// src/lib/createAppointment.js
// Import Prisma client for database operations
import { Appointment } from "@/app/admin/appointment/_types/appoinment";
import { prisma } from "@/lib/prisma";

// Function to create an appointment and set up its reminders
export async function createAppointment(appointmentData: Appointment) {
  // Remove reminderOffsets from the data passed to create
  const { reminderOffsets, ...appointmentDataWithoutReminders } =
    appointmentData;

  // Create the appointment record
  const appointment = await prisma.appointment.create({
    data: appointmentDataWithoutReminders,
  });

  // Fetch all reminders associated with the appointment’s service
  const reminders = await prisma.reminder.findMany({
    where: { services: { some: { id: appointment.serviceId } } },
    include: { reminderOffset: true }, // Include offset details
  });
  console.log("reminder is", reminders);

  // Create AppointmentReminderOffset for each reminder offset
  for (const reminder of reminders) {
    for (const offset of reminder.reminderOffset) {
      // Calculate when this reminder should fire
      const scheduledAt = new Date(
        appointment.selectedDate.getTime() +
          (offset.sendBefore ? -offset.sendOffset : offset.sendOffset) *
            60 *
            1000
      );
      // Create a record linking this appointment to the offset
      await prisma.appointmentReminderOffset.create({
        data: {
          appointmentId: appointment.id, // Link to this appointment
          reminderOffsetId: offset.id, // Link to the generic offset
          scheduledAt, // Specific time for this reminder
          status: "PENDING", // Initially not sent
        },
      });
    }
  }

  // Return the created appointment
  return appointment;
}

// Function to update and appointment reminder offset
export async function updateAppointment(
  id: string,
  appointmentData: Appointment
) {
  // Remove reminderOffsets from the data passed to update
  const { reminderOffsets, ...appointmentDataWithoutReminders } =
    appointmentData;

  //  Update the appointment
  const updatedAppointment = await prisma.appointment.update({
    where: { id },
    data: appointmentDataWithoutReminders,
  });

  //  Delete old offsets
  await prisma.appointmentReminderOffset.deleteMany({
    where: { appointmentId: id },
  });

  //  Fetch reminders for the (possibly new) service
  const reminders = await prisma.reminder.findMany({
    where: { services: { some: { id: updatedAppointment.serviceId } } },
    include: { reminderOffset: true },
  });

  // Recreate offsets based on the new state
  for (const reminder of reminders) {
    for (const offset of reminder.reminderOffset) {
      const scheduledAt = new Date(
        updatedAppointment.selectedDate.getTime() +
          (offset.sendBefore ? -offset.sendOffset : offset.sendOffset) *
            60 *
            1000
      );
      await prisma.appointmentReminderOffset.create({
        data: {
          appointmentId: updatedAppointment.id,
          reminderOffsetId: offset.id,
          scheduledAt,
          status: "PENDING",
        },
      });
    }
  }

  return updatedAppointment;
}

// function to create schedule at a specific time in reminder/followup/missed/cancellation
export async function syncNewReminderOffset(reminderOffsetId: string) {
  // Fetch the reminder offset along with its reminder and services
  const reminderOffset = await prisma.reminderOffset.findUnique({
    where: { id: reminderOffsetId },
    include: { reminder: { include: { services: true } } },
  });

  if (!reminderOffset || !reminderOffset.reminder) {
    throw new Error("Reminder offset not found or invalid reminder");
  }

  const serviceIds = reminderOffset.reminder.services.map(
    (service) => service.id
  );
  if (!serviceIds.length) return;

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

  // Default where clause (for "scheduled" type)
  let appointmentWhere: any = {
    serviceId: { in: serviceIds },
  };

  // Adjust the query based on reminder type
  const reminderType = reminderOffset.reminder.type; // scheduled, followup, missed, cancellation

  if (reminderType === "REMINDER") {
    appointmentWhere.selectedDate = { gt: now };
    appointmentWhere.status = "SCHEDULED";
  } else if (reminderType === "FOLLOW_UP") {
    appointmentWhere.selectedDate = { lte: now, gte: oneWeekAgo };
    appointmentWhere.status = "COMPLETED";
  } else if (reminderType === "MISSED") {
    appointmentWhere.selectedDate = { lte: now, gte: oneWeekAgo };
    appointmentWhere.status = "MISSED";
  } else if (reminderType === "CANCELLATION") {
    appointmentWhere.cancelledDate = { gte: oneWeekAgo, lte: now };
    appointmentWhere.status = "CANCELLED";
  }

  // Fetch appointments based on the dynamic where condition
  const appointments = await prisma.appointment.findMany({
    where: appointmentWhere,
  });
  console.log("appointment", appointments);
  for (const appointment of appointments) {
    const scheduledAt = new Date(
      appointment.selectedDate.getTime() +
        (reminderOffset.sendBefore
          ? -reminderOffset.sendOffset
          : reminderOffset.sendOffset) *
          60 *
          1000
    );

    // Only create appointmentReminderOffset if scheduledAt is still in future
    if (scheduledAt > now) {
      await prisma.appointmentReminderOffset.create({
        data: {
          appointmentId: appointment.id,
          reminderOffsetId: reminderOffset.id,
          scheduledAt,
          status: "PENDING",
        },
      });
    }
  }
}
