import { prisma } from "@/lib/prisma";

function extractFieldsFromMessage(message: string) {
  // Try key-value extraction first
  const customerNameMatch = message.match(/customername[:=]\s*([^,\n]+)/i);
  const emailMatch = message.match(/email[:=]\s*([^,\n]+)/i);
  const phoneMatch = message.match(/phone[:=]\s*([^,\n]+)/i);
  const serviceNameMatch = message.match(/servicename[:=]\s*([^,\n]+)/i);
  const selectedDateMatch = message.match(/selecteddate[:=]\s*([^,\n]+)/i);
  const selectedTimeMatch = message.match(/selectedtime[:=]\s*([^,\n]+)/i);

  // Fallback: comma-separated values
  let customerName, email, phone, serviceName, selectedDate, selectedTime;
  const parts = message.split(",").map((p) => p.trim());
  if (parts.length >= 6) {
    [customerName, email, phone, serviceName, selectedDate, selectedTime] =
      parts;
  }

  return {
    customerName: customerNameMatch
      ? customerNameMatch[1].trim()
      : customerName,
    email: emailMatch ? emailMatch[1].trim() : email,
    phone: phoneMatch ? phoneMatch[1].trim() : phone,
    serviceName: serviceNameMatch ? serviceNameMatch[1].trim() : serviceName,
    selectedDate: selectedDateMatch
      ? selectedDateMatch[1].trim()
      : selectedDate,
    selectedTime: selectedTimeMatch
      ? selectedTimeMatch[1].trim()
      : selectedTime,
  };
}

function extractServiceNameFromMessage(
  message: string,
  allServiceNames: string[]
): string | null {
  const lowerMsg = message.toLowerCase();
  for (const service of allServiceNames) {
    if (lowerMsg.includes(service.toLowerCase())) {
      return service;
    }
  }
  return null;
}

function extractAppointmentNameFromMessage(
  message: string
): string | undefined {
  const match = message.match(/appointmentname[:=]\s*([^,\n]+)/i);
  return match ? match[1].trim() : undefined;
}

function extractAppointmentId(message: string): string | undefined {
  // Adjust this regex to match your expected input format
  const match = message.match(/appointmentid[:=]\s*([^\s,]+)/i);
  return match ? match[1].trim() : undefined;
}

// Helper function to parse userId from message (simple example)
function parseUserIdFromMessage(message: string): string | null {
  // Looks for "for user <userId>"
  const match = message.match(/for user (\w+)/i);
  return match ? match[1] : null;
}

function extractUserIdFromMessage(message: string): string | undefined {
  const match = message.match(/user\s*id[:=]?\s*([a-zA-Z0-9-_]+)/i);
  return match ? match[1].trim() : undefined;
}

function extractEmailFromMessage(message: string): string | null {
  const match = message.match(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/
  );
  console.log("match", match);
  return match ? match[0] : null;
}
async function getUserIdByEmail(email: string): Promise<string | undefined> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return user?.id;
}

export {
  extractEmailFromMessage,
  getUserIdByEmail,
  extractFieldsFromMessage,
  extractServiceNameFromMessage,
};
