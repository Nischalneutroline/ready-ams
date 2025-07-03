import { tool } from "@langchain/core/tools";
import { appointmentSchema } from "@/app/(admin)/appointment/_schema/appoinment";
import z from "zod";

const bookAppointmentSchema = appointmentSchema.pick({
  customerName: true,
  email: true,
  phone: true,
  serviceId: true,
  status: true,
  bookedById: true,
  selectedDate: true,
  selectedTime: true,
  userId: true,
  message: true,
  isForSelf: true,
  createdById: true,
});

// Schema for rescheduling (updating) an existing appointment
const rescheduleAppointmentSchema = appointmentSchema
  .pick({
    customerName: true,
    email: true,
    phone: true,
    serviceId: true,
    selectedDate: true,
    selectedTime: true,
    userId: true,
  })
  .extend({
    appointmentId: z.string(), // Required for identifying which appointment to update
  });

const BASE_URL = "http://localhost:3000";

function normalizeDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toISOString(); // e.g., '2025-07-05T00:00:00.000Z'
  }
  throw new Error("Invalid date format: " + dateStr);
}

function cleanNullStrings(obj: any): any {
  const cleaned: any = {};
  for (const key in obj) {
    if (key === "resourceId" && !obj[key]) {
      // Do not include resourceId if it is null/empty/undefined
      continue;
    }
    cleaned[key] = obj[key] === null ? "" : obj[key];
  }
  return cleaned;
}

async function bookAppointment(data: any) {
  const normalizedDate = data.selectedDate
    ? normalizeDate(data.selectedDate)
    : undefined;

  console.log("date is", normalizedDate);

  const filledData = {
    ...data,
    selectedDate: normalizedDate,
    status: data.status || "SCHEDULED",
    bookedById: data.bookedById || data.userId,
    message: data.message || "",
    isForSelf: data.isForSelf ?? true,
    createdById: data.createdById || data.userId,
  };
  console.log("date", filledData.selectedDate);
  console.log("bookAppointment tool called with:", filledData);
  const response = await fetch(`${BASE_URL}/api/appointment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filledData),
  });
  console.log("response of book is", response.ok);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to book appointment");
  }
  return await response.json();
}

// Function to reschedule an appointment (PUT)
async function rescheduleAppointment(data: any) {
  console.log("rescheduleAppointment tool called with:", data);
  const { appointmentId, ...updateFields } = data;
  const response = await fetch(`/api/appointment/${appointmentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateFields),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to reschedule appointment");
  }
  return await response.json();
}

// Add to your existing tool imports
const cancelAppointmentSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
});

export async function cancelAppointment(data: { appointmentId: string }) {
  // Fetch existing appointment data first
  const resGet = await fetch(
    `${BASE_URL}/api/appointment/${data.appointmentId}`
  );
  if (!resGet.ok) {
    throw new Error("Appointment not found");
  }
  const existingAppointment = await resGet.json();

  // Clean nulls before updating
  const cleanedData = cleanNullStrings(existingAppointment.data);

  // Prepare full updated data with status CANCELLED
  const updatedData = {
    ...cleanedData,
    status: "CANCELLED",
    cancelledAt: new Date().toISOString(),
  };

  // Send full data in PUT request
  const resPut = await fetch(
    `${BASE_URL}/api/appointment/${data.appointmentId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    }
  );

  if (!resPut.ok) {
    const error = await resPut.json();
    throw new Error(error.message || "Failed to cancel appointment");
  }

  return await resPut.json();
}

export const tools = [
  tool(bookAppointment, {
    name: "bookAppointment",
    description: "Book an appointment for a user.",
    schema: bookAppointmentSchema,
  }),
  tool(rescheduleAppointment, {
    name: "rescheduleAppointment",
    description: "Reschedule (update) an existing appointment by ID.",
    schema: rescheduleAppointmentSchema,
  }),
  tool(cancelAppointment, {
    name: "cancelAppointment",
    description: "Cancel an appointment by ID.",
    schema: cancelAppointmentSchema,
  }),
];
