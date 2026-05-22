export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

async function post(body: object): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  const data = await res.json() as { text: string };
  return data.text;
}

export function chat(prompt: string): Promise<string> {
  return post({ prompt });
}

export function chatWithHistory(messages: ChatMessage[], system?: string): Promise<string> {
  return post({ messages, system });
}
