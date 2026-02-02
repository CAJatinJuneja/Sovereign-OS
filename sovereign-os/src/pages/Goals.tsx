import { useState } from 'react';
import { usePersistentStore } from '../hooks/usePersistentStore';
import { Plus, ChevronDown, ChevronRight, Check } from 'lucide-react';

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

  const renderGoals = (list: Goal[], level = 0) => (
    <div className={`space-y-2 ${level > 0 ? 'ml-6' : ''}`}>
      {list.map(g => (
        <div key={g.id}>
          <div className="glass-card p-3 flex items-center gap-3">
            {g.children?.length ? (
              <button onClick={()=>setExpanded({...expanded,[g.id]:!expanded[g.id]})} className="text-gray-400">
                {expanded[g.id] ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
              </button>
            ) : <div className="w-4"/>}
            <button onClick={()=>setGoals(toggleDone(goals,g.id))} className={`w-6 h-6 rounded flex items-center justify-center ${g.done?'bg-emerald-500/20 text-emerald-400':'bg-white/10'}`}>
              {g.done && <Check size={14}/>}
            </button>
            <span className={g.done?'line-through text-gray-500':''}>{g.title}</span>
          </div>
          {expanded[g.id] && g.children && renderGoals(g.children, level+1)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold mb-8 gradient-text">Goals</h1>
      <div className="flex gap-4 mb-8">
        <input value={newGoal} onChange={e=>setNewGoal(e.target.value)} placeholder="New year/month/week goal..." className="input-glass flex-1"/>
        <button onClick={()=>addGoal()} className="btn-primary flex items-center gap-2"><Plus size={18}/>Add</button>
      </div>
      {renderGoals(goals)}
    </div>
  );
}