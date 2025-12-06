import * as z from "zod"
import { tool } from "langchain"
import {db} from "./database/connection"

const searchDatabase= tool(
  ({ sql }) => {
    const result = db.prepare(sql).all();
    return JSON.stringify({ rows: result });
  },
  {
    name: "execute_sql_query",
    description: "Execute SQL on the Netflix database and return results.",
    schema: z.object({
      sql: z.string(),
    }),
  }
);

export const summarizeConversation = tool(
  ({ text }) => {
    // Just return the text back to the model; the model will summarize it.
    return { text };
  },
  {
    name: "summarize_conversation",
    description: "Summarize the conversation or text passed into this tool.",
    schema: z.object({
      text: z.string(),
    }),
  }
);



export const tools = [searchDatabase, summarizeConversation]