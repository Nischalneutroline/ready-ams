import { OllamaEmbeddings } from "@langchain/ollama";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PrismaClient, Role } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export async function embedAndIndexAllContent({ forceReindex = false } = {}) {
  // Only re-index if forced or no docs exist
  if (!forceReindex) {
    const docCount = await prisma.document.count();
    if (docCount > 0) return;
  }
  // Optionally clear old docs
  await prisma.document.deleteMany();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  //do the open ai embedding while in production
  /*  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
    configuration: { baseURL: "https://api.openai.com/v1" },
    model: "text-embedding-3-small",
  });
 */

  // Use Ollama for embeddings in dev
  const embeddings = new OllamaEmbeddings({
    model: "mxbai-embed-large", // or another supported embedding model
    baseUrl: "http://localhost:11434", // default Ollama endpoint
  });

  // Index database content (appointments, services )
  // Appointments
  // 1. Index Appointments
  const today = new Date();
  const appointments = await prisma.appointment.findMany({
    where: {
      selectedDate: {
        gte: today, // Only include appointments from today onwards
      },
    },
    include: { user: true, service: true },
  });
  for (const appt of appointments) {
    const dateStr = appt.selectedDate.toISOString().split("T")[0];
    console.log("user is", appt.service.title);
    const content = `Appointment for ${appt.service.title} on ${`${dateStr} ${appt.selectedTime}`} by user email: ${appt.email || appt.user?.email} name: ${appt.customerName} phone: ${appt.phone}`;
    const chunks = await splitter.splitText(content);
    const accessLevel = ["USER", "ADMIN", "SUPERADMIN"];
    for (const chunk of chunks) {
      const id = uuidv4();
      const embedding = await embeddings.embedQuery(chunk);
      await prisma.$executeRaw`
  INSERT INTO "Document" ("id", "content", "accessLevel", "appointmentId", "source", "embedding", "metadata")
  VALUES (${id}, ${chunk}, ${accessLevel}::"Role"[], ${appt.id}, 'appointment', ${embedding}::vector,  ${JSON.stringify(
    {
      appointmentId: appt.id,
      userId: appt.userId,
      bookedById: appt.bookedById,
      serviceId: appt.serviceId,
      source: "appointment",
      accessLevel,
    }
  )}::jsonb )
`;
    }
  }

  // 2. Index Services
  /* const services = await prisma.service.findMany();
  for (const service of services) {
    const content = `Service: ${service.title}. Description: ${service.description || "N/A"}. Price: $${service.price || "N/A"}. Duration: ${service.estimatedDuration || "N/A"} minutes.`;
    const chunks = await splitter.splitText(content);
    const accessLevel = ["USER", "ADMIN", "SUPERADMIN"];
    for (const chunk of chunks) {
      const id = uuidv4();
      const embedding = await embeddings.embedQuery(chunk);
      await prisma.$executeRaw`
  INSERT INTO "Document" ("id","content", "accessLevel", "serviceId", "source", "embedding", "metadata")
  VALUES (${id}, ${chunk}, ${accessLevel}::"Role"[], ${service.id}, 'service', ${embedding}::vector , ${JSON.stringify(
    {
      serviceId: service.id,
      source: "service",
      accessLevel,
    }
  )}::jsonb 
  )
`;
    }
  } */
  const serviceAvailabilities = await prisma.serviceAvailability.findMany({
    include: { service: true, timeSlots: true },
  });
  for (const avail of serviceAvailabilities) {
    const slots = avail.timeSlots
      .map((slot) => `from ${slot.startTime} to ${slot.endTime}`)
      .join(", ");
    const content = `Service "${avail.service.title}" is available on ${avail.weekDay} ${slots}.`;
    const chunks = await splitter.splitText(content);
    const accessLevel = ["USER", "ADMIN", "SUPERADMIN"];
    for (const chunk of chunks) {
      const id = uuidv4();
      const embedding = await embeddings.embedQuery(chunk);
      await prisma.$executeRaw`
      INSERT INTO "Document" ("id", "content", "accessLevel", "serviceId", "source", "embedding", "metadata")
      VALUES (
        ${id},
        ${chunk},
        ${accessLevel}::"Role"[],
        ${avail.serviceId},
        'service_availability',
        ${embedding}::vector,
        ${JSON.stringify({
          serviceId: avail.serviceId,
          weekDay: avail.weekDay,
          timeSlots: avail.timeSlots.map((slot) => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
            isAvailable: slot.isAvailable,
          })),
          source: "service_availability",
          accessLevel,
        })}::jsonb
      )
    `;
    }
  }

  /*  // 3. Index Companies
  const companies = await prisma.company.findMany();
  for (const company of companies) {
    const content = `Company: ${company.name}. Address: ${company.address || "N/A"}. Hours: ${company.hours || "N/A"}. Policies: ${company.policies || "N/A"}. Contact: ${company.contact || "N/A"}.`;
    const chunks = await splitter.splitText(content);
    for (const chunk of chunks) {
      const embedding = await embeddings.embedQuery(chunk);
      await prisma.document.create({
        data: {
          content: chunk,
          embedding,
          accessLevel: [Role.USER, Role.ADMIN, Role.SUPERADMIN], // Add Role.PUBLIC if you want public access
          companyId: company.id,
          source: "company",
        },
      });
    }
  }
 */
  console.log("All dynamic content indexed!");
}

export async function fetchFullAppointmentHistory(userId: string) {
  const appointments = await prisma.appointment.findMany({
    where: { userId },
    orderBy: { selectedDate: "desc" },
  });
  return appointments;
}

// we can use this if we want to directly add from admin or superadmin site without re-indexing
export async function addDynamicContent(
  title: string,
  content: string,
  accessLevel: Role[] = [Role.USER, Role.ADMIN, Role.SUPERADMIN],
  metadata: Record<string, any> = {}
) {
  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
    model: "text-embedding-3-small",
  });
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const fullText = `${title}\n\n${content}`;
  const chunks = await splitter.splitText(fullText);

  for (const chunk of chunks) {
    const embedding = await embeddings.embedQuery(chunk);
    await prisma.document.create({
      data: {
        content: chunk,
        /* embedding, */
        accessLevel,
        ...metadata,
      },
    });
  }
}
