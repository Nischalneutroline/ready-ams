import { prisma } from "@/lib/prisma";
import {
  extractEmailFromMessage,
  extractFieldsFromMessage,
  extractServiceNameFromMessage,
} from "./extraction";
import { getAppointmentIdByEmailAndService } from "@/db/appointment";
import { NextResponse } from "next/server";
import { canUserCancelAppointment } from "./appointmentHistory";
import { cancelAppointment } from "./agentTool";
import { getServiceIdByName } from "@/db/service";
import { appointmentGraph } from "./appointmentGraph";
import { getUserIdByEmail } from "@/db/user";
import {
  getExampleForMissingFields,
  getMissingBookingFields,
  getMissingCancellationFields,
  isAppointmentAction,
  isCancellationAction,
  isNegativeIntent,
  isServiceDiscoveryQuery,
  isCancellationFlow,
} from "./intentDetection";

async function getConversationState(userId: string) {
  let state = await prisma.conversationState.findUnique({ where: { userId } });
  if (!state) {
    state = await prisma.conversationState.create({
      data: { userId, flow: null, collectedFields: {}, missingFields: [] },
    });
  }
  return state;
}

async function updateConversationState(userId: string, updates: Partial<any>) {
  return prisma.conversationState.update({
    where: { userId },
    data: updates,
  });
}

async function clearConversationState(userId: string) {
  await prisma.conversationState.update({
    where: { userId },
    data: { flow: null, collectedFields: {}, missingFields: [] },
  });
}

async function handleAgentConversationFlow({
  user,
  userId,
  userMessage,
  state,
}: {
  user: { id: string; role: string; email: string };
  userId: string;
  userMessage: string;
  state: any;
}) {
  //first check if  they dontwant to book appointment or want to end  the current booking or cancellation state
  if (isServiceDiscoveryQuery(userMessage) || isNegativeIntent(userMessage)) {
    console.log("negative");
    await clearConversationState(userId);
    return null;
  }

  const services = await prisma.service.findMany({ select: { title: true } });
  const allServiceNames = services.map((service) => service.title);

  // 1. Ongoing cancellation flow
  if (state.flow === "cancellation") {
    console.log("2nd cancellation");
    // Check if the current message is cancellation-related
    if (!isCancellationFlow(userMessage, allServiceNames)) {
      console.log("test");
      await clearConversationState(userId);
      return null;
    }
    let updatedFields: Record<string, any> = {
      ...((state.collectedFields as Record<string, any>) || {}),
    };
    console.log("updated", updatedFields);
    /*  const appointmentIdMatch = extractAppointmentId(userMessage);
    if (appointmentIdMatch) updatedFields.appointmentId = appointmentIdMatch; */
    /*  if (!updatedFields.appointmentEmail) { */
    const appointmentEmailMatch = extractEmailFromMessage(userMessage);
    console.log("app", appointmentEmailMatch);

    const appointmentServiceMatch = extractServiceNameFromMessage(
      userMessage,
      allServiceNames
    );
    console.log("appointment service match", appointmentServiceMatch);
    if (appointmentEmailMatch)
      updatedFields.appointmentEmail = appointmentEmailMatch;
    if (appointmentServiceMatch)
      updatedFields.appointmentService = appointmentServiceMatch;

    if (
      !updatedFields.appointmentId &&
      updatedFields.appointmentEmail &&
      updatedFields.appointmentService
    ) {
      updatedFields.appointmentId = await getAppointmentIdByEmailAndService(
        updatedFields.appointmentEmail,
        updatedFields.appointmentService
      );
      if (!updatedFields.appointmentId) {
        return NextResponse.json({
          answer: `No appointment found for email '${updatedFields.appointmentEmail}' and service '${updatedFields.appointmentService}'. Please check your details.`,
        });
      }
    }
    const updatedMissingFields = getMissingCancellationFields(updatedFields);
    console.log("updated", updatedMissingFields);
    await updateConversationState(userId, {
      collectedFields: updatedFields,
      missingFields: updatedMissingFields,
    });
    if (updatedMissingFields.length === 0) {
      if (
        !(await canUserCancelAppointment(user, updatedFields.appointmentId))
      ) {
        console.log("test");
        return NextResponse.json({
          answer: "You do not have permission to cancel this appointment.",
          status: 403,
        });
      }
      const result = await cancelAppointment({
        appointmentId: updatedFields.appointmentId,
      });
      console.log("result is", result);
      //shift this to other function later
      const service = await prisma.service.findUnique({
        where: { id: result.data.serviceId },
        select: { title: true },
      });
      const serviceName = service?.title || "Unknown Service";
      await clearConversationState(userId);
      return NextResponse.json({
        answer: `Appointment has been **successfully canceled**.
  \n\n**Cancellation Details:**\n
  - **Service:** ${serviceName}
  - **Date:** ${result.data.selectedDate}
  - **Time:** ${result.data.selectedTime}
  - **Email:** ${result.data.email}`,
        data: result,
      });
    } else {
      return NextResponse.json({
        answer: `Please provide ${updatedMissingFields} to cancel.`,
      });
    }
  }

  // 2. Detect cancellation intent
  if (isCancellationAction(userMessage)) {
    console.log("1st cancellation");
    /* const appointmentId = extractAppointmentId(userMessage); */
    const appointmentEmail = extractEmailFromMessage(userMessage);
    const appointmentService = extractServiceNameFromMessage(
      userMessage,
      allServiceNames
    );
    const initialFields: Record<string, any> = {};
    /*     if (appointmentId) initialFields.appointmentId = appointmentId; */
    if (appointmentEmail) initialFields.appointmentEmail = appointmentEmail;
    if (appointmentService)
      initialFields.appointmentService = appointmentService;

    // If appointmentId is missing but appointmentName is present, resolve appointmentId dynamically
    if (
      !initialFields.appointmentId &&
      initialFields.appointmentName &&
      initialFields.appointmentService
    ) {
      initialFields.appointmentId = await getAppointmentIdByEmailAndService(
        initialFields.appointmentEmail,
        initialFields.appointmentService
      );
      if (!initialFields.appointmentId) {
        return NextResponse.json({
          answer: `No appointment found for email '${initialFields.appointmentEmail}' and service '${initialFields.appointmentService}'. Please check your details.`,
        });
      }
    }

    const initialMissingFields = getMissingCancellationFields(initialFields);

    await updateConversationState(userId, {
      flow: "cancellation",
      collectedFields: initialFields,
      missingFields: initialMissingFields,
    });

    if (initialMissingFields.length === 0) {
      if (
        !(await canUserCancelAppointment(user, initialFields.appointmentId))
      ) {
        return NextResponse.json({
          answer: "You do not have permission to cancel this appointment.",
          status: 403,
        });
      }
      const result = await cancelAppointment({
        appointmentId: initialFields.appointmentId,
      });
      await clearConversationState(userId);
      return NextResponse.json({
        answer: `Appointment has been **successfully canceled**.
  \n\n**Cancellation Details:**\n
  - **Service:** ${result.data.serviceName}
  - **Date:** ${result.data.selectedDate}
  - **Time:** ${result.data.selectedTime}
  - **Email:** ${result.data.email}`,
        data: result,
      });
    } else {
      return NextResponse.json({
        answer: `Please provide ${initialMissingFields} to cancel.`,
      });
    }
  }

  // 3. Ongoing booking flow
  if (state.flow === "booking") {
    console.log("2nd book");
    if (!isAppointmentAction(userMessage)) {
      console.log("no agent");
      await clearConversationState(userId);
      // Optionally, return null so the main handler can process the message as a new intent
      return null;
    }

    const extracted = extractFieldsFromMessage(userMessage);
    let updatedFields: Record<string, any> = { ...extracted };
    if (
      state.collectedFields &&
      typeof state.collectedFields === "object" &&
      !Array.isArray(state.collectedFields)
    ) {
      updatedFields = {
        ...(state.collectedFields as Record<string, any>),
        ...extracted,
      };
    }
    if (!updatedFields.serviceId && updatedFields.serviceName) {
      updatedFields.serviceId = await getServiceIdByName(
        updatedFields.serviceName
      );
      if (!updatedFields.serviceId) {
        return NextResponse.json({
          answer: `Service named '${updatedFields.serviceName}' not found. Please provide a valid service name.`,
        });
      }
    }
    if (updatedFields.email) {
      updatedFields.userId = await getUserIdByEmail(updatedFields.email);
      if (!updatedFields.userId) {
        console.log("no user");
        return NextResponse.json({
          answer: `${updatedFields.email} not found. Please provide a valid email to book a appointment.`,
        });
      }
    }

    const updatedMissingFields = getMissingBookingFields(updatedFields);
    const example = getExampleForMissingFields(updatedMissingFields);
    await updateConversationState(userId, {
      collectedFields: updatedFields,
      missingFields: updatedMissingFields,
    });
    if (updatedMissingFields.length === 0) {
      if (
        user.role !== "ADMIN" &&
        user.role !== "SUPERADMIN" &&
        updatedFields.userId !== userId
      ) {
        return NextResponse.json({
          answer:
            "You do not have permission to book an appointment for another user.",
          status: 403,
        });
      }

      const result = await appointmentGraph.invoke({
        userId,
        ...updatedFields,
      });

      if (result.error) {
        return NextResponse.json({
          answer: `Booking failed: ${result.error}`,
          status: 400,
        });
      }
      await clearConversationState(userId);
      return NextResponse.json({
        answer: "Your appointment has been booked successfully!",
        data: result,
      });
    } else {
      return NextResponse.json({
        answer:
          `Please provide: ${updatedMissingFields.join(", ")} to book appointment\n` +
          (example ? `_e.g._: ${example}` : ""),
      });
    }
  }

  // 4. New booking intent
  if (isAppointmentAction(userMessage)) {
    console.log("1st book");
    /* const parsedUserId = parseUserIdFromMessage(userMessage); */
    /* const bookingUserId = parsedUserId || userId; */
    const extracted = extractFieldsFromMessage(userMessage);
    const initialFields: Record<string, any> = { ...extracted, userId };
    if (!initialFields.serviceId && initialFields.serviceName) {
      initialFields.serviceId = await getServiceIdByName(
        initialFields.serviceName
      );
      if (!initialFields.serviceId) {
        return NextResponse.json({
          answer: `Service named '${initialFields.serviceName}' not found. Please provide a valid service name.`,
        });
      }
    }

    if (initialFields.email) {
      initialFields.userId = await getUserIdByEmail(initialFields.email);
      if (!initialFields.userId) {
        return NextResponse.json({
          answer: `${initialFields.email} not found. Please provide a valid email to book a appointment.`,
        });
      }
    }

    const initialMissingFields = getMissingBookingFields(initialFields);
    const example = getExampleForMissingFields(initialMissingFields);
    await updateConversationState(userId, {
      flow: "booking",
      collectedFields: initialFields,
      missingFields: initialMissingFields,
    });
    if (initialMissingFields.length === 0) {
      if (
        user.role !== "ADMIN" &&
        user.role !== "SUPERADMIN" &&
        initialFields.userId !== userId
      ) {
        return NextResponse.json({
          answer:
            "You do not have permission to book an appointment for another user.",
          status: 403,
        });
      }
      const result = await appointmentGraph.invoke(initialFields);
      if (result.error) {
        console.log("error");
        return NextResponse.json({
          answer: `Booking failed: ${result.error}`,
          status: 400,
        });
      }
      await clearConversationState(userId);
      return NextResponse.json({
        answer: "Appointment booked successfully!",
        data: result,
      });
    } else {
      return NextResponse.json({
        answer:
          `Please provide: ${initialMissingFields.join(", ")}\n` +
          (example ? `_e.g._: ${example}` : ""),
      });
    }
  }

  // If no known flow, return null so the route can continue with fallback logic (e.g., RAG/LLM)
  return null;
}

export {
  getConversationState,
  clearConversationState,
  handleAgentConversationFlow,
  updateConversationState,
};
