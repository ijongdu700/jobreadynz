import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Todo from './pages/Todo';
import Diary from './pages/Diary';
import AITools from './pages/AITools';
import Interview from './pages/Interview';
import Wellness from './pages/Wellness';
import LearningPath from './pages/LearningPath';
import Tracker from './pages/Tracker';

export type PageId = 'dashboard' | 'jobs' | 'todo' | 'diary' | 'ai' | 'interview' | 'wellness' | 'learning' | 'tracker';

export interface DiaryEntry {
  id: number;
  date: string;
  time: string;
  text: string;
  mood: string;
}

const MOTIVATIONS = [
  '이미 잘하고 있어 — 오늘도 열었잖아! 🌟',
  '완벽하지 않아도 돼. 그냥 계속하면 돼. 💪',
  '취업 준비는 마라톤이야. 넌 이미 달리고 있어!',
  '오늘 한 걸음이 내일의 기회를 만들어.',
  'NZ의 어딘가에 딱 맞는 포지션이 기다리고 있어!',
  '취업하고 연차써서 해외투어가야지!',
  '이용복이 보고있다.',
];

export default function App() {
  const [page, setPage] = useState<PageId>('dashboard');
  const [diaries, setDiaries] = useState<DiaryEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem('jr_diaries') ?? '[]'); } catch { return []; }
  });
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const t = setTimeout(
      () => showToast(MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]),
      8000
    );
    return () => clearTimeout(t);
  }, []);

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard diaries={diaries} onNavigate={setPage} />;
      case 'jobs':      return <Jobs />;
      case 'todo':      return <Todo />;
      case 'diary':     return <Diary diaries={diaries} setDiaries={setDiaries} />;
      case 'ai':        return <AITools />;
      case 'interview': return <Interview />;
      case 'wellness':  return <Wellness onToast={showToast} />;
      case 'learning':  return <LearningPath />;
      case 'tracker':   return <Tracker />;
    }
  };

  return (
    <>
      <Sidebar currentPage={page} onNavigate={setPage} />
      <div className="main">{renderPage()}</div>
      {toast && (
        <div className="toast">
          <button className="toast-close" onClick={() => setToast(null)}>×</button>
          <div className="toast-msg">✨ {toast}</div>
        </div>
      )}
    </>
  );
}
