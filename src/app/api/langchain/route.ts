import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { PrismaClient } from "@prisma/client";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import pg from "pg";
import { RunnableLambda } from "@langchain/core/runnables";
import { OllamaEmbeddings } from "@langchain/ollama";
import { appointmentGraph } from "@/features/chatbot/lib/appointmentGraph";
import { agent } from "@/features/chatbot/lib/agentInstance";
import { cancelAppointment } from "@/features/chatbot/lib/agentTool";

const prisma = new PrismaClient();

function isAppointmentAction(message: string): boolean {
  // Only matches booking/cancellation/reschedule actions
  const actionKeywords = [
    "book",
    "schedule",
    "reschedule",
    "cancel",
    "make an appointment",
  ];
  const lowerMsg = message.toLowerCase();

  // Check for keywords
  const hasActionKeyword = actionKeywords.some((keyword) =>
    lowerMsg.includes(keyword)
  );

  // Check for date in YYYY-MM-DD format
  const hasDate =
    /\b\d{4}-\d{2}-\d{2}\b/.test(message) ||
    /\b\d{2}\/\d{2}\/\d{4}\b/.test(message); // also MM/DD/YYYY

  // Check for time in HH:MM or H:MM format (24-hour or 12-hour)
  const hasTime = /\b\d{1,2}:\d{2}\b/.test(message);

  // If any of the above is true, treat as part of appointment action flow
  return hasActionKeyword || hasDate || hasTime;
}

// Helper function to parse userId from message (simple example)
function parseUserIdFromMessage(message: string): string | null {
  // Looks for "for user <userId>"
  const match = message.match(/for user (\w+)/i);
  return match ? match[1] : null;
}

/* function isAppointmentInfo(message: string): boolean {
  // Matches info queries
  return (
    message.toLowerCase().includes("when is my appointment") ||
    message.toLowerCase().includes("my upcoming appointment") ||
    message.toLowerCase().includes("what appointments do i have") ||
    message.toLowerCase().includes("show my appointments")
  );
} */
function extractAppointmentId(message: string): string | undefined {
  // Adjust this regex to match your expected input format
  const match = message.match(/appointmentid[:=]\s*([^\s,]+)/i);
  return match ? match[1].trim() : undefined;
}

// In-memory context for demo (use session/DB in production)
const awaitingCancellationId: Record<string, boolean> = {};

function extractFieldsFromMessage(message: string) {
  const customerNameMatch = message.match(/customername[:=]\s*([^,\n]+)/i);
  const emailMatch = message.match(/email[:=]\s*([^,\n]+)/i);
  const phoneMatch = message.match(/phone[:=]\s*([^,\n]+)/i);
  const serviceIdMatch = message.match(/serviceid[:=]\s*([^,\n]+)/i);
  const selectedDateMatch = message.match(/selecteddate[:=]\s*([^,\n]+)/i);
  const selectedTimeMatch = message.match(/selectedtime[:=]\s*([^,\n]+)/i);

  return {
    customerName: customerNameMatch ? customerNameMatch[1].trim() : undefined,
    email: emailMatch ? emailMatch[1].trim() : undefined,
    phone: phoneMatch ? phoneMatch[1].trim() : undefined,
    serviceId: serviceIdMatch ? serviceIdMatch[1].trim() : undefined,
    selectedDate: selectedDateMatch ? selectedDateMatch[1].trim() : undefined,
    selectedTime: selectedTimeMatch ? selectedTimeMatch[1].trim() : undefined,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { messages, userId }: { messages: any[]; userId: string } =
      await req.json();

    console.log("userid is", userId);
    if (!userId)
      return NextResponse.json({ error: "User ID required" }, { status: 400 });

    // Get user and role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const chat_history = messages.slice(0, -1);
    const userMessage = messages[messages.length - 1]?.content || "Hello!";

    // 1. If awaiting appointment ID for cancellation
    if (awaitingCancellationId[userId]) {
      console.log("hey");
      if (/^[a-zA-Z0-9]{20,}$/.test(userMessage.trim())) {
        const appointmentId = userMessage.trim();
        const result = await cancelAppointment({ appointmentId });
        awaitingCancellationId[userId] = false;
        return NextResponse.json({
          answer: `Appointment (ID: **${appointmentId}**) has been **successfully canceled**. Let me know if you need further assistance!`,
          data: result,
        });
      }
    }

    // 1. Detect cancellation intent
    if (userMessage.toLowerCase().includes("cancel")) {
      console.log("hiiiii");
      const appointmentId = extractAppointmentId(userMessage);

      if (!appointmentId) {
        awaitingCancellationId[userId] = true;
        // Just like booking: prompt for missing field, no need for temp store!
        return NextResponse.json({
          answer: "Please provide the appointment ID to cancel.",
          missingFields: ["appointmentId"],
        });
      }

      // Call the cancellation tool directly
      const result = await cancelAppointment({ appointmentId });
      return NextResponse.json({
        answer: "Appointment cancelled successfully!",
        data: result,
      });
    }

    // 1. If appointment intent, run the appointmentGraph
    if (isAppointmentAction(userMessage)) {
      console.log("hi", user.role);
      if (user.role === "ADMIN" || user.role === "SUPERADMIN") {
        // Try to parse userId from the message (e.g., "for user <userId>")
        const parsedUserId = parseUserIdFromMessage(userMessage);
        console.log("parsed user id", parsedUserId);
        const bookingUserId = parsedUserId || userId; // Fallback to admin's own userId
        console.log("book user id", bookingUserId);

        const extracted = extractFieldsFromMessage(userMessage);
        const initialState: any = { userId: bookingUserId, ...extracted };

        const graphResult = await appointmentGraph.invoke(initialState);
        console.log("graph result", graphResult);

        /*       if (graphResult.error) {
          return NextResponse.json({ answer: `Error: ${graphResult.error}` });
        } */
        if (graphResult.missingFields && graphResult.missingFields.length > 0) {
          return NextResponse.json({
            answer: `Please provide: ${graphResult.missingFields.join(", ")}`,
          });
        }
        if (graphResult.confirmed) {
          return NextResponse.json({
            answer: "Appointment booked successfully!",
          });
        }
      } else {
        // Normal user can only book for themselves
        const initialState = { userId };
        const graphResult = await appointmentGraph.invoke(initialState);

        if (graphResult.error) {
          return NextResponse.json({ answer: `Error: ${graphResult.error}` });
        }
        if (graphResult.missingFields && graphResult.missingFields.length > 0) {
          return NextResponse.json({
            answer: `Please provide: ${graphResult.missingFields.join(", ")}`,
          });
        }
        if (graphResult.confirmed) {
          return NextResponse.json({
            answer: "Your appointment has been booked successfully!",
          });
        }
      }
    }

    // Setup vector store (using pgvector)
    /*  const embeddings = new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY,
      model: "text-embedding-3-small",
    }); */

    // Use Ollama for embeddings in dev
    const embeddings = new OllamaEmbeddings({
      model: "mxbai-embed-large", // or another supported embedding model
      baseUrl: "http://localhost:11434", // default Ollama endpoint
    });

    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    /*  const vectorStore = await PGVectorStore.initialize(embeddings, {
      pool,
      tableName: "Document",
      columns: {
        idColumnName: "id",
        vectorColumnName: "embedding",
        contentColumnName: "content",
        metadataColumnName: "metadata",
      },
    });

    // Base retriever
    const baseRetriever = vectorStore.asRetriever({
      k: 4,
    });
 */
    // 1. Generate the embedding for your query string
    const queryEmbedding = await embeddings.embedQuery(userMessage);

    // 2. Format the embedding as a vector string for SQL
    const embeddingStr = `[${queryEmbedding.join(",")}]`;

    // 3. Run the raw SQL similarity search
    const client = await pool.connect();
    let docs = [];
    try {
      const sql = `
     SELECT id, content, metadata, embedding <-> $1::vector AS distance
      FROM "Document"
      ORDER BY distance
     LIMIT 5;
     `;
      const result = await client.query(sql, [embeddingStr]);
      docs = result.rows.map((row) => ({
        id: row.id,
        pageContent: row.content,
        metadata: row.metadata,
        distance: row.distance,
      }));
    } finally {
      client.release();
    }

    /*  Role-based retriever */
    const roleBasedRetriever = RunnableLambda.from(async (query: string) => {
      console.log("docs is", user.role);
      if (user.role === "USER") {
        const filteredDocs: Document[] = [];
        let userHasAppointments = false;
        for (const doc of docs) {
          if (!doc.metadata.appointmentId) {
            filteredDocs.push(doc);
          } else {
            /*      Appointment doc: only allow if user is involved */
            const appointment = await prisma.appointment.findUnique({
              where: { id: doc.metadata.appointmentId },
              select: { userId: true, bookedById: true },
            });
            if (
              appointment?.userId === userId ||
              appointment?.bookedById === userId
            ) {
              filteredDocs.push(doc);
              userHasAppointments = true;
            }
          }
        }
        /*   ... (add "no appointments" message if needed) */
        if (
          !userHasAppointments &&
          query.toLowerCase().includes("appointment")
        ) {
          filteredDocs.push(
            new Document({
              pageContent:
                "You have no scheduled appointments. Please book an appointment to get started.",
              metadata: { source: "system" },
            })
          );
        }
        return filteredDocs;
      }
      return docs;
    });

    // LLM setup
    const llm = new ChatOpenAI({
      model: "deepseek/deepseek-r1:free",
      openAIApiKey:
       process.env.API_KEY,
      configuration: { baseURL: "https://openrouter.ai/api/v1" },
      temperature: 0,
      streaming: false,
    });

    // History-aware retriever
    const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "Given a chat history and the latest user question which might reference context in the chat history, formulate a standalone question which can be understood without the chat history. Do NOT answer the question, just reformulate it if needed and otherwise return it as is.",
      ],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
    ]);
    const historyAwareRetriever = await createHistoryAwareRetriever({
      llm,
      retriever: roleBasedRetriever,
      rephrasePrompt: contextualizeQPrompt,
    });

    // QA Chain
    const qaPrompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are a helpful assistant for a booking and appointment system. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Keep the answer concise and helpful.\n\nContext: {context}`,
      ],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
    ]);
    const questionAnswerChain = await createStuffDocumentsChain({
      llm,
      prompt: qaPrompt,
    });

    // Retrieval chain
    const ragChain = await createRetrievalChain({
      retriever: historyAwareRetriever,
      combineDocsChain: questionAnswerChain,
    });

    // Invoke
    const result = await ragChain.invoke({
      input: userMessage,
      chat_history: chat_history,
    });

    return NextResponse.json({
      answer: result.answer,
      sources: result.context?.map((doc: Document) => ({
        content: doc.pageContent.substring(0, 200) + "...",
        source: doc.metadata.source || "system",
      })),
    });
  } catch (error: any) {
    console.error("RAG Chain Error:", error);
    return NextResponse.json(
      { error: error.message || error.toString() },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
