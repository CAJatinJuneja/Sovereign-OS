import React, { useState } from 'react';
import { usePersistentStore } from '../hooks/usePersistentStore';
import TaskBoard from '../components/TaskBoard';
import { Play, Pause, RotateCcw, Briefcase, Sparkles, Home, GraduationCap, FolderKanban } from 'lucide-react';

const CATEGORIES = [
  { key: 'office', label: 'Office', storageKey: 'work-tasks-office', icon: Briefcase },
  { key: 'self-development', label: 'Self Development', storageKey: 'work-tasks-self-development', icon: Sparkles },
  { key: 'chores', label: 'Chores', storageKey: 'work-tasks-chores', icon: Home },
  { key: 'study-targets', label: 'Study Targets', storageKey: 'work-tasks-study-targets', icon: GraduationCap },
  { key: 'other', label: 'Other Projects', storageKey: 'work-tasks-other', icon: FolderKanban },
] as const;

export default function WorkProjects() {
  const [activeTab, setActiveTab] = usePersistentStore<string>('work-active-tab', 'office');
  const [timer, setTimer] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  React.useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimer(t => t > 0 ? t - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = String(s % 60).padStart(2, '0');
    return m + ':' + sec;
  };

  const active = CATEGORIES.find(c => c.key === activeTab) || CATEGORIES[0];

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold mb-8 gradient-text flex items-center gap-3">
        <Briefcase size={28} style={{ color: 'var(--accent-primary)' }} /> Work & Projects
      </h1>

      {/* Pomodoro Timer */}
      <div className="glass-card p-6 mb-8 flex items-center gap-6">
        <div className="text-4xl font-mono font-bold gradient-text">{formatTime(timer)}</div>
        <button onClick={() => setIsRunning(!isRunning)} className="btn-primary flex items-center gap-2">
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button onClick={() => { setTimer(25 * 60); setIsRunning(false); }}
          className="p-3 rounded-xl transition-colors"
          style={{ background: 'var(--bg-card-hover)' }}>
          <RotateCcw size={20} style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = cat.key === active.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveTab(cat.key)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-200"
              style={isActive
                ? { background: 'rgba(124,138,255,0.12)', color: 'var(--accent-primary)', fontWeight: 500 }
                : { color: 'var(--text-secondary)' }
              }
            >
              <Icon size={16} /> {cat.label}
            </button>
          );
        })}
      </div>

      <TaskBoard key={active.storageKey} storageKey={active.storageKey} />
    </div>
  );
}
