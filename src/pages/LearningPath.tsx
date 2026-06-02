import { useState } from 'react';
import { chatWithHistory } from '../api/chat';

interface Resource {
  title: string;
  url: string;
  type: 'free' | 'paid' | 'official';
}

interface Skill {
  id: string;
  text: string;
  done: boolean;
  resources?: Resource[];
}

interface Phase {
  id: string;
  name: string;
  description: string;
  skills: Skill[];
}

interface AISkill {
  text: string;
  resources: Resource[];
}

const RESOURCE_BADGE: Record<string, { bg: string; color: string }> = {
  official: { bg: 'rgba(63,131,248,0.18)',  color: '#60a5fa' },
  free:     { bg: 'rgba(29,158,117,0.18)',  color: '#4dd4a0' },
  paid:     { bg: 'rgba(245,158,11,0.18)',  color: '#fbbf24' },
};

const DEFAULT_PHASES: Phase[] = [
  {
    id: 'phase-1',
    name: 'Cloud fundamentals (Azure)',
    description: '',
    skills: [
      {
        id: 's1-1', text: 'Core concepts: regions, resource groups, subscriptions', done: false,
        resources: [],
      },
      {
        id: 's1-2', text: 'Spin up a VM and connect via SSH', done: false,
        resources: [
          { title: 'Azure VMs quickstart', url: 'https://learn.microsoft.com/en-us/azure/virtual-machines/', type: 'official' },
        ],
      },
      {
        id: 's1-3', text: 'Azure Blob Storage — upload files, access via URL', done: false,
        resources: [
          { title: 'Azure Blob Storage docs', url: 'https://learn.microsoft.com/en-us/azure/storage/blobs/', type: 'official' },
        ],
      },
      {
        id: 's1-4', text: 'Connect to Azure OpenAI Service via API', done: false,
        resources: [
          { title: 'Azure OpenAI quickstart', url: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/', type: 'official' },
        ],
      },
      {
        id: 's1-5', text: 'Complete Microsoft Learn AZ-900 fundamentals path', done: false,
        resources: [
          { title: 'Microsoft Learn AZ-900', url: 'https://learn.microsoft.com/en-us/training/paths/az-900-describe-cloud-concepts/', type: 'official' },
        ],
      },
    ],
  },
  {
    id: 'phase-2',
    name: 'Docker + CI/CD',
    description: '',
    skills: [
      {
        id: 's2-1', text: 'Containers vs VMs — what Docker actually solves', done: false,
        resources: [
          { title: 'Docker Get Started', url: 'https://docs.docker.com/get-started/', type: 'official' },
          { title: 'TechWorld with Nana — Docker', url: 'https://www.youtube.com/watch?v=3c-iBn73dDE', type: 'free' },
        ],
      },
      {
        id: 's2-2', text: 'Write a Dockerfile for one of your existing projects', done: false,
        resources: [],
      },
      {
        id: 's2-3', text: 'Docker Compose for multi-service setups', done: false,
        resources: [],
      },
      {
        id: 's2-4', text: 'GitHub Actions: push → auto test/build pipeline', done: false,
        resources: [
          { title: 'GitHub Actions docs', url: 'https://docs.github.com/en/actions', type: 'official' },
        ],
      },
      {
        id: 's2-5', text: 'Deploy a containerised app to Azure App Service', done: false,
        resources: [
          { title: 'Deploy to Azure App Service', url: 'https://learn.microsoft.com/en-us/azure/app-service/', type: 'official' },
        ],
      },
    ],
  },
  {
    id: 'phase-3',
    name: 'LLMs in production',
    description: '',
    skills: [
      {
        id: 's3-1', text: 'RAG pipeline: chunking → embedding → vector DB → retrieval', done: false,
        resources: [
          { title: 'LangChain RAG tutorial', url: 'https://python.langchain.com/docs/tutorials/rag/', type: 'official' },
        ],
      },
      {
        id: 's3-2', text: 'LangChain / LlamaIndex basics', done: false,
        resources: [
          { title: 'LangChain docs', url: 'https://python.langchain.com/docs/', type: 'official' },
        ],
      },
      {
        id: 's3-3', text: 'Structured outputs + tool calling in a real app', done: false,
        resources: [
          { title: 'Anthropic prompt engineering guide', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview', type: 'official' },
        ],
      },
      {
        id: 's3-4', text: 'Handling hallucinations and designing fallbacks', done: false,
        resources: [],
      },
      {
        id: 's3-5', text: 'Build a document Q&A chatbot end-to-end', done: false,
        resources: [],
      },
    ],
  },
  {
    id: 'phase-4',
    name: 'Agentic systems + architecture',
    description: '',
    skills: [
      {
        id: 's4-1', text: 'LangGraph: multi-step agent pipelines', done: false,
        resources: [
          { title: 'LangGraph docs', url: 'https://langchain-ai.github.io/langgraph/', type: 'official' },
        ],
      },
      {
        id: 's4-2', text: 'Human-in-the-loop checkpoints', done: false,
        resources: [],
      },
      {
        id: 's4-3', text: 'Architecture Decision Records (ADR)', done: false,
        resources: [
          { title: 'System Design Interview book', url: 'https://www.amazon.com/System-Design-Interview-insiders-Second/dp/B08CMF2CQF', type: 'paid' },
        ],
      },
      {
        id: 's4-4', text: 'System design case studies: Stripe, Notion, Airbnb', done: false,
        resources: [
          { title: 'ByteByteGo YouTube', url: 'https://www.youtube.com/@ByteByteGo', type: 'free' },
        ],
      },
      {
        id: 's4-5', text: 'Complex automation scenario with Claude API', done: false,
        resources: [],
      },
    ],
  },
];

function loadPhases(): Phase[] {
  try {
    const data = JSON.parse(localStorage.getItem('jr_learning') ?? '');
    if (Array.isArray(data.phases) && data.phases.length > 0) return data.phases as Phase[];
  } catch { /* fall through */ }
  return DEFAULT_PHASES;
}

function savePhases(phases: Phase[]) {
  localStorage.setItem('jr_learning', JSON.stringify({ phases }));
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const AI_SYSTEM =
  `You are a learning path advisor for a recent CS/Maths graduate in New Zealand ` +
  `actively job hunting for entry-level IT roles.\n` +
  `Generate a focused, practical learning plan as JSON only:\n` +
  `{\n` +
  `  "suggestedPhase": "string (a concise, descriptive phase name, e.g. \\"Python & Data Science\\", \\"SQL & Databases\\", \\"DevOps Fundamentals\\", \\"React & Frontend\\" — not a reference to existing phases)",\n` +
  `  "skills": [\n` +
  `    {\n` +
  `      "text": "string (specific, actionable skill)",\n` +
  `      "resources": [\n` +
  `        { "title": "string", "url": "string", "type": "free" | "paid" | "official" }\n` +
  `      ]\n` +
  `    }\n` +
  `  ]\n` +
  `}\n` +
  `For each skill include 1-2 real, specific resources (YouTube channels, official docs, free courses). ` +
  `Prefer free resources. Only include URLs you are confident exist.`;

export default function LearningPath() {
  const [phases, setPhases] = useState<Phase[]>(loadPhases);
  const [expandedId, setExpandedId] = useState<string | null>(phases[0]?.id ?? null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [addSkillInputs, setAddSkillInputs] = useState<Record<string, string>>({});
  const [addingPhase, setAddingPhase] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState('');
  const [hoveredSkill, setHoveredSkill] = useState<{ phaseId: string; skillId: string } | null>(null);
  const [expandedSkills, setExpandedSkills] = useState<Record<string, boolean>>({});

  // AI planner
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ suggestedPhase: string; skills: AISkill[] } | null>(null);
  const [aiChecked, setAiChecked] = useState<boolean[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState<string | null>(null);

  const persist = (updated: Phase[]) => {
    setPhases(updated);
    savePhases(updated);
  };

  const totalSkills = phases.reduce((sum, p) => sum + p.skills.length, 0);
  const doneSkills  = phases.reduce((sum, p) => sum + p.skills.filter(s => s.done).length, 0);
  const pct = totalSkills > 0 ? Math.round((doneSkills / totalSkills) * 100) : 0;

  const toggleSkill = (phaseId: string, skillId: string) => {
    persist(phases.map(p => p.id !== phaseId ? p : {
      ...p, skills: p.skills.map(s => s.id !== skillId ? s : { ...s, done: !s.done }),
    }));
  };

  const deleteSkill = (phaseId: string, skillId: string) => {
    persist(phases.map(p => p.id !== phaseId ? p : {
      ...p, skills: p.skills.filter(s => s.id !== skillId),
    }));
  };

  const addSkill = (phaseId: string) => {
    const text = (addSkillInputs[phaseId] ?? '').trim();
    if (!text) return;
    persist(phases.map(p => p.id !== phaseId ? p : {
      ...p, skills: [...p.skills, { id: uid(), text, done: false, resources: [] }],
    }));
    setAddSkillInputs(prev => ({ ...prev, [phaseId]: '' }));
  };

  const deletePhase = (phaseId: string) => {
    persist(phases.filter(p => p.id !== phaseId));
    if (expandedId === phaseId) setExpandedId(null);
    setDeleteConfirmId(null);
  };

  const addPhase = () => {
    const name = newPhaseName.trim();
    if (!name) return;
    const newPhase: Phase = { id: uid(), name, description: '', skills: [] };
    persist([...phases, newPhase]);
    setNewPhaseName('');
    setAddingPhase(false);
    setExpandedId(newPhase.id);
  };

  const toggleExpandSkill = (phaseId: string, skillId: string) => {
    const key = `${phaseId}:${skillId}`;
    setExpandedSkills(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isSkillExpanded = (phaseId: string, skillId: string) =>
    !!expandedSkills[`${phaseId}:${skillId}`];

  const generatePlan = async () => {
    if (!aiInput.trim() || aiLoading) return;
    setAiLoading(true);
    setAiResult(null);
    setAiError(null);
    try {
      const text = await chatWithHistory([{ role: 'user', content: aiInput.trim() }], AI_SYSTEM);
      const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
      const parsed = JSON.parse(cleaned) as { suggestedPhase: string; skills: AISkill[] };
      setAiResult(parsed);
      setAiChecked(parsed.skills.map(() => true));
      setAiSuccess(null);
    } catch {
      setAiError('Failed to generate plan — try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const addAiSkills = () => {
    if (!aiResult) return;
    const selectedSkills = aiResult.skills.filter((_, i) => aiChecked[i]);
    if (selectedSkills.length === 0) return;
    const newSkills: Skill[] = selectedSkills.map(s => ({
      id: uid(), text: s.text, done: false, resources: s.resources ?? [],
    }));
    const newPhase: Phase = { id: uid(), name: aiResult.suggestedPhase, description: '', skills: newSkills };
    persist([...phases, newPhase]);
    setExpandedId(newPhase.id);
    const count = selectedSkills.length;
    setAiSuccess(`New phase '${newPhase.name}' added with ${count} skill${count !== 1 ? 's' : ''}`);
    setTimeout(() => setAiSuccess(null), 3000);
    setAiResult(null);
    setAiInput('');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Learning Path 🎯</div>
        <div className="page-sub">Track your skills and know what to focus on next</div>
      </div>

      {/* Overall progress */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>Overall progress</span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            {doneSkills} / {totalSkills} skills · {pct}% complete
          </span>
        </div>
        <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: 'var(--green)', borderRadius: 2,
            width: `${pct}%`, transition: 'width 0.35s ease',
          }} />
        </div>
      </div>

      {/* Phase cards */}
      {phases.map((phase, phaseIdx) => {
        const phaseDone  = phase.skills.filter(s => s.done).length;
        const phaseTotal = phase.skills.length;
        const isExpanded = expandedId === phase.id;
        const isConfirm  = deleteConfirmId === phase.id;

        return (
          <div key={phase.id} className="card" style={{ marginBottom: 10, padding: 0, overflow: 'visible' }}>
            {/* Header */}
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
              }}
              onClick={() => {
                setExpandedId(isExpanded ? null : phase.id);
                setDeleteConfirmId(null);
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'var(--surface2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: 'var(--muted)', flexShrink: 0,
              }}>
                {phaseIdx + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 5 }}>
                  {phase.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 100, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', background: 'var(--green)', borderRadius: 2,
                      width: phaseTotal ? `${(phaseDone / phaseTotal) * 100}%` : '0%',
                    }} />
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{phaseDone}/{phaseTotal}</span>
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0, userSelect: 'none' }}>
                {isExpanded ? '▲' : '▼'}
              </span>
            </div>

            {/* Expanded body */}
            {isExpanded && (
              <div style={{ padding: '8px 16px 14px' }}>
                {phase.skills.length === 0 && (
                  <div style={{ fontSize: 13, color: 'var(--muted)', padding: '8px 0' }}>
                    No skills yet — add some below.
                  </div>
                )}

                {phase.skills.map(skill => {
                  const hasResources = (skill.resources?.length ?? 0) > 0;
                  const skillOpen = isSkillExpanded(phase.id, skill.id);
                  return (
                    <div
                      key={skill.id}
                      onMouseEnter={() => setHoveredSkill({ phaseId: phase.id, skillId: skill.id })}
                      onMouseLeave={() => setHoveredSkill(null)}
                    >
                      {/* Skill row */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 0',
                        borderBottom: !skillOpen ? '1px solid var(--border)' : 'none',
                      }}>
                        <input
                          type="checkbox"
                          checked={skill.done}
                          onChange={() => toggleSkill(phase.id, skill.id)}
                          style={{ cursor: 'pointer', flexShrink: 0, accentColor: 'var(--green)', width: 15, height: 15 }}
                        />
                        <span
                          onClick={() => toggleSkill(phase.id, skill.id)}
                          style={{
                            flex: 1, fontSize: 13, lineHeight: 1.5, cursor: 'pointer',
                            color: skill.done ? 'var(--muted)' : 'var(--text)',
                            textDecoration: skill.done ? 'line-through' : 'none',
                          }}
                        >
                          {skill.text}
                        </span>
                        {hasResources && (
                          <button
                            onClick={() => toggleExpandSkill(phase.id, skill.id)}
                            style={{
                              background: 'transparent', border: 'none', cursor: 'pointer',
                              color: 'var(--muted)', fontSize: 11, padding: '0 4px', flexShrink: 0,
                              userSelect: 'none',
                            }}
                            title={skillOpen ? 'Hide resources' : 'Show resources'}
                          >
                            {skillOpen ? '▾' : '▸'}
                          </button>
                        )}
                        <div style={{ width: 22, flexShrink: 0 }}>
                          {hoveredSkill?.phaseId === phase.id && hoveredSkill?.skillId === skill.id && (
                            <button
                              className="todo-del"
                              onClick={() => deleteSkill(phase.id, skill.id)}
                              style={{ padding: '2px 4px' }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Resources */}
                      {skillOpen && hasResources && (
                        <div style={{
                          paddingLeft: 25, paddingBottom: 10, paddingTop: 6,
                          borderBottom: '1px solid var(--border)',
                          display: 'flex', flexWrap: 'wrap', gap: 6,
                        }}>
                          {skill.resources!.map((r, ri) => {
                            const badge = RESOURCE_BADGE[r.type] ?? RESOURCE_BADGE.free;
                            return (
                              <a
                                key={ri}
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'none' }}
                              >
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 5,
                                  fontSize: 11, padding: '3px 8px', borderRadius: 4,
                                  background: badge.bg, color: badge.color,
                                  cursor: 'pointer', whiteSpace: 'nowrap',
                                  transition: 'opacity 0.12s',
                                }}
                                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                                >
                                  <span style={{
                                    fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                                    letterSpacing: 0.4, opacity: 0.8,
                                  }}>
                                    {r.type}
                                  </span>
                                  {r.title}
                                </span>
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add skill */}
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <input
                    className="todo-input"
                    style={{ flex: 1, fontSize: 13 }}
                    placeholder="Add skill manually…"
                    value={addSkillInputs[phase.id] ?? ''}
                    onChange={e => setAddSkillInputs(prev => ({ ...prev, [phase.id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addSkill(phase.id)}
                  />
                  <button className="btn btn-sm" onClick={() => addSkill(phase.id)}>Add</button>
                </div>

                {/* Delete phase */}
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  {isConfirm ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>Delete this phase?</span>
                      <button
                        className="btn btn-sm"
                        style={{ background: 'var(--red)', color: '#fff', border: 'none' }}
                        onClick={e => { e.stopPropagation(); deletePhase(phase.id); }}
                      >
                        Delete
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={e => { e.stopPropagation(); setDeleteConfirmId(null); }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 11, color: 'var(--muted)' }}
                      onClick={e => { e.stopPropagation(); setDeleteConfirmId(phase.id); }}
                    >
                      Delete phase
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add phase */}
      <div style={{ marginBottom: 20 }}>
        {addingPhase ? (
          <div className="card" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              className="todo-input"
              style={{ flex: 1 }}
              placeholder="Phase name…"
              value={newPhaseName}
              onChange={e => setNewPhaseName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') addPhase();
                if (e.key === 'Escape') { setAddingPhase(false); setNewPhaseName(''); }
              }}
              autoFocus
            />
            <button className="btn btn-sm" onClick={addPhase}>Add phase</button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setAddingPhase(false); setNewPhaseName(''); }}>
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setAddingPhase(true)}
          >
            + Add new phase
          </button>
        )}
      </div>

      {/* AI skill planner */}
      <div className="card">
        <div className="card-title">✦ Add skills with AI</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="todo-input"
            style={{ flex: 1 }}
            placeholder="What do you want to learn? e.g. Python basics, SQL, Kubernetes..."
            value={aiInput}
            onChange={e => setAiInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generatePlan()}
            disabled={aiLoading}
          />
          <button
            className="btn btn-sm"
            onClick={generatePlan}
            disabled={aiLoading || !aiInput.trim()}
            style={{ flexShrink: 0 }}
          >
            {aiLoading ? 'Thinking…' : 'Generate plan'}
          </button>
        </div>

        {aiError && (
          <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 8 }}>{aiError}</div>
        )}

        {aiSuccess && !aiResult && (
          <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 8 }}>✓ {aiSuccess}</div>
        )}

        {aiResult && (
          <div style={{ marginTop: 14, padding: 14, background: 'var(--surface2)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
              Suggested phase: <strong style={{ color: 'var(--text)' }}>{aiResult.suggestedPhase}</strong>
            </div>

            {aiResult.skills.map((skill, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={aiChecked[i] ?? true}
                    onChange={() => setAiChecked(prev => prev.map((v, j) => j === i ? !v : v))}
                    style={{ marginTop: 2, flexShrink: 0, accentColor: 'var(--green)', width: 14, height: 14 }}
                  />
                  <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.45 }}>{skill.text}</span>
                </label>
                {skill.resources.length > 0 && (
                  <div style={{ paddingLeft: 22, marginTop: 5, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {skill.resources.map((r, ri) => {
                      const badge = RESOURCE_BADGE[r.type] ?? RESOURCE_BADGE.free;
                      return (
                        <a key={ri} href={r.url} target="_blank" rel="noopener noreferrer"
                          style={{ textDecoration: 'none' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            fontSize: 11, padding: '3px 8px', borderRadius: 4,
                            background: badge.bg, color: badge.color, whiteSpace: 'nowrap',
                          }}>
                            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, opacity: 0.8 }}>
                              {r.type}
                            </span>
                            {r.title}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button className="btn btn-sm" onClick={addAiSkills} disabled={!aiChecked.some(Boolean)}>
                Add selected
              </button>
              <button className="btn btn-ghost btn-sm" onClick={generatePlan} disabled={aiLoading}>
                Try again
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setAiResult(null)}>
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
