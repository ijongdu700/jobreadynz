import { useState } from 'react';
import { chat } from '../api/chat';

interface Tool {
  id: string;
  icon: string;
  name: string;
  desc: string;
  prompt: string;
  placeholder: string;
}

const TOOLS: Tool[] = [
  {
    id: 'cv',
    icon: '📄',
    name: 'CV Analyser',
    desc: 'Get feedback on your resume',
    prompt: 'You are a helpful NZ career advisor. Analyse the following CV/resume and give constructive, specific feedback. Focus on: clarity, ATS-friendliness, and suitability for NZ IT entry-level roles. CV: ',
    placeholder: 'Paste your CV text here...',
  },
  {
    id: 'cover',
    icon: '✉️',
    name: 'Cover Letter',
    desc: 'Generate a tailored cover letter',
    prompt: 'Write a professional cover letter for a recent IT graduate in New Zealand with no experience, holding a PSWV (Post Study Work Visa). The job/company details: ',
    placeholder: 'e.g. Junior Developer at Datacom Auckland...',
  },
  {
    id: 'linkedin',
    icon: '💼',
    name: 'LinkedIn Summary',
    desc: 'Craft your About section',
    prompt: 'Write a compelling LinkedIn About section for a recent IT graduate in New Zealand. No experience yet but eager and skilled. Key info: ',
    placeholder: 'e.g. Computer Science grad, skills in Python and React...',
  },
  {
    id: 'skills',
    icon: '🧩',
    name: 'Skills Gap',
    desc: 'Find what to learn next',
    prompt: 'I am a recent IT graduate in NZ with no work experience. Based on NZ job market trends, what are the top 5 skills I should focus on learning? My current skills: ',
    placeholder: 'e.g. Python, basic SQL, some React...',
  },
];

const RESUME_LINKS = [
  { icon: '📝', name: 'Resume Giants',       url: 'https://app.resumegiants.com/user/',  desc: 'resumegiants.com' },
  { icon: '💼', name: 'LinkedIn Jobs',          url: 'https://www.linkedin.com/jobs', desc: 'linkedin.com/jobs' },
];

export default function AITools() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const active = TOOLS.find(t => t.id === activeId) ?? null;

  const run = async (tool: Tool) => {
    if (!input.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const text = await chat(tool.prompt + input);
      setResult(text || 'No response.');
    } catch {
      setResult('Error connecting to AI. Please try again.');
    }
    setLoading(false);
  };

  if (active) {
    return (
      <div>
        <div className="page-header">
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginBottom: 12 }}
            onClick={() => { setActiveId(null); setInput(''); setResult(''); }}
          >
            ← Back
          </button>
          <div className="page-title">{active.icon} {active.name}</div>
        </div>
        <div className="card">
          <div className="card-title">Your input</div>
          <textarea
            className="diary-textarea"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={active.placeholder}
            style={{ minHeight: 120 }}
          />
          <button className="btn" style={{ marginTop: 10 }} onClick={() => run(active)} disabled={loading}>
            {loading ? 'Thinking…' : 'Run AI ✦'}
          </button>
        </div>
        {result && (
          <div className="card">
            <div className="card-title">AI Response</div>
            <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{result}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">AI Tools</div>
        <div className="page-sub">AI tools to sharpen your applications.</div>
      </div>
      <div className="tool-grid">
        {TOOLS.map(t => (
          <div className="tool-card" key={t.id} onClick={() => setActiveId(t.id)}>
            <div className="tool-icon">{t.icon}</div>
            <div className="tool-name">{t.name}</div>
            <div className="tool-desc">{t.desc}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title">Resume builder links</div>
        {RESUME_LINKS.map(r => (
          <a key={r.name} className="link-card" href={r.url} target="_blank" rel="noreferrer">
            <span className="link-icon">{r.icon}</span>
            <div>
              <div className="link-name">{r.name}</div>
              <div className="link-url">{r.desc}</div>
            </div>
            <span className="link-arrow">↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}
