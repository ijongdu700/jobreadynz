import { useState } from 'react';
import type { DiaryEntry } from '../App';

interface DiaryProps {
  diaries: DiaryEntry[];
  setDiaries: (diaries: DiaryEntry[]) => void;
}

function formatTime(time: string): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return time;
  const suffix = h < 12 ? 'am' : 'pm';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')}${suffix}`;
}

function dateHeader(date: string): string {
  return new Date(date + 'T12:00:00').toLocaleDateString('en-NZ', {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: 'Pacific/Auckland',
  });
}

function shortDate(date: string): string {
  return new Date(date + 'T12:00:00').toLocaleDateString('en-NZ', {
    month: 'short', day: 'numeric', timeZone: 'Pacific/Auckland',
  });
}

export default function Diary({ diaries, setDiaries }: DiaryProps) {
  const [text, setText] = useState('');
  const [mood, setMood] = useState('');
  const [viewing, setViewing] = useState<DiaryEntry | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Pacific/Auckland' });

  const save = () => {
    if (!text.trim()) return;
    const time = new Date().toLocaleTimeString('en-NZ', {
      hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Pacific/Auckland',
    });
    const entry: DiaryEntry = { id: Date.now(), date: today, time, text: text.trim(), mood };
    const updated = [entry, ...diaries].sort(
      (a, b) => (b.date + (b.time ?? '')).localeCompare(a.date + (a.time ?? ''))
    );
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

  // Build date groups preserving newest-first date order from sorted diaries array
  const dateGroups: string[] = [];
  const grouped: Record<string, DiaryEntry[]> = {};
  for (const d of diaries) {
    if (!grouped[d.date]) {
      grouped[d.date] = [];
      dateGroups.push(d.date);
    }
    grouped[d.date].push(d);
  }
  // Within each date group, show earliest time first
  for (const date of dateGroups) {
    grouped[date].sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''));
  }

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
            {dateHeader(viewing.date)}{viewing.time ? ` · ${formatTime(viewing.time)}` : ''}{viewing.mood ? ` ${viewing.mood}` : ''}
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
        <div className="card-title">New entry · {today}</div>
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
        <div className="card-title">Past entries · {diaries.length} entries</div>
        {diaries.length === 0 && (
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>No entries yet. Write your first one above!</div>
        )}
        {dateGroups.map(date => (
          <div key={date}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: 'var(--muted)',
              textTransform: 'uppercase', letterSpacing: 0.6,
              padding: '14px 0 6px',
              borderBottom: '1px solid var(--border)',
            }}>
              {dateHeader(date)}
            </div>
            {grouped[date].map(d => {
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
                    <div className="diary-date">
                      {shortDate(d.date)}{d.time ? ` · ${formatTime(d.time)}` : ''}{d.mood ? ` ${d.mood}` : ''}
                    </div>
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
        ))}
      </div>
    </div>
  );
}
