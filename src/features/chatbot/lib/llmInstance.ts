import { ChatOpenAI } from "@langchain/openai";

export // LLM setup
const llm = new ChatOpenAI({
  model: "deepseek/deepseek-r1:free",
  openAIApiKey:
    process.env.API_KEY,
  configuration: { baseURL: "https://openrouter.ai/api/v1" },
  temperature: 0,
  streaming: false,
});
