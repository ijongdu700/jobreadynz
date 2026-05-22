import { useState } from 'react';
import type { DiaryEntry } from '../App';

interface DiaryProps {
  diaries: DiaryEntry[];
  setDiaries: (diaries: DiaryEntry[]) => void;
}

export default function Diary({ diaries, setDiaries }: DiaryProps) {
  const [text, setText] = useState('');
  const [mood, setMood] = useState('');
  const [viewing, setViewing] = useState<DiaryEntry | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const today = new Date().toISOString().split('T')[0];

  const save = () => {
    if (!text.trim()) return;
    const entry: DiaryEntry = { id: Date.now(), date: today, text: text.trim(), mood };
    const updated = [entry, ...diaries.filter(d => d.date !== today)];
    setDiaries(updated);
    localStorage.setItem('jr_diaries', JSON.stringify(updated));
    setText('');
    setMood('');
  };

  const deleteEntry = (id: number) => {
    const updated = diaries.filter(d => d.id !== id);
    setDiaries(updated);
    localStorage.setItem('jr_diaries', JSON.stringify(updated));
  };

  const todayEntry = diaries.find(d => d.date === today);

  if (viewing) {
    return (
      <div>
        <div className="page-header">
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }} onClick={() => setViewing(null)}>
            ← Back
          </button>
          <div className="page-title">Diary</div>
        </div>
        <div className="card">
          <div className="diary-date" style={{ fontSize: 13, marginBottom: 14 }}>
            {viewing.date} {viewing.mood}
          </div>
          <div style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
            {viewing.text}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Diary</div>
        <div className="page-sub">Write freely. This space is just for you.</div>
      </div>

      <div className="card">
        <div className="card-title">Today's entry · {today}</div>
        {todayEntry && (
          <div style={{ fontSize: 12, color: 'var(--green)', marginBottom: 10 }}>
            ✓ Entry saved — you can update it below
          </div>
        )}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>How are you feeling?</div>
          <div className="mood-row">
            {['😴', '😔', '😐', '🙂', '😄'].map(m => (
              <button
                key={m}
                className={`mood-btn ${mood === m ? 'sel' : ''}`}
                onClick={() => setMood(mood === m ? '' : m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <textarea
          className="diary-textarea"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="오늘 어땠어? 어떤 것을 시도했고, 무엇이 잘 됐고, 뭐가 힘들었어? 여기는 솔직해도 괜찮아."
        />
        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
          <button className="btn" onClick={save}>Save entry</button>
          {text && <button className="btn btn-ghost" onClick={() => setText('')}>Clear</button>}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Past entries · {diaries.length} days</div>
        {diaries.length === 0 && (
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>No entries yet. Write your first one above!</div>
        )}
        {diaries.map(d => {
          const confirming = confirmDeleteId === d.id;
          return (
            <div
              key={d.id}
              className="diary-entry"
              style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: confirming ? 'default' : 'pointer' }}
              onMouseEnter={() => setHoveredId(d.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div style={{ flex: 1 }} onClick={() => !confirming && setViewing(d)}>
                <div className="diary-date">{d.date} {d.mood}</div>
                <div className="diary-preview">
                  {d.text.slice(0, 120)}{d.text.length > 120 ? '…' : ''}
                </div>
              </div>
              {confirming ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, paddingTop: 2 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>Delete this entry?</span>
                  <button
                    className="btn btn-sm"
                    style={{ background: 'var(--red)', color: '#0f1117', fontSize: 11 }}
                    onClick={() => { deleteEntry(d.id); setConfirmDeleteId(null); }}
                  >
                    Yes, delete
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : hoveredId === d.id ? (
                <button
                  className="todo-del"
                  style={{ alignSelf: 'center', fontSize: 18, padding: '0 6px', flexShrink: 0 }}
                  onClick={e => { e.stopPropagation(); setConfirmDeleteId(d.id); }}
                >
                  ×
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
