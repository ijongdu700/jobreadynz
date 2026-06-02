import { useState, useRef } from 'react';

const MOTIVATIONS = [
  '이미 잘하고 있어! 화이팅🌟',
  '완벽하지 않아도 돼. 그냥 계속하면 돼. 💪',
  'NZ의 어딘가에 딱 맞는 포지션이 기다리고 있어!',
  '취업해서 팬싸가자!',
  '이용복이 지켜보고 있다. 행복이랑 함께야:)',
  '연차쓰고 해외콘가야지',
  '취업 잘될거🥰',
  '꿈이라치고 재밌게 놀자',
  '원래 뭐든 매일 반복하면 늘고 있는 줄 몰라요',
  '당신이 지금 겪고 있는 모든 것은 모든 것에 처음 투성이인 당신의 삶에 경험이 되어주고 거름이 되어 줄 소중한 순간이라는 것만 잊지 말아줘요',
  'I have learned that strength is not never breaking. It is choosing to stay, even when it hurts.',
  'No shortcuts. Just presence. Progress is not obvious. I am.',
  '난 걱정을 안해. 왜? 내가 그만큼 여기까지 왔으니 정말 대단한거야 🩵',
  '다 돼. 넌 이미 충분해 -이용복-',
  '이겨내자! 생각보다 강할거야 나',
  'A better day will come for you 💙',
];

const WELLNESS_ITEMS = [
  { emoji: '😸', name: 'Pet a cat',     desc: 'Virtual cat cuddle therapy', action: 'cat'      },
  { emoji: '🤯', name: 'Stress Buster', desc: 'Destroy your worries',       action: 'game'     },
  { emoji: '🎬', name: 'Watch this',    desc: 'Motivational clip',          action: 'video'    },
  { emoji: '🎵', name: 'Chill music',   desc: 'Lo-fi beats to relax',       action: 'music'    },
  { emoji: '🧘', name: 'Breathe',       desc: '1-min calm exercise',        action: 'breathe'  },
  { emoji: '💌', name: 'Kind note',     desc: 'A message just for you',     action: 'note'     },
];

const FRAG_EMOJIS = ['💥', '✨', '🌟', '⚡', '💫', '🎆'];
const DEFAULT_MUSIC = 'https://youtu.be/UMcqpEuMUrs?si=3jfVaDm-ee1rwYTE';

const STYLES = `
@keyframes floatHeart {
  0%   { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-72px) scale(0.5); }
}
@keyframes catBounceAnim {
  0%, 100% { transform: scale(1); }
  40%      { transform: scale(1.3); }
}
@keyframes bubbleExplode {
  0%   { transform: scale(1);    opacity: 1; }
  60%  { transform: scale(1.35); opacity: 0.6; }
  100% { transform: scale(0);    opacity: 0; }
}
@keyframes frag0 { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(-55px,-65px) scale(0);opacity:0} }
@keyframes frag1 { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate( 55px,-65px) scale(0);opacity:0} }
@keyframes frag2 { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(-80px, 10px) scale(0);opacity:0} }
@keyframes frag3 { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate( 80px, 10px) scale(0);opacity:0} }
@keyframes frag4 { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(-40px, 70px) scale(0);opacity:0} }
@keyframes frag5 { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate( 40px, 70px) scale(0);opacity:0} }
`;

interface WellnessProps {
  onToast: (msg: string) => void;
}

function getStats() {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Pacific/Auckland' });
  let todayDone = 0, todayTotal = 0;
  try {
    const planner = JSON.parse(localStorage.getItem('jr_planner') ?? '{}') as Record<string, { done: boolean }[]>;
    const tasks = planner[today] ?? [];
    todayDone  = tasks.filter(t => t.done).length;
    todayTotal = tasks.length;
  } catch { /* empty */ }

  let totalEntries = 0, streak = 0;
  try {
    const diaries = JSON.parse(localStorage.getItem('jr_diaries') ?? '[]') as { date: string }[];
    totalEntries = diaries.length;
    const dates = new Set(diaries.map(d => d.date));
    const cursor = new Date();
    while (dates.has(cursor.toLocaleDateString('en-CA', { timeZone: 'Pacific/Auckland' }))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  } catch { /* empty */ }

  const stressesDestroyed = parseInt(localStorage.getItem('jr_stresses_destroyed') ?? '0', 10) || 0;
  return { todayDone, todayTotal, totalEntries, streak, stressesDestroyed };
}

export default function Wellness({ onToast }: WellnessProps) {
  // Cat
  const [catClicks, setCatClicks]     = useState(0);
  const [hearts, setHearts]           = useState<{ id: number; x: number }[]>([]);
  const [catBounceKey, setCatBounceKey] = useState(0);
  const heartIdRef = useRef(0);

  // Stress buster
  const [gameActive, setGameActive]   = useState(false);
  const [stressInput, setStressInput] = useState('');
  const [bubble, setBubble]           = useState<string | null>(null);
  const [exploding, setExploding]     = useState(false);
  const [goneMsg, setGoneMsg]         = useState(false);
  const [stressCount, setStressCount] = useState(
    () => parseInt(localStorage.getItem('jr_stresses_destroyed') ?? '0', 10) || 0
  );

  // Progress
  const [progressActive, setProgressActive] = useState(false);

  // Breathe
  const [breatheActive, setBreatheActive]   = useState(false);
  const [breathePhase, setBreathePhase]     = useState<'in' | 'hold' | 'out' | 'done'>('in');
  const [breatheRound, setBreatheRound]     = useState(1);
  const timerIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Music
  const [musicLink, setMusicLink]     = useState(() => localStorage.getItem('jr_music_link') ?? DEFAULT_MUSIC);
  const [editingMusic, setEditingMusic] = useState(false);
  const [musicInput, setMusicInput]   = useState('');

  // ── Cat ────────────────────────────────────────────────────────────────
  const catEmoji = catClicks === 0 ? '🐱' : catClicks < 5 ? '😺' : catClicks < 10 ? '😸' : catClicks < 15 ? '😻' : '😹';
  const catMsg   = catClicks === 0 ? 'Click to pet!' : catClicks < 5 ? 'Purring...' : catClicks < 10 ? 'So happy!' : catClicks < 15 ? 'I love you!!' : 'Too much!!!';

  const handleCatClick = () => {
    setCatClicks(c => c + 1);
    setCatBounceKey(k => k + 1);
    heartIdRef.current += 1;
    const id = heartIdRef.current;
    const x  = Math.random() * 60 - 30;
    setHearts(h => [...h, { id, x }]);
    setTimeout(() => setHearts(h => h.filter(hh => hh.id !== id)), 1500);
  };

  // ── Stress buster ──────────────────────────────────────────────────────
  const launchStress = () => {
    if (!stressInput.trim() || bubble) return;
    setBubble(stressInput.trim());
    setStressInput('');
    setGoneMsg(false);
  };

  const explodeBubble = () => {
    if (exploding) return;
    setExploding(true);
    const next = stressCount + 1;
    setStressCount(next);
    localStorage.setItem('jr_stresses_destroyed', String(next));
    setTimeout(() => { setBubble(null); setExploding(false); setGoneMsg(true); }, 500);
  };

  // ── Music ──────────────────────────────────────────────────────────────
  const saveMusicLink = () => {
    if (!musicInput.trim()) return;
    const link = musicInput.trim();
    setMusicLink(link);
    localStorage.setItem('jr_music_link', link);
    setMusicInput('');
    setEditingMusic(false);
  };

  // ── Breathe ────────────────────────────────────────────────────────────
  const startBreathing = () => {
    const ids: ReturnType<typeof setTimeout>[] = [];
    const add = (fn: () => void, delay: number) => { ids.push(setTimeout(fn, delay)); };

    setBreathePhase('in');
    setBreatheRound(1);
    add(() => setBreathePhase('hold'),                    4000);
    add(() => setBreathePhase('out'),                     8000);
    add(() => { setBreathePhase('in'); setBreatheRound(2); }, 12000);
    add(() => setBreathePhase('hold'),                   16000);
    add(() => setBreathePhase('out'),                    20000);
    add(() => { setBreathePhase('in'); setBreatheRound(3); }, 24000);
    add(() => setBreathePhase('hold'),                   28000);
    add(() => setBreathePhase('out'),                    32000);
    add(() => setBreathePhase('done'),                   36000);

    timerIdsRef.current = ids;
  };

  const stopBreathing = () => {
    timerIdsRef.current.forEach(clearTimeout);
    timerIdsRef.current = [];
    setBreatheActive(false);
    setBreathePhase('in');
    setBreatheRound(1);
  };

  // ── Dispatch ───────────────────────────────────────────────────────────
  const handleWellness = (action: string) => {
    if (action === 'cat')      { handleCatClick(); return; }
    if (action === 'note')     { onToast(MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]); return; }
    if (action === 'video')    { window.open('https://www.youtube.com/watch?v=ZXsQAXx_ao0', '_blank'); return; }
    if (action === 'music')    { window.open(musicLink, '_blank'); return; }
    if (action === 'game')     { setGameActive(true); return; }
    if (action === 'progress') { setProgressActive(true); return; }
    if (action === 'breathe')  { setBreatheActive(true); startBreathing(); return; }
  };

  // ── Breathe view ───────────────────────────────────────────────────────
  if (breatheActive) {
    if (breathePhase === 'done') {
      return (
        <div>
          <div className="page-header">
            <div className="page-title">🧘 Breathe</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🌟</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
              Well done! 3 rounds complete.
            </div>
            <button
              className="btn"
              style={{ marginTop: 20 }}
              onClick={() => { setBreatheActive(false); setBreathePhase('in'); setBreatheRound(1); }}
            >
              Back to Wellness
            </button>
          </div>
        </div>
      );
    }

    const phaseLabel = breathePhase === 'in' ? 'Breathe In' : breathePhase === 'hold' ? 'Hold' : 'Breathe Out';
    const phaseColor = breathePhase === 'in' ? 'var(--green)' : breathePhase === 'hold' ? 'var(--accent)' : '#7fb3d3';

    return (
      <div>
        <div className="page-header">
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }} onClick={stopBreathing}>
            ← Stop
          </button>
          <div className="page-title">🧘 Breathe</div>
          <div className="page-sub">Round {breatheRound} of 3</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: phaseColor, marginBottom: 16 }}>
            {phaseLabel}
          </div>
          <div style={{ fontSize: 72 }}>🫁</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 16 }}>4 seconds</div>
        </div>
      </div>
    );
  }

  // ── Stress Buster view ─────────────────────────────────────────────────
  if (gameActive) {
    return (
      <div>
        <style>{STYLES}</style>
        <div className="page-header">
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginBottom: 12 }}
            onClick={() => { setGameActive(false); setBubble(null); setExploding(false); setGoneMsg(false); }}
          >
            ← Back
          </button>
          <div className="page-title">🤯 Stress Buster</div>
          <div className="page-sub">Type a stress, launch it, then destroy it.</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              className="todo-input"
              style={{ flex: 1 }}
              value={stressInput}
              onChange={e => setStressInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && launchStress()}
              placeholder="Type something stressful…"
              disabled={!!bubble}
            />
            <button className="btn" onClick={launchStress} disabled={!!bubble || !stressInput.trim()}>
              Launch it!
            </button>
          </div>

          {bubble && (
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', minHeight: 110, alignItems: 'center' }}>
              <div
                onClick={!exploding ? explodeBubble : undefined}
                style={{
                  background: 'rgba(124,158,255,0.15)', border: '2px solid var(--accent)',
                  borderRadius: 24, padding: '14px 28px', fontSize: 16,
                  maxWidth: '80%', textAlign: 'center',
                  cursor: exploding ? 'default' : 'pointer',
                  animation: exploding ? 'bubbleExplode 0.45s ease-out forwards' : 'none',
                  userSelect: 'none',
                }}
              >
                {bubble}
                {!exploding && (
                  <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 6 }}>tap to destroy ✕</div>
                )}
              </div>
              {exploding && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0, pointerEvents: 'none' }}>
                  {FRAG_EMOJIS.map((f, i) => (
                    <span key={i} style={{ position: 'absolute', fontSize: 20, animation: `frag${i} 0.5s ease-out forwards` }}>
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {goneMsg && !bubble && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>💥</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--green)', marginBottom: 4 }}>
                Gone! That stress is history.
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                Stresses destroyed this session: {stressCount}
              </div>
            </div>
          )}

          {stressCount > 0 && !goneMsg && !bubble && (
            <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right', marginTop: 4 }}>
              Destroyed: {stressCount}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Progress view ──────────────────────────────────────────────────────
  if (progressActive) {
    const { todayDone, todayTotal, totalEntries, streak, stressesDestroyed } = getStats();
    return (
      <div>
        <div className="page-header">
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }} onClick={() => setProgressActive(false)}>
            ← Back
          </button>
          <div className="page-title">Progress 📊</div>
          <div className="page-sub">Here's how you've been doing.</div>
        </div>

        <div className="card">
          <div className="card-title">Today's tasks</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: 'var(--green)', borderRadius: 3,
                width: todayTotal ? `${(todayDone / todayTotal) * 100}%` : '0%',
              }} />
            </div>
            <span style={{ fontSize: 13, color: 'var(--text)', whiteSpace: 'nowrap' }}>
              {todayDone} / {todayTotal} done
            </span>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Diary</div>
          <div style={{ display: 'flex', gap: 32 }}>
            <div>
              <div style={{ fontSize: 32, fontFamily: 'var(--font-serif)', color: 'var(--text)' }}>{totalEntries}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>total entries</div>
            </div>
            <div>
              <div style={{ fontSize: 32, fontFamily: 'var(--font-serif)', color: streak > 0 ? 'var(--green)' : 'var(--text)' }}>
                {streak}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>day streak 🔥</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Stress Buster</div>
          <div style={{ fontSize: 32, fontFamily: 'var(--font-serif)', color: 'var(--text)' }}>{stressesDestroyed}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>stresses destroyed 💥</div>
        </div>
      </div>
    );
  }

  // ── Main view ──────────────────────────────────────────────────────────
  return (
    <div>
      <style>{STYLES}</style>
      <div className="page-header">
        <div className="page-title">Wellness Corner ☀</div>
        <div className="page-sub">취업 준비가 힘들 때 잠깐 쉬어가는 공간.</div>
      </div>

      {/* Interactive cat */}
      <div className="card" style={{ textAlign: 'center', padding: '28px 20px', marginBottom: 16 }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 10 }}>
          <span
            key={catBounceKey}
            onClick={handleCatClick}
            style={{
              fontSize: 64, cursor: 'pointer', display: 'inline-block', userSelect: 'none',
              animation: catBounceKey > 0 ? 'catBounceAnim 0.35s ease-out' : 'none',
            }}
          >
            {catEmoji}
          </span>
          {hearts.map(h => (
            <span
              key={h.id}
              style={{
                position: 'absolute', top: -4,
                left: `calc(50% + ${h.x}px)`,
                fontSize: 13, pointerEvents: 'none', zIndex: 10,
                animation: 'floatHeart 1.5s ease-out forwards',
              }}
            >
              ❤️
            </span>
          ))}
        </div>
        <div style={{ fontSize: 14, color: 'var(--muted)' }}>{catMsg}</div>
        {catClicks > 0 && (
          <div style={{ fontSize: 11, color: 'var(--border)', marginTop: 4 }}>{catClicks} pets</div>
        )}
      </div>

      <div className="wellness-grid">
        {WELLNESS_ITEMS.map(w => (
          <div className="wellness-card" key={w.action} onClick={() => handleWellness(w.action)}>
            <div className="wellness-emoji">{w.emoji}</div>
            <div className="wellness-name">{w.name}</div>
            <div className="wellness-desc">{w.desc}</div>
          </div>
        ))}
      </div>

      {/* Music link editor */}
      <div className="card" style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>🎵 Now playing</span>
          {!editingMusic ? (
            <button className="btn btn-ghost btn-sm" onClick={() => { setEditingMusic(true); setMusicInput(musicLink); }}>
              Edit link
            </button>
          ) : (
            <button className="btn btn-ghost btn-sm" onClick={() => setEditingMusic(false)}>Cancel</button>
          )}
        </div>
        {editingMusic ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="todo-input"
              style={{ flex: 1, fontSize: 12 }}
              value={musicInput}
              onChange={e => setMusicInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveMusicLink()}
              placeholder="Paste YouTube or Spotify link…"
            />
            <button className="btn btn-sm" onClick={saveMusicLink}>Save</button>
          </div>
        ) : (
          <div style={{ fontSize: 11, color: 'var(--muted)', wordBreak: 'break-all' }}>{musicLink}</div>
        )}
      </div>

    </div>
  );
}
