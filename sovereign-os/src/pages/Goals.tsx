import { useState, useMemo } from 'react';
import { usePersistentStore } from '../hooks/usePersistentStore';
import { Plus, ChevronDown, ChevronRight, Check, Target, PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';

type Goal = { id: string; title: string; done: boolean; children?: Goal[] };

export default function Goals() {
  const [goals, setGoals] = usePersistentStore<Goal[]>('goals-data', []);
  const [newGoal, setNewGoal] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const addGoal = (parentId?: string) => {
    if (!newGoal.trim()) return;
    const g = { id: Date.now().toString(), title: newGoal, done: false, children: [] };
    if (!parentId) { setGoals([...goals, g]); }
    else { setGoals(addChild(goals, parentId, g)); }
    setNewGoal('');
  };

  const addChild = (list: Goal[], pid: string, g: Goal): Goal[] =>
    list.map(x => x.id === pid ? { ...x, children: [...(x.children || []), g] } : { ...x, children: addChild(x.children || [], pid, g) });

  const toggleDone = (list: Goal[], id: string): Goal[] =>
    list.map(x => x.id === id ? { ...x, done: !x.done } : { ...x, children: toggleDone(x.children || [], id) });

  const countGoals = (list: Goal[]): { total: number; done: number } => {
    let total = 0, done = 0;
    for (const g of list) {
      total++; if (g.done) done++;
      if (g.children) { const c = countGoals(g.children); total += c.total; done += c.done; }
    }
    return { total, done };
  };

  const stats = useMemo(() => countGoals(goals), [goals]);
  const progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  // Fetch today's journal goal reflection
  const today = new Date().toISOString().split('T')[0];
  const journalReflection = useMemo(() => {
    try {
      const raw = localStorage.getItem('journal-' + today);
      if (raw) { const d = JSON.parse(raw); return d.goalReflection || ''; }
    } catch {}
    return '';
  }, [today]);

  const renderGoals = (list: Goal[], level = 0) => (
    <div className={level > 0 ? 'ml-6 space-y-2' : 'space-y-2'}>
      {list.map(g => (
        <div key={g.id}>
          <div className="glass-card p-3 flex items-center gap-3">
            {g.children?.length ? (
              <button onClick={() => setExpanded({...expanded, [g.id]: !expanded[g.id]})}
                style={{ color: 'var(--text-muted)' }}>
                {expanded[g.id] ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
              </button>
            ) : <div className="w-4"/>}
            <button onClick={() => setGoals(toggleDone(goals, g.id))}
              className="w-6 h-6 rounded flex items-center justify-center transition-all"
              style={g.done
                ? { background: 'var(--accent-sage-dim)', color: 'var(--accent-sage)' }
                : { background: 'var(--bg-card-hover)' }
              }>
              {g.done && <Check size={14}/>}
            </button>
            <span style={g.done ? { textDecoration: 'line-through', color: 'var(--text-muted)' } : {}}>
              {g.title}
            </span>
          </div>
          {expanded[g.id] && g.children && renderGoals(g.children, level + 1)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <Target size={28} style={{ color: 'var(--accent-primary)' }} /> Goals
        </h1>
        {stats.total > 0 && (
          <span className="tag">{progress}% complete ({stats.done}/{stats.total})</span>
        )}
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <div className="glass-card p-4 mb-6">
          <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-2 rounded-full transition-all duration-500"
              style={{ width: progress + '%', background: 'var(--accent-sage)' }} />
          </div>
        </div>
      )}

      {/* Journal Reflection Link */}
      {journalReflection && (
        <div className="glass-card p-4 mb-6" style={{ borderLeft: '3px solid var(--accent-lavender)' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="section-label flex items-center gap-2">
                <PenLine size={12} /> Today's Journal Reflection
              </div>
              <p className="text-sm mt-1" style={{ fontFamily: 'Lora, serif', color: 'var(--text-secondary)' }}>
                {journalReflection.length > 150 ? journalReflection.slice(0, 150) + '...' : journalReflection}
              </p>
            </div>
            <Link to="/journal" className="text-xs" style={{ color: 'var(--accent-primary)' }}>View &rarr;</Link>
          </div>
        </div>
      )}

      <div className="flex gap-4 mb-8">
        <input value={newGoal} onChange={e => setNewGoal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addGoal()}
          placeholder="New year/month/week goal..." className="input-glass flex-1"/>
        <button onClick={() => addGoal()} className="btn-primary flex items-center gap-2">
          <Plus size={18}/> Add
        </button>
      </div>
      {renderGoals(goals)}

      {goals.length === 0 && (
        <div className="glass-card text-center py-12">
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No goals yet. Add your first goal above!</p>
        </div>
      )}
    </div>
  );
}
