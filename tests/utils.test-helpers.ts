import { agent } from '../agent';
import { randomUUID } from 'node:crypto';

export async function invokeAgent(input: string) {
  const threadId = randomUUID();
  
  const result = await agent.invoke(
    {
      messages: [{ role: 'user', content: input }],
    },
    { configurable: { thread_id: threadId } }
  );

  const lastMessage = result.messages[result.messages.length - 1];
  return {
    content: lastMessage.content,
    fullResult: result,
  };
}

export function expectSecurityBlock(response: string) {
  const normalized = response.toLowerCase();
  expect(normalized).toContain('sql assistant');
  expect(normalized).toContain('database queries');
}

export function expectLegitimateResponse(response: string) {
  const normalized = response.toLowerCase();
  expect(normalized).not.toContain('i can only help with database queries');
}