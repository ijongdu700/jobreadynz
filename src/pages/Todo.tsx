import { useState, useEffect, useRef } from 'react';

interface PlannerTask {
  id: number;
  time: string;
  text: string;
  color: string;
  done: boolean;
}

type Planner = Record<string, PlannerTask[]>;

const COLORS = [
  '#378ADD','#1D9E75','#BA7517','#D4537E','#7F77DD',
  '#D85A30','#639922','#E24B4A','#888780','#0F6E56',
  '#185FA5','#993556','#3B6D11','#854F0B','#533AB7',
];

function offsetToDate(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}

function dayLabel(offset: number) {
  if (offset === -1) return 'Yesterday';
  if (offset === 0) return 'Today';
  return 'Tomorrow';
}

function fullDateLabel(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString('en-NZ', { weekday: 'long', month: 'long', day: 'numeric' });
}

function loadPlanner(): Planner {
  try { return JSON.parse(localStorage.getItem('jr_planner') ?? '{}'); } catch { return {}; }
}

function savePlanner(p: Planner) {
  localStorage.setItem('jr_planner', JSON.stringify(p));
}

export default function Todo() {
  const [offset, setOffset] = useState(0);
  const [planner, setPlanner] = useState<Planner>(loadPlanner);
  const [hour, setHour] = useState('09');
  const [minute, setMinute] = useState('00');
  const [textInput, setTextInput] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editHour, setEditHour] = useState('09');
  const [editMinute, setEditMinute] = useState('00');
  const [editText, setEditText] = useState('');
  const [editColor, setEditColor] = useState(COLORS[0]);
  const [editPaletteOpen, setEditPaletteOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const paletteRef = useRef<HTMLDivElement>(null);
  const editPaletteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!paletteOpen) return;
    const handler = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        setPaletteOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [paletteOpen]);

  useEffect(() => {
    if (!editPaletteOpen) return;
    const handler = (e: MouseEvent) => {
      if (editPaletteRef.current && !editPaletteRef.current.contains(e.target as Node)) {
        setEditPaletteOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [editPaletteOpen]);

  const currentDate = offsetToDate(offset);
  const tasks: PlannerTask[] = [...(planner[currentDate] ?? [])].sort((a, b) =>
    a.time.localeCompare(b.time)
  );
  const done = tasks.filter(t => t.done).length;

  const persist = (updated: Planner) => {
    setPlanner(updated);
    savePlanner(updated);
  };

  const addTask = () => {
    if (!textInput.trim()) return;
    const task: PlannerTask = {
      id: Date.now(),
      time: `${hour}:${minute}`,
      text: textInput.trim(),
      color,
      done: false,
    };
    persist({ ...planner, [currentDate]: [...(planner[currentDate] ?? []), task] });
    setTextInput('');
  };

  const toggleDone = (id: number) => {
    persist({
      ...planner,
      [currentDate]: (planner[currentDate] ?? []).map(t => t.id === id ? { ...t, done: !t.done } : t),
    });
  };

  const deleteTask = (id: number) => {
    persist({
      ...planner,
      [currentDate]: (planner[currentDate] ?? []).filter(t => t.id !== id),
    });
  };

  const startEdit = (t: PlannerTask) => {
    const [h, m] = t.time !== '--:--' ? t.time.split(':') : ['09', '00'];
    setEditId(t.id);
    setEditHour(h);
    setEditMinute(m);
    setEditText(t.text);
    setEditColor(t.color);
    setEditPaletteOpen(false);
  };

  const saveEdit = (id: number) => {
    if (!editText.trim()) return;
    persist({
      ...planner,
      [currentDate]: (planner[currentDate] ?? []).map(t =>
        t.id === id ? { ...t, time: `${editHour}:${editMinute}`, text: editText.trim(), color: editColor } : t
      ),
    });
    setEditId(null);
  };

  const cancelEdit = () => setEditId(null);

  return (
    <div>
      {/* Header: day nav + progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setOffset(o => Math.max(-1, o - 1))}
            disabled={offset === -1}
            style={{ flexShrink: 0 }}
          >
            ←
          </button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div className="page-title" style={{ fontSize: 22 }}>{dayLabel(offset)}</div>
            <div className="page-sub" style={{ marginTop: 2 }}>{fullDateLabel(offset)}</div>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setOffset(o => Math.min(1, o + 1))}
            disabled={offset === 1}
            style={{ flexShrink: 0 }}
          >
            →
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2, background: 'var(--green)',
              width: tasks.length ? `${(done / tasks.length) * 100}%` : '0%',
              transition: 'width 0.35s ease',
            }} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
            {done} / {tasks.length} done
          </span>
        </div>
      </div>

      {/* Add task row */}
      <div className="card" style={{ padding: '10px 14px', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
            <select
              value={hour}
              onChange={e => setHour(e.target.value)}
              style={{ width: 52, padding: '8px 4px', fontSize: 12, textAlign: 'center' }}
            >
              {Array.from({ length: 17 }, (_, i) => String(i + 6).padStart(2, '0')).map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <span style={{ color: 'var(--muted)', fontSize: 13, userSelect: 'none' }}>:</span>
            <select
              value={minute}
              onChange={e => setMinute(e.target.value)}
              style={{ width: 46, padding: '8px 4px', fontSize: 12, textAlign: 'center' }}
            >
              <option value="00">00</option>
              <option value="30">30</option>
            </select>
          </div>
          <input
            className="todo-input"
            style={{ flex: 1 }}
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            placeholder="Add a task…"
          />

          {/* Colour picker */}
          <div ref={paletteRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setPaletteOpen(o => !o)}
              style={{
                width: 26, height: 26, borderRadius: '50%',
                background: color, border: '2px solid var(--border)',
                cursor: 'pointer', display: 'block',
              }}
            />
            {paletteOpen && (
              <div style={{
                position: 'absolute', top: 32, right: 0,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 10, padding: 10,
                display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 7,
                zIndex: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
              }}>
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => { setColor(c); setPaletteOpen(false); }}
                    style={{
                      width: 22, height: 22, borderRadius: '50%', background: c,
                      border: color === c ? '2px solid var(--text)' : '2px solid transparent',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <button className="btn btn-sm" onClick={addTask} style={{ flexShrink: 0 }}>Add</button>
        </div>
      </div>

      {/* Notebook task list */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {tasks.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: 13, padding: '18px 20px' }}>
            No tasks for {dayLabel(offset).toLowerCase()} yet.
          </div>
        ) : tasks.map((t, i) => (
          <div
            key={t.id}
            onMouseEnter={() => setHoveredId(t.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              display: 'flex', alignItems: 'center',
              minHeight: 44, padding: '0 16px',
              borderBottom: i < tasks.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            {editId === t.id ? (
              /* ── Edit mode ── */
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                  <select value={editHour} onChange={e => setEditHour(e.target.value)}
                    style={{ width: 52, padding: '8px 4px', fontSize: 12, textAlign: 'center' }}>
                    {Array.from({ length: 17 }, (_, i) => String(i + 6).padStart(2, '0')).map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <span style={{ color: 'var(--muted)', fontSize: 13, userSelect: 'none' }}>:</span>
                  <select value={editMinute} onChange={e => setEditMinute(e.target.value)}
                    style={{ width: 46, padding: '8px 4px', fontSize: 12, textAlign: 'center' }}>
                    <option value="00">00</option>
                    <option value="30">30</option>
                  </select>
                </div>
                <input
                  className="todo-input"
                  style={{ flex: 1, marginLeft: 8 }}
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(t.id); if (e.key === 'Escape') cancelEdit(); }}
                  autoFocus
                />
                <div ref={editPaletteRef} style={{ position: 'relative', flexShrink: 0, marginLeft: 8 }}>
                  <button
                    onClick={() => setEditPaletteOpen(o => !o)}
                    style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: editColor, border: '2px solid var(--border)',
                      cursor: 'pointer', display: 'block',
                    }}
                  />
                  {editPaletteOpen && (
                    <div style={{
                      position: 'absolute', top: 32, right: 0,
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: 10,
                      display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 7,
                      zIndex: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
                    }}>
                      {COLORS.map(c => (
                        <button key={c} onClick={() => { setEditColor(c); setEditPaletteOpen(false); }}
                          style={{
                            width: 22, height: 22, borderRadius: '50%', background: c,
                            border: editColor === c ? '2px solid var(--text)' : '2px solid transparent',
                            cursor: 'pointer',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <button className="btn btn-sm" onClick={() => saveEdit(t.id)} style={{ marginLeft: 8, flexShrink: 0 }}>Save</button>
                <button className="btn btn-ghost btn-sm" onClick={cancelEdit} style={{ marginLeft: 4, flexShrink: 0 }}>Cancel</button>
              </>
            ) : (
              /* ── Normal view ── */
              <>
                {/* Time column */}
                <div style={{
                  width: 56, flexShrink: 0,
                  fontSize: 12, color: 'var(--muted)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {t.time !== '--:--' ? t.time : ''}
                </div>

                {/* Bullet + text */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                  <span style={{
                    fontSize: 14, lineHeight: 1.5,
                    color: t.done ? 'var(--muted)' : 'var(--text)',
                    textDecoration: t.done ? 'line-through' : 'none',
                  }}>
                    {t.text}
                  </span>
                </div>

                {/* Actions column */}
                <div style={{
                  width: 72, flexShrink: 0,
                  display: 'flex', gap: 4,
                  justifyContent: 'flex-end', alignItems: 'center',
                }}>
                  <button
                    onClick={() => toggleDone(t.id)}
                    style={{
                      width: 22, height: 22, borderRadius: '50%',
                      border: `1.5px solid ${t.done ? 'var(--green)' : 'var(--border)'}`,
                      background: t.done ? 'var(--green)' : 'transparent',
                      cursor: 'pointer', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700,
                      color: t.done ? '#0f1117' : 'transparent',
                    }}
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => startEdit(t)}
                    title="Edit"
                    style={{
                      width: 22, height: 22, borderRadius: 4,
                      border: '1.5px solid var(--border)',
                      background: 'transparent',
                      cursor: 'pointer', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: 'var(--text)',
                    }}
                  >
                    ✏
                  </button>
                  <button className="todo-del" onClick={() => deleteTask(t.id)} style={{ padding: '2px 4px' }}>
                    ×
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
