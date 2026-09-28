import { useState } from 'react';
import { usePersistentStore } from '../hooks/usePersistentStore';
import { ACTIVITY_TAGS, defaultHours, formatHour, type HourEntry, type ActivityTag } from '../lib/timelineStore';
import { toDateKey } from '../lib/date';
import { MOOD_OPTIONS } from '../lib/journalPrompts';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';

function addDays(date: string, delta: number): string {
  const d = new Date(date + 'T00:00:00');
  d.setDate(d.getDate() + delta);
  return toDateKey(d);
}

function formatDateLabel(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function rowAccent(h: HourEntry): string {
  const bothLogged = h.plannedNote.trim() && h.actualNote.trim();
  if (!bothLogged) return 'var(--border-subtle)';
  return h.plannedTag === h.actualTag ? 'var(--accent-sage)' : 'var(--accent-rose)';
}

function DayView({ date }: { date: string }) {
  const [hours, setHours] = usePersistentStore<HourEntry[]>('timeline-' + date, defaultHours());

  const updateHour = (hour: number, updates: Partial<HourEntry>) => {
    setHours(hours.map(h => h.hour === hour ? { ...h, ...updates } : h));
  };

  const comparable = hours.filter(h => h.plannedNote.trim() && h.actualNote.trim());
  const matched = comparable.filter(h => h.plannedTag === h.actualTag).length;

  return (
    <div>
      {comparable.length > 0 && (
        <div className="glass-card p-4 mb-4 flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Plan vs Actual</span>
          <span className="font-semibold" style={{ color: matched === comparable.length ? 'var(--accent-sage)' : 'var(--accent-warm)' }}>
            {matched}/{comparable.length} hours matched
          </span>
        </div>
      )}
      <div className="space-y-2">
        {hours.map(h => (
          <div key={h.hour} className="glass-card p-3" style={{ borderLeft: `3px solid ${rowAccent(h)}` }}>
            <div className="text-sm font-mono mb-2" style={{ color: 'var(--text-muted)' }}>{formatHour(h.hour)}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Planned</div>
                <div className="flex gap-2">
                  <select value={h.plannedTag} onChange={e => updateHour(h.hour, { plannedTag: e.target.value as ActivityTag })}
                    className="input-glass text-xs w-auto shrink-0" style={{ width: 'auto', minWidth: '120px' }}>
                    {ACTIVITY_TAGS.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                  </select>
                  <input value={h.plannedNote} onChange={e => updateHour(h.hour, { plannedNote: e.target.value })}
                    placeholder="What do you plan to do?" className="input-glass flex-1" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Actual (end of hour)</span>
                  <div className="flex gap-0.5">
                    {MOOD_OPTIONS.map(m => (
                      <button key={m.value} type="button"
                        onClick={() => updateHour(h.hour, { mood: h.mood === m.value ? 0 : m.value })}
                        title={m.label}
                        className="text-sm w-6 h-6 rounded-md flex items-center justify-center transition-all"
                        style={h.mood === m.value
                          ? { background: 'var(--accent-primary-dim)', border: '1px solid var(--accent-primary)' }
                          : { background: 'var(--bg-card-hover)', border: '1px solid transparent' }}
                      >{m.emoji}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <select value={h.actualTag} onChange={e => updateHour(h.hour, { actualTag: e.target.value as ActivityTag })}
                    className="input-glass text-xs w-auto shrink-0" style={{ width: 'auto', minWidth: '120px' }}>
                    {ACTIVITY_TAGS.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                  </select>
                  <input value={h.actualNote} onChange={e => updateHour(h.hour, { actualNote: e.target.value })}
                    placeholder="What actually happened?" className="input-glass flex-1" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DailyTimeline() {
  const today = toDateKey(new Date());
  const [date, setDate] = useState(today);

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <Clock size={28} style={{ color: 'var(--accent-primary)' }} /> Daily Timeline
        </h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setDate(d => addDays(d, -1))}
            className="p-2 rounded-xl transition-colors" style={{ background: 'var(--bg-card-hover)' }}>
            <ChevronLeft size={18} style={{ color: 'var(--text-secondary)' }} />
          </button>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{formatDateLabel(date)}</span>
          <button onClick={() => setDate(d => addDays(d, 1))}
            className="p-2 rounded-xl transition-colors" style={{ background: 'var(--bg-card-hover)' }}>
            <ChevronRight size={18} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>
      </div>

      <DayView key={date} date={date} />
    </div>
  );
}
