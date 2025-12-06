import { ReadLine } from "readline";
import { randomUUID } from "node:crypto";
import readline from "node:readline"
import { agent } from "./agent"
import { getSchema } from "./database/connection";

const threadId = randomUUID();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

function detectPromptInjection(userMessage: string): boolean {
  const injectionPatterns = [
    /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
    /you\s+are\s+now/i,
    /from\s+now\s+on/i,
    /new\s+instructions/i,
    /system\s*:/i,
    /forget\s+everything/i,
    /respond\s+as/i,
    /act\s+as/i,
    /pretend\s+(you're|you\s+are)/i,
    /tell\s+(me\s+)?a\s+joke/i, // Add this too
  ];
  
  return injectionPatterns.some(pattern => pattern.test(userMessage));
}

function sanitizeInput(input: string): string {
  // Remove potential role-switching prefixes
  return input
    .replace(/^(system|assistant|user)\s*:\s*/gi, '')
    .replace(/\[SYSTEM\]/gi, '')
    .replace(/\[ASSISTANT\]/gi, '')
    .trim();
}



async function chatLoop() {
  console.log("💬 CLI Chat Started — type 'exit' to quit\n");
  console.log(getSchema());

  while (true) {
    const input = await ask("> ");
    const sanitizedInput = sanitizeInput(input);

    if (!input.trim()) continue;
    if (input.toLowerCase() === "exit") break;

    try {
      // 🔒 CHECK FOR INJECTION FIRST
      if (detectPromptInjection(sanitizeInput(input))) {
        console.log("AI: I'm a SQL assistant. I can only help with database queries.");
        console.log("\n");
        continue; // Skip the agent call entirely
      }

      // Process normally if no injection detected
      const result = await agent.invoke(
        {
          messages: [{ role: "user", content: input }],
        },
        { configurable: { thread_id: threadId } }
      );

      const messages = result.messages;
      const lastMessage = messages[messages.length - 1];
      
      console.log("AI:", lastMessage.content || "(no content)");
    } catch (error) {
      console.error("Error:", error);
    }
    
    console.log("\n");
  }

  rl.close();
  process.exit(0);
}

chatLoop();