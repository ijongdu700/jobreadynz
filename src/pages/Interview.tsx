import { useState, useRef } from 'react';
import { chatWithHistory, type ChatMessage } from '../api/chat';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const SYSTEM = `You are a friendly but professional interviewer for junior IT roles in New Zealand. The candidate is a recent graduate with no IT work experience, holding a PSWV visa. Ask ONE question at a time. After their answer, give brief encouraging feedback (1-2 sentences), then ask the next question. Mix: behavioural, technical basics, and NZ workplace culture questions. Start by introducing yourself and asking the first question. Keep responses concise and natural.`;

function toChatMessages(msgs: Message[]): ChatMessage[] {
  return msgs.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }));
}

export default function Interview() {
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, 100);
  };

  const start = async () => {
    setStarted(true);
    setLoading(true);
    try {
      const text = await chatWithHistory([{ role: 'user', content: 'Start the interview session.' }], SYSTEM);
      setMsgs([{ role: 'ai', text }]);
    } catch {
      setMsgs([{ role: 'ai', text: 'Error starting session. Please check your API key.' }]);
    }
    setLoading(false);
    scrollToBottom();
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const newMsgs: Message[] = [...msgs, { role: 'user', text: input }];
    setMsgs(newMsgs);
    setInput('');
    setLoading(true);
    try {
      const text = await chatWithHistory(toChatMessages(newMsgs), SYSTEM);
      setMsgs(prev => [...prev, { role: 'ai', text }]);
    } catch {
      setMsgs(prev => [...prev, { role: 'ai', text: 'Connection error.' }]);
    }
    setLoading(false);
    scrollToBottom();
  };

  if (!started) {
    return (
      <div>
        <div className="page-header">
          <div className="page-title">Interview Prep</div>
          <div className="page-sub">Practice with an AI interviewer tailored for NZ IT entry-level roles.</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🎤</div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Ready to practice?</div>
          <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.6 }}>
            The AI interviewer will ask you questions one by one, give feedback, and help you get comfortable.
          </div>
          <button className="btn" onClick={start}>Start interview session →</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">Interview Session 🎤</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => { setStarted(false); setMsgs([]); }}>
          End session
        </button>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div className="chat-container" ref={chatRef}>
          {msgs.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role}`}>{m.text}</div>
          ))}
          {loading && <div className="chat-msg ai" style={{ color: 'var(--muted)' }}>Thinking…</div>}
        </div>
        <div className="chat-row">
          <input
            className="chat-inp"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Your answer…"
            disabled={loading}
          />
          <button className="btn" onClick={send} disabled={loading}>Send</button>
        </div>
      </div>
    </div>
  );
}
