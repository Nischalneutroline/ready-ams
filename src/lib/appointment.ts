// Create appointment
// src/lib/createAppointment.js
// Import Prisma client for database operations
import { prisma } from "@/lib/prisma";
import { Appointment } from "@/app/(admin)/appointment/_types/appoinment";
import { DateTime } from "luxon";

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

  // Combine selectedDate and selectedTime in Kathmandu timezone for now ,later we will replace with dynamic timezone from user
  // Parse using Luxon fromFormat
  const localDate = DateTime.fromJSDate(appointment.selectedDate, { zone: "Asia/Kathmandu" }).toFormat("yyyy-MM-dd");
  console.log("date is", localDate);

   // Combine date and time in a format Luxon can parse
  const dateTimeString = `${localDate} ${appointment.selectedTime}`;

   const date = DateTime.fromFormat(dateTimeString, "yyyy-MM-dd h:mm a", { zone: "Asia/Kathmandu" });

  // Create AppointmentReminderOffset for each reminder offset
  for (const reminder of reminders) {
    for (const offset of reminder.reminderOffset) {
      // Skip if sendOffset is null
      if (offset.sendOffset === null) continue;

      // Calculate when this reminder should fire
      const scheduledTime = offset.sendBefore
        ? date.minus({ minutes: offset.sendOffset })
        : date.plus({ minutes: offset.sendOffset });

      // Convert to UTC
      const scheduledAtUTC = scheduledTime.toUTC().toJSDate();

      // Create a record linking this appointment to the offset
      await prisma.appointmentReminderOffset.create({
        data: {
          appointmentId: appointment.id, // Link to this appointment
          reminderOffsetId: offset.id, // Link to the generic offset
          scheduledAt: scheduledAtUTC, // Specific time for this reminder
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

   // Combine selectedDate and selectedTime in Kathmandu timezone for now ,later we will replace with dynamic timezone from user
  // Parse using Luxon fromFormat
  const localDate = DateTime.fromJSDate(updatedAppointment.selectedDate, { zone: "Asia/Kathmandu" }).toFormat("yyyy-MM-dd");
  console.log("date is", localDate);

   // Combine date and time in a format Luxon can parse
  const dateTimeString = `${localDate} ${updatedAppointment.selectedTime}`;

   const date = DateTime.fromFormat(dateTimeString, "yyyy-MM-dd h:mm a", { zone: "Asia/Kathmandu" });


  // Recreate offsets based on the new state
  for (const reminder of reminders) {
    for (const offset of reminder.reminderOffset) {
      // Skip if sendOffset is null
      if (offset.sendOffset === null) continue;

      // Calculate when this reminder should fire
      const scheduledTime = offset.sendBefore
        ? date.minus({ minutes: offset.sendOffset })
        : date.plus({ minutes: offset.sendOffset });

      // Convert to UTC
      const scheduledAtUTC = scheduledTime.toUTC().toJSDate();

      await prisma.appointmentReminderOffset.create({
        data: {
          appointmentId: updatedAppointment.id,
          reminderOffsetId: offset.id,
          scheduledAt: scheduledAtUTC,
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
const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Default where clause (for "scheduled" type)
  let appointmentWhere: any = {
    serviceId: { in: serviceIds },
  };

  // Adjust the query based on reminder type
  const reminderType = reminderOffset.reminder.type; // scheduled, followup, missed, cancellation

if (reminderType === "REMINDER") {
  appointmentWhere.selectedDate = { gte: oneWeekAgo, lte: oneWeekLater };
  appointmentWhere.status = "SCHEDULED";
} else if (reminderType === "FOLLOW_UP") {
  appointmentWhere.selectedDate = { gte: oneWeekAgo, lte: oneWeekLater };
  appointmentWhere.status = "COMPLETED";
} else if (reminderType === "MISSED") {
  appointmentWhere.selectedDate = { gte: oneWeekAgo, lte: oneWeekLater };
  appointmentWhere.status = "MISSED";
} else if (reminderType === "CANCELLATION") {
  appointmentWhere.cancelledDate = { gte: oneWeekAgo, lte: oneWeekLater };
  appointmentWhere.status = "CANCELLED";
}

  // Fetch appointments based on the dynamic where condition
  const appointments = await prisma.appointment.findMany({
    where: appointmentWhere,
  });
  console.log("appointment", appointments);

  for (const appointment of appointments) {

  // Combine selectedDate and selectedTime in Kathmandu timezone for now ,later we will replace with dynamic timezone from user
  // Parse using Luxon fromFormat
  const localDate = DateTime.fromJSDate(appointment.selectedDate, { zone: "Asia/Kathmandu" }).toFormat("yyyy-MM-dd");
  console.log("date is", localDate);

   // Combine date and time in a format Luxon can parse
  const dateTimeString = `${localDate} ${appointment.selectedTime}`;

   const date = DateTime.fromFormat(dateTimeString, "yyyy-MM-dd h:mm a", { zone: "Asia/Kathmandu" });

    // Skip if sendOffset is null
    if (reminderOffset.sendOffset === null) continue;

    // Calculate when this reminder should fire
    const scheduledTime = reminderOffset.sendBefore
      ? date.minus({ minutes: reminderOffset.sendOffset })
      : date.plus({ minutes: reminderOffset.sendOffset });

    // Convert to UTC
    const scheduledAtUTC = scheduledTime.toUTC().toJSDate();


    // Only create appointmentReminderOffset if scheduledAt is still in future
    if (scheduledAtUTC > now) {
     
      await prisma.appointmentReminderOffset.create({
        data: {
          appointmentId: appointment.id,
          reminderOffsetId: reminderOffset.id,
          scheduledAt: scheduledAtUTC,
          status: "PENDING",
        },
      });
    }
  }
}
