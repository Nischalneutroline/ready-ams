import { createToolCallingAgent } from "langchain/agents";
import { llm } from "./llmInstance";
import { systemPrompt } from "./prompt";
import { tools } from "./agentTool";

export const agent = createToolCallingAgent({
  llm,
  tools,
  prompt: systemPrompt,
});
