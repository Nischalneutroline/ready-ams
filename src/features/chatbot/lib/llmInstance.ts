import { ChatOpenAI } from "@langchain/openai";

export // LLM setup
const llm = new ChatOpenAI({
  model: "deepseek/deepseek-r1:free",
  openAIApiKey:
    "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",
  configuration: { baseURL: "https://openrouter.ai/api/v1" },
  temperature: 0,
  streaming: false,
});
