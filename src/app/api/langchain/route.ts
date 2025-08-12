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
import {
  isAppointmentHistoryQuery,
  handleAppointmentHistoryQuery,
} from "@/features/chatbot/lib/appointmentHistory";

import {
  getConversationState,
  handleAgentConversationFlow,
} from "@/features/chatbot/lib/conversationState";

const prisma = new PrismaClient();

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
      select: { id: true, role: true, email: true },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const chat_history = messages.slice(0, -1);
    const userMessage = messages[messages.length - 1]?.content || "Hello!";

    // 1. Check if user is asking for appointment history
    if (isAppointmentHistoryQuery(userMessage)) {
      console.log("history");
      const result = await handleAppointmentHistoryQuery(
        user,
        userMessage,
        userId
      );
      return NextResponse.json(result);
    }

    const state = await getConversationState(userId);

    const flowResult = await handleAgentConversationFlow({
      user,
      userId,
      userMessage,
      state,
    });
    if (flowResult) return flowResult;

    // Setup vector store (using pgvector)
    /*  const embeddings = new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY,
      model: "text-embedding-3-small",
    }); */

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "text-embedding-3-small",
      dimensions: 1024,
    });

    // Use Ollama for embeddings in dev
    /* const embeddings = new OllamaEmbeddings({
      model: "mxbai-embed-large", // or another supported embedding model
      baseUrl: "http://localhost:11434", // default Ollama endpoint
    });
 */
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

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
     LIMIT 20;
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
    /* const llm = new ChatOpenAI({
      model: "deepseek/deepseek-r1:free",
      openAIApiKey: process.env.DEEPSEEK_API_KEY,
      configuration: { baseURL: "https://openrouter.ai/api/v1" },
      temperature: 0,
      streaming: false,
    }); */

    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
      streaming: false,
      callbacks: [
        {
          handleLLMEnd(output) {
            console.log("LLM Token Usage:", output);
          },
        },
      ],
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
