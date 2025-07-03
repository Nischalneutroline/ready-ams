import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

export const systemPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a helpful assistant for a booking and appointment system. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Keep the answer concise and helpful.\n\nContext: {context}`,
  ],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
]);
