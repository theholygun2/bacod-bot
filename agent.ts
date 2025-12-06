// src/agent.ts
import { createAgent, humanInTheLoopMiddleware, modelRetryMiddleware, piiMiddleware, toolCallLimitMiddleware, toolRetryMiddleware } from "langchain";
import { interrupt, MemorySaver } from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";
import 'dotenv/config'; // and set DOTENV_CONFIG_QUIET=true in env
import SYSTEM_PROMPT from "./systemPrompt";
import {tools} from "./tools"
import { middlewareStack } from "./middleware/agentMiddlewares";


const memory = new MemorySaver();

export const agent = createAgent({
  model: new ChatGroq({ model: "llama-3.3-70b-versatile" }),
  tools: tools,
  systemPrompt: SYSTEM_PROMPT,
  checkpointer: memory,
  middleware: middlewareStack
});

// const input = `Do you know whos eminem is?`;
// const result = await agent.invoke({ messages: [{ role: "user", content: input }] });

// const response = getFinalResponse(result);
// console.log(response);


// > i like chocolate recommend me a movie
// AI: Model call limits exceeded: thread level call limit reached with 10 model calls