// src/agent.ts
import { createAgent, humanInTheLoopMiddleware, modelRetryMiddleware, piiMiddleware, toolCallLimitMiddleware, toolRetryMiddleware } from "langchain";
import { interrupt, MemorySaver } from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";
import 'dotenv/config'; // and set DOTENV_CONFIG_QUIET=true in env
import promptAdvanced from "./systemPrompt";
import {tools} from "./tools"
import { middlewareStack } from "./middleware/agentMiddlewares";


const memory = new MemorySaver();

export const agent = createAgent({
  model: new ChatGroq({ model: "llama-3.3-70b-versatile" }),
  tools: tools,
  systemPrompt: promptAdvanced,
  checkpointer: memory,
  middleware: middlewareStack
});