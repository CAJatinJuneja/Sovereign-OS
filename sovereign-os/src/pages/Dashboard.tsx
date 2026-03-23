import { useMemo } from 'react';
import { usePersistentStore } from '../hooks/usePersistentStore';
import { Link } from 'react-router-dom';
import { Check, Smile, PenLine, Flame, TrendingUp } from 'lucide-react';
import { MOOD_OPTIONS } from '../lib/journalPrompts';

export default function Dashboard() {
  const today = new Date().toISOString().split('T')[0];
  const [completed, setCompleted] = usePersistentStore<boolean>(`completed-${today}`, false);
  const [mood, setMood] = usePersistentStore<number>(`mood-${today}`, 5);

  // Journal snapshot
  const todayJournal = useMemo(() => {
    try {
      const raw = localStorage.getItem(`journal-${today}`);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, [today]);

  // Journaling streak
  const streak = useMemo(() => {
    let count = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const key = `journal-${d.toISOString().split('T')[0]}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const data = JSON.parse(raw);
          if (data.content || data.mood) { count++; } else { break; }
        } catch { break; }
      } else if (i > 0) { break; }
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, []);

  // Habit heatmap (last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  const hasJournal = (date: string) => {
    try {
      const raw = localStorage.getItem(`journal-${date}`);
      if (!raw) return false;
      const data = JSON.parse(raw);
      return !!(data.content || data.mood);
    } catch { return false; }
  };

  const moodEmoji = todayJournal?.mood ? MOOD_OPTIONS.find(m => m.value === todayJournal.mood)?.emoji : null;

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
        {streak > 0 && (
          <div className="streak-badge">
            <Flame size={14} /> {streak} day streak
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Journal Snapshot */}
        <div className="journal-card md:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <PenLine size={18} style={{ color: 'var(--accent-primary)' }} /> Journal Snapshot
            </h3>
            <Link to="/journal" className="btn-primary text-sm flex items-center gap-1.5 py-2 px-4">
              {todayJournal ? 'Continue Writing' : "Start Today's Journal"}
            </Link>
          </div>

          {todayJournal ? (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                {moodEmoji && <span className="text-2xl">{moodEmoji}</span>}
                {todayJournal.emotions?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {todayJournal.emotions.slice(0, 5).map((em: string) => (
                      <span key={em} className="emotion-chip active text-xs">{em}</span>
                    ))}
                  </div>
                )}
              </div>
              {todayJournal.content && (
                <p className="text-sm leading-relaxed line-clamp-3" style={{ fontFamily: 'Lora, serif', color: 'var(--text-secondary)' }}>
                  {todayJournal.content.slice(0, 200)}{todayJournal.content.length > 200 ? '...' : ''}
                </p>
              )}
              {todayJournal.wordCount > 0 && (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{todayJournal.wordCount} words written</span>
              )}
            </div>
          ) : (
            <div className="py-6 text-center">
              <p style={{ color: 'var(--text-muted)' }}>You haven't journaled today. Take a moment to reflect.</p>
            </div>
          )}
        </div>

        {/* Mood Pulse */}
        <div className="glass-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Smile size={18} style={{ color: 'var(--accent-lavender)' }} /> Mood Pulse
          </h3>
          <input
            type="range" min="1" max="10" value={mood}
            onChange={(e) => setMood(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-4xl font-bold text-center mt-4 gradient-text">{mood}/10</div>
        </div>

        {/* Daily Closure */}
        <div className="glass-card">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Daily Closure</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCompleted(!completed)}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                completed
                  ? 'border-2 shadow-lg' : 'border-2 hover:bg-[rgba(255,255,255,0.05)]'
              }`}
              style={completed
                ? { background: 'var(--accent-sage-dim)', borderColor: 'var(--accent-sage)' }
                : { background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }
              }
            >
              <Check size={28} style={{ color: completed ? 'var(--accent-sage)' : 'var(--text-muted)' }} />
            </button>
            <span style={{ color: 'var(--text-secondary)' }}>
              {completed ? 'Tasks Completed!' : 'Did you complete tasks?'}
            </span>
          </div>
        </div>

        {/* Journal Heatmap */}
        <div className="glass-card md:col-span-2 lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp size={18} style={{ color: 'var(--accent-sage)' }} /> Journal Activity (30 Days)
          </h3>
          <div className="grid grid-cols-7 gap-1.5">
            {last30Days.map((day, i) => (
              <div
                key={i}
                title={day}
                className="w-5 h-5 rounded-sm transition-colors"
                style={{
                  background: hasJournal(day) ? 'var(--accent-sage)' : 'rgba(255,255,255,0.06)',
                  boxShadow: hasJournal(day) ? '0 0 6px rgba(107,203,139,0.3)' : 'none',
                }}
              />
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--accent-sage)' }} />
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
