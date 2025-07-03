import { StateGraph, START, END } from "@langchain/langgraph";
import { z } from "zod";
import { appointmentSchema } from "@/app/(admin)/appointment/_schema/appoinment";
import { tools } from "./agentTool";
import { prisma } from "@/lib/prisma";
import { WeekDays } from "@prisma/client";

//dont show  past appointment
//can track appointemnt history of user
//user name,phone number and other details.

// 1. Define the LangGraph state schema using your appointment schema
const AppointmentGraphStateSchema = appointmentSchema
  .pick({
    userId: true,
    serviceId: true,
    selectedDate: true,
    selectedTime: true,
    customerName: true,
    email: true,
    phone: true,
    status: true,
    bookedById: true,
    message: true,
    isForSelf: true,
    createdById: true,
  })
  .extend({
    missingFields: z.array(z.string()).optional(),
    confirmed: z.boolean().optional(),
    error: z.string().optional(),
  });

export type AppointmentGraphState = z.infer<typeof AppointmentGraphStateSchema>;

function normalizeDate(dateStr: string): string {
  // Accepts most user-entered date formats and outputs YYYY-MM-DD
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toISOString().slice(0, 10);
  }
  throw new Error("Invalid date format: " + dateStr);
}

// 2. Node: Collect Service
async function collectService(
  state: AppointmentGraphState
): Promise<Partial<AppointmentGraphState>> {
  console.log("collectService node called:", state);
  if (!state.serviceId) {
    // In a real chatbot, you'd return a prompt to the user here.
    return { missingFields: ["serviceId"] };
  }
  return {};
}

// 3. Node: Collect Date and Time
async function collectDateTime(
  state: AppointmentGraphState
): Promise<Partial<AppointmentGraphState>> {
  const missing: string[] = [];
  console.log("collectDateTime node called:", state);
  if (!state.selectedDate) missing.push("selectedDate");
  if (!state.selectedTime) missing.push("selectedTime");
  if (missing.length > 0) {
    return { missingFields: missing };
  }
  return {};
}

// 4. Node: Confirm Details
async function confirmDetails(
  state: AppointmentGraphState
): Promise<Partial<AppointmentGraphState>> {
  // In a real chatbot, you'd confirm details with the user.
  if (state.confirmed) {
    return {};
  }
  return { confirmed: false }; // Or prompt for confirmation
}

// 5. Node: Book Appointment (calls your tool)
async function bookAppointmentNode(
  state: AppointmentGraphState
): Promise<Partial<AppointmentGraphState>> {
  try {
    // Find the tool by name (or import the function directly if preferred)
    const bookTool = tools.find((t) => t.name === "bookAppointment");

    if (!bookTool) throw new Error("Booking tool not found");

    // Normalize the date before calling the tool
    const normalizedDate = state.selectedDate
      ? normalizeDate(state.selectedDate)
      : undefined;

    // Call the tool with the current state
    const result = await bookTool.invoke({
      customerName: state.customerName,
      email: state.email,
      phone: state.phone,
      status: state.status || "SCHEDULED",
      bookedById: state.bookedById || state.userId,
      serviceId: state.serviceId,
      selectedDate: normalizedDate,
      selectedTime: state.selectedTime,
      userId: "cmch8ahh90000uj8k19koy2y9",
      message: state.message || "hi",
      isForSelf: state.isForSelf ?? true,
      createdById: state.createdById || state.userId,
    });
    return { confirmed: true, ...result }; // Optionally merge result into state
  } catch (error: any) {
    return { error: error.message || "Booking failed" };
  }
}

async function checkAvailability(
  state: AppointmentGraphState
): Promise<Partial<AppointmentGraphState>> {
  if (!state.serviceId || !state.selectedDate || !state.selectedTime) {
    const requiredFields: (keyof AppointmentGraphState)[] = [
      "serviceId",
      "selectedDate",
      "selectedTime",
    ];
    const missingFields = requiredFields.filter((f) => !state[f]);
    return { missingFields };
  }

  // Convert selectedDate to weekday string (e.g., MONDAY)
  const dateObj = new Date(state.selectedDate);
  const weekDayString = dateObj
    .toLocaleDateString("en-US", { weekday: "long" })
    .toUpperCase();

  // Convert string to Prisma enum
  const weekDayEnum: WeekDays =
    WeekDays[weekDayString as keyof typeof WeekDays];

  // Query service with availability for the given weekday
  const service = await prisma.service.findUnique({
    where: { id: state.serviceId },
    include: {
      serviceAvailability: {
        where: { weekDay: weekDayEnum },
        include: { timeSlots: true },
      },
    },
  });

  if (
    !service ||
    !service.serviceAvailability ||
    service.serviceAvailability.length === 0
  ) {
    return { error: "Service or availability not found for the selected day." };
  }

  const availability = service.serviceAvailability[0];
  const slot = availability.timeSlots.find(
    (t) => t.startTime === state.selectedTime && t.isAvailable
  );

  if (!slot) {
    return { error: "Requested time slot is not available." };
  }

  // Check max bookings
  if (service.maxBookings !== null && service.maxBookings !== undefined) {
    const bookingsCount = await prisma.appointment.count({
      where: {
        serviceId: state.serviceId,
        selectedDate: state.selectedDate,
        selectedTime: state.selectedTime,
      },
    });

    if (bookingsCount >= service.maxBookings) {
      return { error: "Slot is fully booked." };
    }
  }

  return {};
}

// 6. Node: Handle Error
async function handleError(
  state: AppointmentGraphState
): Promise<Partial<AppointmentGraphState>> {
  // Here you could log the error or notify the user
  return {};
}

// 7. Build the graph
const graphBuilder = new StateGraph(AppointmentGraphStateSchema);

graphBuilder
  .addNode("collectService", collectService)
  .addNode("collectDateTime", collectDateTime)
  .addNode("checkAvailability", checkAvailability)
  .addNode("confirmDetails", confirmDetails)
  // Specify possible ends for bookAppointmentNode
  .addNode("bookAppointment", bookAppointmentNode, {
    ends: ["handleError", "__end__"],
  })
  // Mark handleError as an end node
  .addNode("handleError", handleError, { ends: ["__end__"] });

// Edges (transitions)
graphBuilder.addEdge(START, "collectService" as any);
graphBuilder.addEdge("collectService" as any, "collectDateTime" as any);
graphBuilder.addEdge("collectDateTime" as any, "checkAvailability" as any);
graphBuilder.addEdge("checkAvailability" as any, "confirmDetails" as any);
graphBuilder.addEdge("confirmDetails" as any, "bookAppointment" as any);
graphBuilder.addEdge("bookAppointment" as any, END);
// Add this edge so handleError is reachable
graphBuilder.addEdge("bookAppointment" as any, "handleError" as any);
graphBuilder.addEdge("handleError" as any, END);
// 8. Export the compiled graph
export const appointmentGraph = graphBuilder.compile();
