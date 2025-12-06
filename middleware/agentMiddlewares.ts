// src/middleware/agentMiddlewares.ts

import {
  modelRetryMiddleware,
  toolRetryMiddleware,
  modelCallLimitMiddleware,
  toolCallLimitMiddleware,
  modelFallbackMiddleware,
} from "langchain";

// =======================
// RETRY: LLM
// =======================
const modelRetry = modelRetryMiddleware({
    maxRetries: 3,  // ✅ Good - prevents infinite loops
    backoffFactor: 2.0,  // ✅ Good - exponential backoff
    initialDelayMs: 1000,  // 🔄 Consider increasing from 500ms
    maxDelayMs: 8000,  // 🔄 Consider increasing from 4000ms
    jitter: true,  // ✅ Good - helps with thundering herd
    retryOn: (err: Error) => {
      const msg = err.message?.toLowerCase() || "";
    
    // Don't retry on these SQL-specific errors:
      const nonRetryableErrors = [
        "syntax error",
        "permission denied", 
        "access denied",
        "invalid query",
        "table does not exist",
        "column does not exist",
        "constraint violation",
        "duplicate key",
      ];
    
    if (nonRetryableErrors.some(e => msg.includes(e))) {
      return false;  // Don't retry logic/permission errors
    }
    
    // DO retry on these:
    return (
      msg.includes("rate limit") ||
      msg.includes("timeout") ||
      msg.includes("timed out") ||
      msg.includes("overloaded") ||
      msg.includes("temporarily unavailable") ||
      msg.includes("connection") ||  // Add connection errors
      msg.includes("econnreset") ||
      msg.includes("econnrefused")
    );
  },
});

// =======================
// RETRY: TOOLS
// =======================
const toolRetry = toolRetryMiddleware({
    maxRetries: 2,            // 🔄 Consider reducing to 2 for tools
    backoffFactor: 2,         
    maxDelayMs: 4000,         // 🔄 Increase - SQL queries can take time
    jitter: true,             
    onFailure: "continue",
    
    // Add retry condition if supported:
    retryOn: (err: Error) => {
        const msg = err.message?.toLowerCase() || "";
        
        // Don't retry SQL logic/syntax errors
        const noRetry = [
            "syntax error",
            "invalid query", 
            "does not exist",
            "permission denied",
            "constraint violation",
        ];
        
        if (noRetry.some(e => msg.includes(e))) {
            return false;
        }
        
        // DO retry transient errors
        return (
            msg.includes("timeout") ||
            msg.includes("connection") ||
            msg.includes("lock") ||  // DB locks are worth retrying
            msg.includes("deadlock")
        );
    },
});

// =======================
// LIMITS
// =======================
const modelCallLimit = modelCallLimitMiddleware({ threadLimit: 10, runLimit: 5, exitBehavior: "end",});
const toolCallLimit = toolCallLimitMiddleware({ toolName: "execute_sql_query", runLimit: 5, threadLimit: 40, exitBehavior: "error", });

// =======================
// EXPORT STACK
// =======================
export const middlewareStack = [
  modelRetry,
  toolRetry,
  modelCallLimit,
  toolCallLimit,
];