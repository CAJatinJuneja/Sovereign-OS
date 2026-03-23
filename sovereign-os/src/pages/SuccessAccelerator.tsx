import { useState, useMemo } from 'react';
import { usePersistentStore } from '../hooks/usePersistentStore';
import { Rocket, Plus, Trash2, Check, ChevronLeft, ChevronRight, Target, Calendar, Heart, AlertTriangle, BookOpen, Users, ListChecks } from 'lucide-react';

type GoalPlan = {
  id: string;
  title: string;
  definition: string;
  deadline: string;
  subDeadlines: { id: string; text: string; date: string }[];
  whyBenefits: string[];
  obstaclesInternal: string[];
  obstaclesExternal: string[];
  skillGaps: string[];
  people: string[];
  masterPlan: { id: string; text: string; done: boolean; priority: number }[];
  currentStep: number;
  createdAt: string;
};

const STEPS = [
  { label: 'Define', icon: Target, desc: 'Set a clear, measurable goal' },
  { label: 'Deadline', icon: Calendar, desc: 'Set your primary and sub-deadlines' },
  { label: 'The Why', icon: Heart, desc: 'List all the benefits of achieving this' },
  { label: 'Obstacles', icon: AlertTriangle, desc: 'Identify internal and external obstacles' },
  { label: 'Skills', icon: BookOpen, desc: 'Knowledge and skills you need to acquire' },
  { label: 'People', icon: Users, desc: 'People whose cooperation you need' },
  { label: 'Master Plan', icon: ListChecks, desc: 'Your auto-generated action checklist' },
];

export default function SuccessAccelerator() {
  const [goals, setGoals] = usePersistentStore<GoalPlan[]>('accelerator-goals', []);
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [newInput, setNewInput] = useState('');
  const [newSubDate, setNewSubDate] = useState('');

  const activeGoal = goals.find(g => g.id === activeGoalId) || null;

  const updateGoal = (id: string, updates: Partial<GoalPlan>) => {
    setGoals(goals.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const createGoal = () => {
    const g: GoalPlan = {
      id: Date.now().toString(), title: '', definition: '', deadline: '',
      subDeadlines: [], whyBenefits: [], obstaclesInternal: [], obstaclesExternal: [],
      skillGaps: [], people: [], masterPlan: [], currentStep: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setGoals([...goals, g]);
    setActiveGoalId(g.id);
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
    if (activeGoalId === id) setActiveGoalId(null);
  };

  const generateMasterPlan = (g: GoalPlan) => {
    const items: { id: string; text: string; done: boolean; priority: number }[] = [];
    let p = 1;
    g.skillGaps.forEach(s => items.push({ id: 'sk-' + p, text: 'Learn: ' + s, done: false, priority: p++ }));
    g.people.forEach(pe => items.push({ id: 'pp-' + p, text: 'Connect with: ' + pe, done: false, priority: p++ }));
    g.obstaclesInternal.forEach(o => items.push({ id: 'oi-' + p, text: 'Overcome: ' + o, done: false, priority: p++ }));
    g.obstaclesExternal.forEach(o => items.push({ id: 'oe-' + p, text: 'Address: ' + o, done: false, priority: p++ }));
    g.subDeadlines.forEach(sd => items.push({ id: 'sd-' + p, text: sd.text + ' (by ' + sd.date + ')', done: false, priority: p++ }));
    items.push({ id: 'main-' + p, text: 'Achieve: ' + g.definition, done: false, priority: p });
    return items;
  };

  const addListItem = (field: 'whyBenefits' | 'obstaclesInternal' | 'obstaclesExternal' | 'skillGaps' | 'people') => {
    if (!newInput.trim() || !activeGoal) return;
    updateGoal(activeGoal.id, { [field]: [...(activeGoal[field] as string[]), newInput.trim()] });
    setNewInput('');
  };

  const removeListItem = (field: 'whyBenefits' | 'obstaclesInternal' | 'obstaclesExternal' | 'skillGaps' | 'people', idx: number) => {
    if (!activeGoal) return;
    const arr = [...(activeGoal[field] as string[])];
    arr.splice(idx, 1);
    updateGoal(activeGoal.id, { [field]: arr });
  };

  const goToStep = (step: number) => {
    if (!activeGoal) return;
    if (step === 6) {
      const plan = generateMasterPlan(activeGoal);
      updateGoal(activeGoal.id, { currentStep: step, masterPlan: plan });
    } else {
      updateGoal(activeGoal.id, { currentStep: step });
    }
  };

  const completionPct = useMemo(() => {
    if (!activeGoal) return 0;
    let filled = 0;
    if (activeGoal.definition) filled++;
    if (activeGoal.deadline) filled++;
    if (activeGoal.whyBenefits.length > 0) filled++;
    if (activeGoal.obstaclesInternal.length > 0 || activeGoal.obstaclesExternal.length > 0) filled++;
    if (activeGoal.skillGaps.length > 0) filled++;
    if (activeGoal.people.length > 0) filled++;
    return Math.round((filled / 6) * 100);
  }, [activeGoal]);

  // Goal list view
  if (!activeGoal) {
    return (
      <div className="animate-fadeIn">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
            <Rocket size={28} style={{ color: 'var(--accent-primary)' }} /> Success Accelerator
          </h1>
          <button onClick={createGoal} className="btn-primary flex items-center gap-2"><Plus size={18}/> New Goal</button>
        </div>
        <div className="space-y-4">
          {goals.map(g => (
            <div key={g.id} className="glass-card p-5 cursor-pointer" onClick={() => setActiveGoalId(g.id)}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{g.definition || 'Untitled Goal'}</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {g.deadline ? 'Due: ' + g.deadline : 'No deadline set'} · Step {g.currentStep + 1}/7
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tag">{Math.round(((g.currentStep) / 7) * 100)}%</span>
                  <button onClick={e => { e.stopPropagation(); deleteGoal(g.id); }}
                    style={{ color: 'var(--accent-rose)' }} className="hover:opacity-70 p-1">
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {goals.length === 0 && (
          <div className="glass-card text-center py-12">
            <Rocket size={40} style={{ color: 'var(--accent-primary)', margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No goals yet. Start your journey!</p>
          </div>
        )}
      </div>
    );
  }

  const step = activeGoal.currentStep;

  const renderListEditor = (field: 'whyBenefits' | 'obstaclesInternal' | 'obstaclesExternal' | 'skillGaps' | 'people', placeholder: string) => (
    <div>
      <div className="flex gap-3 mb-4">
        <input value={newInput} onChange={e => setNewInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addListItem(field)}
          placeholder={placeholder} className="input-glass flex-1" />
        <button onClick={() => addListItem(field)} className="btn-primary"><Plus size={18}/></button>
      </div>
      <div className="space-y-2">
        {(activeGoal[field] as string[]).map((item, i) => (
          <div key={i} className="glass-card p-3 flex justify-between items-center">
            <span className="text-sm">{item}</span>
            <button onClick={() => removeListItem(field, i)} style={{ color: 'var(--accent-rose)' }}
              className="hover:opacity-70"><Trash2 size={14}/></button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => setActiveGoalId(null)} className="btn-ghost flex items-center gap-1">
          <ChevronLeft size={16}/> Goals
        </button>
        <h1 className="text-2xl font-bold gradient-text flex-1">{activeGoal.definition || 'New Goal'}</h1>
        <span className="tag">{completionPct}% complete</span>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-1" style={{ flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <button onClick={() => goToStep(i)}
              className={`stepper-dot ${step === i ? 'active' : step > i ? 'completed' : ''}`}
              title={s.label}>
              {step > i ? <Check size={14}/> : i + 1}
            </button>
            {i < STEPS.length - 1 && <div className={`stepper-line ${step > i ? 'completed' : ''}`} />}
          </div>
        ))}
      </div>

      <div className="glass-card p-6 mb-6">
        <div className="section-label flex items-center gap-2 mb-1">
          {(() => { const Icon = STEPS[step].icon; return <Icon size={14}/>; })()}
          Step {step + 1}: {STEPS[step].label}
        </div>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{STEPS[step].desc}</p>

        {step === 0 && (
          <div>
            <input value={activeGoal.definition} onChange={e => updateGoal(activeGoal.id, { definition: e.target.value, title: e.target.value })}
              className="input-glass text-lg" placeholder="e.g., Increase monthly income to $10,000 by Dec 2026" />
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>Primary Deadline</label>
              <input type="date" value={activeGoal.deadline} onChange={e => updateGoal(activeGoal.id, { deadline: e.target.value })}
                className="input-glass" style={{ width: 'auto' }} />
            </div>
            <div>
              <label className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>Sub-Deadlines</label>
              <div className="flex gap-3 mb-3">
                <input value={newInput} onChange={e => setNewInput(e.target.value)} placeholder="Milestone name" className="input-glass flex-1" />
                <input type="date" value={newSubDate} onChange={e => setNewSubDate(e.target.value)} className="input-glass" style={{ width: 'auto' }} />
                <button onClick={() => {
                  if (!newInput.trim()) return;
                  updateGoal(activeGoal.id, { subDeadlines: [...activeGoal.subDeadlines, { id: Date.now().toString(), text: newInput, date: newSubDate }] });
                  setNewInput(''); setNewSubDate('');
                }} className="btn-primary"><Plus size={18}/></button>
              </div>
              {activeGoal.subDeadlines.map((sd, i) => (
                <div key={sd.id} className="glass-card p-3 flex justify-between items-center mb-2">
                  <span className="text-sm">{sd.text} <span style={{ color: 'var(--text-muted)' }}>· {sd.date || 'No date'}</span></span>
                  <button onClick={() => updateGoal(activeGoal.id, { subDeadlines: activeGoal.subDeadlines.filter((_, j) => j !== i) })}
                    style={{ color: 'var(--accent-rose)' }}><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 2 && renderListEditor('whyBenefits', 'Enter a benefit of achieving this goal...')}
        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="section-label">Internal Obstacles</div>
              {renderListEditor('obstaclesInternal', 'e.g., Fear of failure...')}
            </div>
            <div>
              <div className="section-label">External Obstacles</div>
              {renderListEditor('obstaclesExternal', 'e.g., Lack of funding...')}
            </div>
          </div>
        )}
        {step === 4 && renderListEditor('skillGaps', 'e.g., Learn public speaking...')}
        {step === 5 && renderListEditor('people', 'e.g., Business mentor...')}
        {step === 6 && (
          <div className="space-y-2">
            {activeGoal.masterPlan.map((item, i) => (
              <div key={item.id} className="glass-card p-3 flex items-center gap-3">
                <button onClick={() => {
                  const plan = [...activeGoal.masterPlan];
                  plan[i] = { ...plan[i], done: !plan[i].done };
                  updateGoal(activeGoal.id, { masterPlan: plan });
                }} className="w-6 h-6 rounded flex items-center justify-center transition-all flex-shrink-0"
                  style={item.done ? { background: 'var(--accent-sage-dim)', color: 'var(--accent-sage)' } : { background: 'var(--bg-card-hover)' }}>
                  {item.done && <Check size={14}/>}
                </button>
                <span className="text-sm" style={item.done ? { textDecoration: 'line-through', color: 'var(--text-muted)' } : {}}>
                  <span className="tag mr-2">P{item.priority}</span> {item.text}
                </span>
              </div>
            ))}
            {activeGoal.masterPlan.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Complete previous steps to generate your plan.</p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button onClick={() => goToStep(Math.max(0, step - 1))} className="btn-ghost flex items-center gap-1" disabled={step === 0}>
          <ChevronLeft size={16}/> Previous
        </button>
        <button onClick={() => goToStep(Math.min(6, step + 1))} className="btn-primary flex items-center gap-1" disabled={step === 6}>
          Next <ChevronRight size={16}/>
        </button>
      </div>
    </div>
  );
}
