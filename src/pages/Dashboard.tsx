import { useState, useEffect } from 'react';
import type { DiaryEntry } from '../App';

interface PlannerTask {
  id: number;
  time: string;
  text: string;
  color: string;
  done: boolean;
}

function getTodayTasks(): PlannerTask[] {
  const today = new Date().toISOString().split('T')[0];
  try {
    const data = JSON.parse(localStorage.getItem('jr_planner') ?? '{}') as Record<string, PlannerTask[]>;
    return [...(data[today] ?? [])].sort((a, b) => a.time.localeCompare(b.time));
  } catch {
    return [];
  }
}

const QUOTES = [
  { text: "Every expert was once a beginner. You're building skills every single day.", src: 'Keep going' },
  { text: 'New Zealand is waiting for someone exactly like you. Keep applying.', src: 'Believe it' },
  { text: "The job search is hard. But you doing it means you're already ahead.", src: "You're doing great" },
  { text: 'Rejection is redirection. Your opportunity is closer than it feels.', src: 'Stay strong' },
  { text: 'A PSWV in NZ is a head start — embrace it.', src: 'You have an edge' },
  { text: "One application a day keeps unemployment away. You've got this.", src: 'Momentum' },
];

interface NewsArticle {
  title: string;
  summary: string;
  url: string;
  source: string;
  category: 'AI & Tech' | 'NZ Jobs';
}

interface NewsData {
  lastUpdated: string | null;
  articles: NewsArticle[];
}

const CATEGORY_STYLE: Record<string, { bg: string; color: string }> = {
  'AI & Tech': { bg: 'rgba(124,77,255,0.18)', color: '#b39dff' },
  'NZ Jobs':   { bg: 'rgba(29,158,117,0.18)', color: '#4dd4a0' },
};

function formatLastScan(iso: string): string {
  const scanned = new Date(iso);
  const now = new Date();
  const todayStr = now.toDateString();
  const yesterdayStr = new Date(now.getTime() - 86400000).toDateString();
  const time = scanned.toLocaleTimeString('en-NZ', { hour: 'numeric', minute: '2-digit', hour12: true });
  if (scanned.toDateString() === todayStr) return `Today ${time}`;
  if (scanned.toDateString() === yesterdayStr) return `Yesterday ${time}`;
  const date = scanned.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' });
  return `${date}, ${time}`;
}

interface DashboardProps {
  diaries: DiaryEntry[];
  onNavigate: (page: import('../App').PageId) => void;
}

export default function Dashboard({ diaries, onNavigate }: DashboardProps) {
  const today = new Date().toLocaleDateString('en-NZ', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const [qIdx, setQIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [newsData, setNewsData] = useState<NewsData>({ lastUpdated: null, articles: [] });
  const [newsRefreshing, setNewsRefreshing] = useState(false);

  useEffect(() => {
    fetch('/api/jobs')
      .then(r => r.ok ? r.json() as Promise<{ lastUpdated: string | null }> : Promise.reject())
      .then(d => { if (d.lastUpdated) setLastScan(d.lastUpdated); })
      .catch(() => {});
    fetch('/api/news')
      .then(r => r.ok ? r.json() as Promise<NewsData> : Promise.reject())
      .then(setNewsData)
      .catch(() => {});
  }, []);

  const handleNewsRefresh = async () => {
    setNewsRefreshing(true);
    try {
      const res = await fetch('/api/news/refresh', { method: 'POST' });
      if (res.ok) setNewsData(await res.json() as NewsData);
    } catch { /* ignore */ }
    finally { setNewsRefreshing(false); }
  };

  const todayTasks = getTodayTasks();
  const done = todayTasks.filter(t => t.done).length;
  const total = todayTasks.length;

  return (
    <div>
      <div className="date-chip">📅 {today} · NZT</div>
      <div className="page-header">
        <div className="page-title">Good day 👋</div>
        <div className="page-sub">Your JobReady dashboard — let's make today count.</div>
      </div>

      <div className="quote-card">
        <div className="quote-text">"{QUOTES[qIdx].text}"</div>
        <div className="quote-src">— {QUOTES[qIdx].src}</div>
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginTop: 12, fontSize: 11 }}
          onClick={() => setQIdx((qIdx + 1) % QUOTES.length)}
        >
          New quote →
        </button>
      </div>

      <div className="grid-3">
        <div className="card" onClick={() => onNavigate('todo')}
          style={{ cursor: 'pointer', transition: 'background 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
          onMouseLeave={e => (e.currentTarget.style.background = '')}>
          <div className="stat-label">Tasks today</div>
          <div className="stat-num">{done}/{total}</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: total ? `${(done / total) * 100}%` : '0%' }} />
          </div>
        </div>
        <div className="card" onClick={() => onNavigate('diary')}
          style={{ cursor: 'pointer', transition: 'background 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
          onMouseLeave={e => (e.currentTarget.style.background = '')}>
          <div className="stat-label">Diary entries</div>
          <div className="stat-num">{diaries.length}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>days recorded</div>
        </div>
        <div className="card" onClick={() => onNavigate('jobs')}
          style={{ cursor: 'pointer', transition: 'background 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
          onMouseLeave={e => (e.currentTarget.style.background = '')}>
          <div className="stat-label">Last job scan</div>
          <div className="stat-num" style={{ fontSize: lastScan ? 15 : 13 }}>
            {lastScan ? formatLastScan(lastScan) : 'Never'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
            {lastScan ? 'last refresh' : 'hit Refresh!'}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Today's priority tasks</div>
        {todayTasks.length === 0 && (
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>No tasks yet — head to Daily Plan to add some.</div>
        )}
        {todayTasks.slice(0, 4).map(t => (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 0',
            borderBottom: '1px solid var(--border)',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
            <span style={{
              flex: 1, fontSize: 14,
              color: t.done ? 'var(--muted)' : 'var(--text)',
              textDecoration: t.done ? 'line-through' : 'none',
            }}>
              {t.text}
            </span>
            {t.time !== '--:--' && (
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{t.time}</span>
            )}
          </div>
        ))}
      </div>
      <div className="card" style={{ marginTop: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div className="card-title" style={{ marginBottom: 0 }}>📰 Today's News</div>
            {newsData.lastUpdated && (
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                {formatLastScan(newsData.lastUpdated)}
              </div>
            )}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleNewsRefresh}
            disabled={newsRefreshing}
            style={{ flexShrink: 0, fontSize: 11 }}
          >
            {newsRefreshing ? 'Fetching…' : 'Refresh news'}
          </button>
        </div>

        {newsRefreshing && (
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
            Fetching latest news…
          </div>
        )}

        {newsData.articles.length === 0 && !newsRefreshing ? (
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            No news yet — click <strong>Refresh news</strong> to load.
          </div>
        ) : newsData.articles.map((a, i) => {
          const cat = CATEGORY_STYLE[a.category] ?? { bg: 'var(--surface2)', color: 'var(--muted)' };
          return (
            <a
              key={i}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div
                style={{
                  padding: '10px 0',
                  borderBottom: i < newsData.articles.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer', transition: 'background 0.12s', borderRadius: 6,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                    background: cat.bg, color: cat.color, flexShrink: 0,
                  }}>
                    {a.category}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
                    {a.title}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.55, marginBottom: 3 }}>
                  {a.summary}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', opacity: 0.7 }}>{a.source}</div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
