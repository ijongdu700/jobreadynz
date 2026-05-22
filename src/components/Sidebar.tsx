import type { PageId } from '../App';

const NAV: { id: PageId; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard',      icon: '⬡' },
  { id: 'jobs',      label: 'Job Finder',     icon: '🔍' },
  { id: 'todo',      label: 'Daily Plan',     icon: '✓' },
  { id: 'diary',     label: 'Diary',          icon: '📖' },
  { id: 'ai',        label: 'AI Tools',       icon: '✦' },
  { id: 'interview', label: 'Interview Prep', icon: '🎤' },
  { id: 'wellness',  label: 'Wellness',       icon: '☀' },
];

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
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
    </div>
  );
}
