import { useRef, useState } from 'react';
import type { PageId } from '../App';

const NAV: { id: PageId; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard',      icon: '⬡' },
  { id: 'jobs',      label: 'Job Finder',     icon: '🔍' },
  { id: 'todo',      label: 'Daily Plan',     icon: '✓' },
  { id: 'diary',     label: 'Diary',          icon: '📖' },
  { id: 'ai',        label: 'AI Tools',       icon: '✦' },
  { id: 'interview', label: 'Interview Prep', icon: '🎤' },
  { id: 'wellness',  label: 'Wellness',       icon: '☀' },
  { id: 'learning',  label: 'Learning Path',  icon: '🎯' },
  { id: 'tracker',   label: 'App Tracker',   icon: '📨' },
];

const BACKUP_KEYS = [
  'jr_planner',
  'jr_diaries',
  'jr_applications',
  'jr_learning',
  'jr_stresses_destroyed',
  'jr_music_link',
];

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingData, setPendingData] = useState<Record<string, string> | null>(null);

  function handleExport() {
    const data: Record<string, string | null> = {};
    for (const key of BACKUP_KEYS) {
      data[key] = localStorage.getItem(key);
    }
    const blob = new Blob(
      [JSON.stringify({ exportedAt: new Date().toISOString(), data }, null, 2)],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `jobreadynz-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (!parsed || typeof parsed !== 'object' || !parsed.data || typeof parsed.data !== 'object') {
          alert('Invalid backup file.');
          return;
        }
        setPendingData(parsed.data);
      } catch {
        alert('Could not read file. Make sure it is a valid JSON backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function confirmImport() {
    if (!pendingData) return;
    for (const key of BACKUP_KEYS) {
      const val = pendingData[key];
      if (val === null || val === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, val);
      }
    }
    setPendingData(null);
    window.location.reload();
  }

  return (
    <div className="sidebar">
      <div className="logo">
        <div className="logo-title">JobReady NZ</div>
        <div className="logo-sub">취업 준비 대시보드</div>
      </div>
      {NAV.map(n => (
        <button
          key={n.id}
          className={`nav-item ${currentPage === n.id ? 'active' : ''}`}
          onClick={() => onNavigate(n.id)}
        >
          <span className="nav-icon">{n.icon}</span>
          {n.label}
        </button>
      ))}

      <hr style={{ margin: '12px 8px 8px', borderColor: 'rgba(255,255,255,0.12)', borderTop: 'none' }} />

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <button className="btn-ghost btn-sm nav-item" style={{ fontSize: '0.75rem', opacity: 0.7 }} onClick={handleExport}>
        ↓ Export data
      </button>

      <button className="btn-ghost btn-sm nav-item" style={{ fontSize: '0.75rem', opacity: 0.7 }} onClick={() => fileInputRef.current?.click()}>
        ↑ Import data
      </button>

      {pendingData && (
        <div style={{ padding: '6px 12px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>
          <div style={{ marginBottom: 6 }}>Replace all current data?</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-ghost btn-sm" style={{ fontSize: '0.7rem', padding: '2px 8px' }} onClick={confirmImport}>Yes</button>
            <button className="btn-ghost btn-sm" style={{ fontSize: '0.7rem', padding: '2px 8px' }} onClick={() => setPendingData(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
