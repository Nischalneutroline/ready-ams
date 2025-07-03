import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { embedAndIndexPDF } from "@/features/chatbot/lib/embed_and_index";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const chat_history = messages.slice(0, -1); // All but the latest message
    const userMessage = messages[messages.length - 1]?.content || "Hello!";

    const vectorStore = await embedAndIndexPDF();

    if (!vectorStore) {
      return NextResponse.json(
        { error: "Vector store could not be initialized." },
        { status: 500 }
      );
    }
    const retriever = vectorStore.asRetriever(1);

    const llm = new ChatOpenAI({
      model: "deepseek/deepseek-r1:free", // or "gpt-4o"
      openAIApiKey:
        "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",
      configuration: { baseURL: "https://openrouter.ai/api/v1" },
      temperature: 0,
      streaming: false,
    });

    const chain = ConversationalRetrievalQAChain.fromLLM(llm, retriever);

    const result = await chain.call({
      question: userMessage,
      chat_history, // or your chat history array
    });

    return NextResponse.json({
      answer: result.text || result.content || "No answer.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || error.toString(), details: error },
      { status: 500 }
    );
  }
}
