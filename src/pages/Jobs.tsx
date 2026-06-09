import { useState, useEffect } from 'react';

interface JobRecord {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  source: 'Adzuna';
  reason: string;
  postedDate?: string;
  salary?: string;
}

interface JobsData {
  lastUpdated: string | null;
  jobs: JobRecord[];
}

async function loadJobs(): Promise<JobsData> {
  const res = await fetch('/api/jobs');
  if (!res.ok) return { lastUpdated: null, jobs: [] };
  return res.json() as Promise<JobsData>;
}

interface SSEEvent {
  type: 'start' | 'fetch' | 'analyse' | 'done' | 'error';
  message: string;
  current: number;
  total: number;
  jobs?: JobRecord[];
  lastUpdated?: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-NZ', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatPostedDate(iso: string): string {
  const now = new Date();
  const posted = new Date(iso);
  const nzDate = (d: Date) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Auckland', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  const diffDays = Math.round(
    (new Date(nzDate(now)).getTime() - new Date(nzDate(posted)).getTime()) / 86_400_000
  );
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', day: 'numeric', month: 'short' }).format(posted);
}

const SOURCE_STYLE: Record<string, { label: string; bg: string; color: string; btnLabel: string }> = {
  'Seek':     { label: 'Seek',     bg: '#1a56a0', color: '#fff', btnLabel: 'View on Seek →' },
  'Trade Me': { label: 'Trade Me', bg: '#1D9E75', color: '#fff', btnLabel: 'View on Trade Me →' },
  'Adzuna':   { label: 'Adzuna',   bg: '#e05c00', color: '#fff', btnLabel: 'View on Adzuna →' },
};
const SOURCE_DEFAULT = { label: 'Job', bg: 'var(--surface2)', color: 'var(--text)', btnLabel: 'Search →' };

export default function Jobs() {
  const [data, setData] = useState<JobsData>({ lastUpdated: null, jobs: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ type: string; message: string; pct: number } | null>(null);

  useEffect(() => {
    loadJobs()
      .then(setData)
      .catch(() => setError('Could not load jobs.'))
      .finally(() => setLoading(false));
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setError(null);
    setProgress(null);

    const es = new EventSource('/api/jobs/refresh');

    es.onmessage = (e: MessageEvent) => {
      const event = JSON.parse(e.data as string) as SSEEvent;
      if (event.type === 'done') {
        es.close();
        setData({ lastUpdated: event.lastUpdated ?? null, jobs: event.jobs ?? [] });
        setRefreshing(false);
        setProgress(null);
      } else if (event.type === 'error') {
        es.close();
        setError(event.message);
        setRefreshing(false);
        setProgress(null);
      } else {
        const pct = event.total > 0 ? Math.round((event.current / event.total) * 100) : 0;
        setProgress({ type: event.type, message: event.message, pct });
      }
    };

    es.onerror = () => {
      es.close();
      setError('Refresh failed — is the server running?');
      setRefreshing(false);
      setProgress(null);
    };
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div className="page-title">Job Agent</div>
            <div className="page-sub">AI-filtered NZ IT graduate roles — updated on demand.</div>
          </div>
          <button
            className="btn"
            onClick={handleRefresh}
            disabled={refreshing}
            style={{ flexShrink: 0, marginTop: 4 }}
          >
            {refreshing ? '⏳ Searching…' : '🔍 Refresh'}
          </button>
        </div>
        {data.lastUpdated && (
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
            Last updated: {formatDate(data.lastUpdated)}
          </div>
        )}
        {error && (
          <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 8 }}>{error}</div>
        )}
        {refreshing && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
              {progress?.type === 'analyse'
                ? `Analysing... ${progress.pct}%`
                : progress?.message ?? 'Fetching from Adzuna…'}
            </div>
            <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${progress?.pct ?? 0}%`,
                background: 'var(--green)',
                borderRadius: 2,
                transition: 'width 0.3s ease',
              }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
              This may take a while…
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="card" style={{ color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
      ) : data.jobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>No jobs yet</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            Click <strong>Refresh</strong> to search Adzuna and filter with AI.
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
            {data.jobs.length} suitable role{data.jobs.length !== 1 ? 's' : ''} found
          </div>
          {data.jobs.map(job => {
            const src = SOURCE_STYLE[job.source] ?? SOURCE_DEFAULT;
            return (
              <div key={job.id} className="card" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3, marginBottom: 3 }}>
                      {job.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {[job.company, job.location].filter(Boolean).join(' · ')}
                    </div>
                    {job.salary && (
                      <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 3 }}>
                        💰 {job.salary}
                      </div>
                    )}
                    {job.postedDate && (
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
                        Posted {formatPostedDate(job.postedDate)}
                      </div>
                    )}
                  </div>
                  <span style={{
                    flexShrink: 0,
                    fontSize: 10, fontWeight: 700,
                    padding: '3px 7px', borderRadius: 4,
                    background: src.bg, color: src.color,
                    letterSpacing: 0.3,
                  }}>
                    {src.label}
                  </span>
                </div>

                {job.reason && (
                  <div style={{
                    fontSize: 12, color: 'var(--muted)', lineHeight: 1.55,
                    padding: '8px 10px',
                    background: 'var(--surface2)',
                    borderRadius: 6,
                    marginBottom: 10,
                  }}>
                    🤖 {job.reason}
                  </div>
                )}

                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  {src.btnLabel}
                </a>
              </div>
            );
          })}
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, textAlign: 'center' }}>
            Links open the direct Adzuna listing
          </div>
        </>
      )}
    </div>
  );
}
