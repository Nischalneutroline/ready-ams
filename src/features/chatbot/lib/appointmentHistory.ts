import { prisma } from "@/lib/prisma";
import { extractEmailFromMessage, getUserIdByEmail } from "./extraction";

type User = {
  id: string;
  role: string;
  email?: string;
};

function isAppointmentHistoryQuery(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("my booking history") ||
    lower.includes("appointment history") ||
    lower.includes("past appointment")
  );
}

async function fetchAppointmentHistory(userId: string) {
  const appointments = await prisma.appointment.findMany({
    where: { userId, selectedDate: { lte: new Date() } },
    orderBy: { selectedDate: "desc" },
    include: { service: true },
  });

  // Map to include service name directly
  const result = appointments.map((appt) => ({
    ...appt,
    serviceName: appt.service?.title,
  }));
  console.log("appointments", result);
  return result;
}

async function canUserCancelAppointment(
  user: { id: string; role: string },
  appointmentId: string
): Promise<boolean> {
  if (user.role === "ADMIN" || user.role === "SUPERADMIN") {
    return true;
  }
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { userId: true, bookedById: true },
  });
  if (!appointment) return false;
  return appointment.userId === user.id || appointment.bookedById === user.id;
}

async function handleAppointmentHistoryQuery(
  user: User,
  userMessage: string,
  userId: string
) {
  let targetUserId = userId; // default: current user

  if (user.role === "ADMIN" || user.role === "SUPERADMIN") {
    console.log("admin");
    const email = extractEmailFromMessage(userMessage);
    console.log("email is", email);
    if (email) {
      const idByEmail = await getUserIdByEmail(email);
      if (idByEmail) {
        targetUserId = idByEmail;
      } else {
        return {
          answer: `No user found with email: ${email}`,
          appointments: [],
        };
      }
    }
  }

  console.log("targetUserId", targetUserId);

  const history = await fetchAppointmentHistory(targetUserId);

  if (!history.length) {
    return {
      answer:
        userId === targetUserId
          ? "You have no appointments yet."
          : "This user has no appointments yet.",
      appointments: [],
    };
  }

  const formatted = history
    .map(
      (appt) =>
        `• ${appt.selectedDate.toISOString().split("T")[0]}: ${appt.customerName}  — ${appt.serviceName} (${appt.status})`
    )
    .join("\n");

  return {
    answer:
      userId === targetUserId
        ? `Here are your appointments:\n${formatted}`
        : `Here are the appointments for user:\n${formatted}`,
    appointments: history,
  };
}

export {
  isAppointmentHistoryQuery,
  fetchAppointmentHistory,
  canUserCancelAppointment,
  handleAppointmentHistoryQuery,
};
