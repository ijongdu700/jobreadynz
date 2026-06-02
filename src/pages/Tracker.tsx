import { useState, useEffect } from 'react';

type Status = 'applied' | 'review' | 'interview' | 'offer' | 'rejected' | 'withdrawn';

interface Application {
  id: number;
  company: string;
  role: string;
  date: string;
  status: Status;
  note: string;
  jd: string;
  url: string;
}

const STATUS_STYLE: Record<Status, { bg: string; color: string; label: string }> = {
  applied:   { bg: 'rgba(63,131,248,0.18)',   color: '#60a5fa', label: 'Applied' },
  review:    { bg: 'rgba(245,158,11,0.18)',   color: '#fbbf24', label: 'Review' },
  interview: { bg: 'rgba(124,77,255,0.18)',   color: '#b39dff', label: 'Interview' },
  offer:     { bg: 'rgba(29,158,117,0.18)',   color: '#4dd4a0', label: 'Offer' },
  rejected:  { bg: 'rgba(120,120,120,0.18)',  color: '#9ca3af', label: 'Rejected' },
  withdrawn: { bg: 'rgba(120,120,120,0.18)',  color: '#9ca3af', label: 'Withdrawn' },
};

const FILTER_TABS: { key: Status | 'all'; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'applied',   label: 'Applied' },
  { key: 'interview', label: 'Interview' },
  { key: 'offer',     label: 'Offer' },
  { key: 'rejected',  label: 'Rejected' },
];

const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Pacific/Auckland' });

const EMPTY_FORM = {
  company: '',
  role: '',
  date: today(),
  status: 'applied' as Status,
  url: '',
  note: '',
  jd: '',
};

function load(): Application[] {
  try { return JSON.parse(localStorage.getItem('jr_applications') ?? '[]'); } catch { return []; }
}
function save(apps: Application[]) {
  localStorage.setItem('jr_applications', JSON.stringify(apps));
}

export default function Tracker() {
  const [apps, setApps] = useState<Application[]>(load);
  const [filter, setFilter] = useState<Status | 'all'>('all');

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formJdOpen, setFormJdOpen] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM });
  const [editJdOpen, setEditJdOpen] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [expandedJd, setExpandedJd] = useState<Record<number, boolean>>({});

  useEffect(() => { save(apps); }, [apps]);

  const addApp = () => {
    if (!form.company.trim() || !form.role.trim()) return;
    setApps(prev => [
      { ...form, id: Date.now(), company: form.company.trim(), role: form.role.trim() },
      ...prev,
    ]);
    setForm({ ...EMPTY_FORM, date: today() });
    setFormJdOpen(false);
  };

  const startEdit = (a: Application) => {
    setEditId(a.id);
    setEditForm({ company: a.company, role: a.role, date: a.date, status: a.status, url: a.url, note: a.note, jd: a.jd });
    setEditJdOpen(!!a.jd);
    setDeleteConfirmId(null);
  };

  const saveEdit = (id: number) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, ...editForm, company: editForm.company.trim(), role: editForm.role.trim() } : a));
    setEditId(null);
  };

  const cancelEdit = () => setEditId(null);

  const deleteApp = (id: number) => {
    setApps(prev => prev.filter(a => a.id !== id));
    setDeleteConfirmId(null);
  };

  const sorted = [...apps].sort((a, b) => b.date.localeCompare(a.date));
  const filtered = filter === 'all' ? sorted : sorted.filter(a => a.status === filter);

  const total = apps.length;
  const active = apps.filter(a => ['applied', 'review', 'interview'].includes(a.status)).length;
  const interviews = apps.filter(a => ['interview', 'offer'].includes(a.status)).length;
  const offers = apps.filter(a => a.status === 'offer').length;
  const interviewRate = total > 0 ? Math.round((interviews / total) * 100) : 0;

  const tabCount = (key: Status | 'all') => key === 'all' ? apps.length : apps.filter(a => a.status === key).length;

  const formField = (key: keyof typeof EMPTY_FORM, val: string) =>
    setForm(f => ({ ...f, [key]: val }));
  const editField = (key: keyof typeof EMPTY_FORM, val: string) =>
    setEditForm(f => ({ ...f, [key]: val }));

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Application Tracker</div>
          <div className="page-sub">Track every application from send to signed offer</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        {[
          { label: 'Total Applied', value: total },
          { label: 'Interview Rate', value: `${interviewRate}%` },
          { label: 'Active', value: active },
          { label: 'Offers', value: offers },
        ].map(s => (
          <div key={s.label} className="card" style={{ marginBottom: 0, textAlign: 'center' }}>
            <div className="stat-num">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add form */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}>Add Application</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <input
            className="todo-input"
            placeholder="Company *"
            value={form.company}
            onChange={e => formField('company', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addApp()}
          />
          <input
            className="todo-input"
            placeholder="Role *"
            value={form.role}
            onChange={e => formField('role', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addApp()}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 160px 1fr', gap: 10, marginBottom: 10 }}>
          <input
            type="date"
            className="todo-input"
            style={{ colorScheme: 'light' }}
            value={form.date}
            onChange={e => formField('date', e.target.value)}
          />
          <select
            className="todo-input"
            value={form.status}
            onChange={e => formField('status', e.target.value as Status)}
            style={{ cursor: 'pointer' }}
          >
            {(Object.keys(STATUS_STYLE) as Status[]).map(s => (
              <option key={s} value={s}>{STATUS_STYLE[s].label}</option>
            ))}
          </select>
          <input
            className="todo-input"
            placeholder="URL (optional)"
            value={form.url}
            onChange={e => formField('url', e.target.value)}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <input
            className="todo-input"
            style={{ width: '100%', boxSizing: 'border-box' }}
            placeholder="Note (optional)"
            value={form.note}
            onChange={e => formField('note', e.target.value)}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <button
            className="btn-ghost btn-sm"
            onClick={() => setFormJdOpen(o => !o)}
            style={{ fontSize: 13, padding: '4px 0' }}
          >
            {formJdOpen ? 'Hide job description ▾' : 'Add job description ▸'}
          </button>
          {formJdOpen && (
            <textarea
              className="todo-input"
              style={{ width: '100%', boxSizing: 'border-box', minHeight: 100, marginTop: 8, resize: 'vertical', fontFamily: 'inherit', fontSize: 13 }}
              placeholder="Paste job description here..."
              value={form.jd}
              onChange={e => formField('jd', e.target.value)}
            />
          )}
        </div>
        <button className="btn btn-sm" onClick={addApp}>Add Application</button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {FILTER_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            style={{
              padding: '5px 14px',
              borderRadius: 20,
              border: '1px solid var(--border)',
              background: filter === t.key ? 'var(--accent)' : 'var(--surface)',
              color: filter === t.key ? '#fff' : 'var(--muted)',
              cursor: 'pointer',
              fontSize: 13,
              transition: 'all 0.15s',
            }}
          >
            {t.label} <span style={{ opacity: 0.7 }}>({tabCount(t.key)})</span>
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 22px' }}>
          {apps.length === 0 ? 'No applications yet — add your first one above' : 'No applications match this filter'}
        </div>
      ) : (
        filtered.map(a => {
          const st = STATUS_STYLE[a.status];
          const isEditing = editId === a.id;
          const isDeleteConfirm = deleteConfirmId === a.id;
          const jdExpanded = expandedJd[a.id];

          if (isEditing) {
            return (
              <div key={a.id} className="card" style={{ marginBottom: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <input className="todo-input" placeholder="Company *" value={editForm.company} onChange={e => editField('company', e.target.value)} />
                  <input className="todo-input" placeholder="Role *" value={editForm.role} onChange={e => editField('role', e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '160px 160px 1fr', gap: 10, marginBottom: 10 }}>
                  <input type="date" className="todo-input" style={{ colorScheme: 'light' }} value={editForm.date} onChange={e => editField('date', e.target.value)} />
                  <select className="todo-input" value={editForm.status} onChange={e => editField('status', e.target.value as Status)} style={{ cursor: 'pointer' }}>
                    {(Object.keys(STATUS_STYLE) as Status[]).map(s => (
                      <option key={s} value={s}>{STATUS_STYLE[s].label}</option>
                    ))}
                  </select>
                  <input className="todo-input" placeholder="URL (optional)" value={editForm.url} onChange={e => editField('url', e.target.value)} />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <input className="todo-input" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="Note (optional)" value={editForm.note} onChange={e => editField('note', e.target.value)} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <button className="btn-ghost btn-sm" onClick={() => setEditJdOpen(o => !o)} style={{ fontSize: 13, padding: '4px 0' }}>
                    {editJdOpen ? 'Hide job description ▾' : 'Add job description ▸'}
                  </button>
                  {editJdOpen && (
                    <textarea
                      className="todo-input"
                      style={{ width: '100%', boxSizing: 'border-box', minHeight: 100, marginTop: 8, resize: 'vertical', fontFamily: 'inherit', fontSize: 13 }}
                      value={editForm.jd}
                      onChange={e => editField('jd', e.target.value)}
                    />
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-sm" onClick={() => saveEdit(a.id)}>Save</button>
                  <button className="btn-ghost btn-sm" onClick={cancelEdit} style={{ border: '1px solid var(--border)', padding: '5px 14px', borderRadius: 8 }}>Cancel</button>
                </div>
              </div>
            );
          }

          return (
            <div key={a.id} className="card" style={{ marginBottom: 10, padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {/* Status badge */}
                <span style={{
                  background: st.bg,
                  color: st.color,
                  borderRadius: 20,
                  padding: '3px 10px',
                  fontSize: 12,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  {st.label}
                </span>

                {/* Company */}
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                  {a.url ? (
                    <a href={a.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                      {a.company}
                    </a>
                  ) : a.company}
                </span>

                {/* Role */}
                <span style={{ color: 'var(--muted)', fontSize: 14 }}>{a.role}</span>

                {/* Date */}
                <span style={{ color: 'var(--muted)', fontSize: 13, marginLeft: 'auto' }}>{a.date}</span>

                {/* Note */}
                {a.note && (
                  <span style={{ color: 'var(--muted)', fontSize: 13, fontStyle: 'italic', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.note}
                  </span>
                )}

                {/* JD chip */}
                {a.jd && (
                  <button
                    onClick={() => setExpandedJd(prev => ({ ...prev, [a.id]: !prev[a.id] }))}
                    style={{
                      background: 'var(--surface2)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: '2px 9px',
                      fontSize: 12,
                      color: 'var(--muted)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    JD {jdExpanded ? '▾' : '▸'}
                  </button>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => startEdit(a)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: 15, padding: '2px 6px', borderRadius: 6, opacity: 0.7 }}
                    title="Edit"
                  >✏</button>
                  <button
                    onClick={() => setDeleteConfirmId(isDeleteConfirm ? null : a.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', fontSize: 15, padding: '2px 6px', borderRadius: 6, opacity: 0.7 }}
                    title="Delete"
                  >×</button>
                </div>
              </div>

              {/* Delete confirmation */}
              {isDeleteConfirm && (
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--muted)', flex: 1 }}>Delete this application?</span>
                  <button
                    className="btn btn-sm"
                    style={{ background: 'var(--red)', border: 'none', padding: '4px 14px' }}
                    onClick={() => deleteApp(a.id)}
                  >Yes, delete</button>
                  <button
                    className="btn-ghost btn-sm"
                    style={{ border: '1px solid var(--border)', padding: '4px 14px', borderRadius: 6 }}
                    onClick={() => setDeleteConfirmId(null)}
                  >Cancel</button>
                </div>
              )}

              {/* JD expanded */}
              {jdExpanded && a.jd && (
                <textarea
                  readOnly
                  value={a.jd}
                  style={{
                    marginTop: 12,
                    width: '100%',
                    boxSizing: 'border-box',
                    minHeight: 120,
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    color: 'var(--muted)',
                    fontSize: 13,
                    padding: '10px 12px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
